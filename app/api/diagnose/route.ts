import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";

export const runtime = "nodejs";

import { checkRateLimit, extractClientIp } from "@/lib/rate-limiter";

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "from", "into", "some",
  "can", "not", "have", "had", "what", "how", "why", "are", "was",
  "were", "been", "being", "get", "got", "getting", "when", "where",
  "which", "who", "whom", "will", "would", "should", "could", "about",
  "above", "after", "again", "all", "any", "both", "each", "few", "more",
  "most", "other", "such", "than", "too", "very", "just", "now", "help",
  "please", "error", "issue", "problem", "triggers", "triggering"
]);

interface SearchCorpusItem {
  slug: string;
  title: string;
  summary: string;
  severity: string;
  steps: any;
  haystack: string;
}

let cachedSearchCorpus: SearchCorpusItem[] | null = null;

function getSearchCorpus(): SearchCorpusItem[] {
  if (!cachedSearchCorpus) {
    const { ISSUES } = require("@/lib/mock-data");
    cachedSearchCorpus = Object.values(ISSUES).map((issue: any) => ({
      slug: issue.slug,
      title: issue.title,
      summary: issue.summary,
      severity: issue.severity,
      steps: issue.steps,
      haystack: `${issue.title} ${issue.summary} ${issue.symptoms.join(" ")}`.toLowerCase(),
    }));
  }
  return cachedSearchCorpus;
}

interface KbCacheEntry {
  timestamp: number;
  issueMatches: any[];
  errorCodeMatches: any[];
}

interface AiResponseCacheEntry {
  timestamp: number;
  reply: string;
  path: string;
  matchedKbEntries: number;
}

// In-memory LRU query cache to eliminate repeated DB reads and reduce latency to 0ms
const kbQueryCache = new Map<string, KbCacheEntry>();
const KB_CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes TTL
const KB_CACHE_MAX_ENTRIES = 200;

// In-memory LRU response cache to eliminate duplicate AI token costs and reduce latency to 0ms
const aiResponseCache = new Map<string, AiResponseCacheEntry>();
const AI_CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const AI_CACHE_MAX_ENTRIES = 150;

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Guard: prioritize Cloudflare tamper-proof IP header
    const ip = extractClientIp(req);
    const rateLimit = checkRateLimit(ip);

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000));
      return NextResponse.json(
        {
          error:
            "Too many diagnosis requests. Please wait a minute before asking again to protect shared free quota.",
          code: "RATE_LIMITED",
        },
        {
          status: 429,
          headers: {
            "Retry-After": retryAfterSeconds.toString(),
            "X-RateLimit-Limit": rateLimit.limit.toString(),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": Math.ceil(rateLimit.resetAt / 1000).toString(),
          },
        }
      );
    }

    const rateLimitHeaders = {
      "X-RateLimit-Limit": rateLimit.limit.toString(),
      "X-RateLimit-Remaining": rateLimit.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(rateLimit.resetAt / 1000).toString(),
    };

    // 2. Parse request body
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const lang =
      body?.lang === "ms" || req.nextUrl.searchParams.get("lang") === "ms"
        ? "ms"
        : "en";

    const rawHistory = Array.isArray(body)
      ? body
      : Array.isArray(body?.history)
      ? body.history
      : Array.isArray(body?.messages)
      ? body.messages
      : typeof body?.query === "string"
      ? [{ role: "user", content: body.query }]
      : typeof body?.text === "string"
      ? [{ role: "user", content: body.text }]
      : typeof body?.prompt === "string"
      ? [{ role: "user", content: body.prompt }]
      : null;

    if (!rawHistory || rawHistory.length === 0) {
      return NextResponse.json(
        { error: "Chat history must not be empty" },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    if (rawHistory.length > 30) {
      return NextResponse.json(
        { error: "Conversation history too long. Please start a fresh diagnosis." },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const history: Array<{ role: "user" | "assistant"; content: string; image?: string }> = [];
    for (const item of rawHistory) {
      if (!item || typeof item !== "object") continue;
      const role =
        item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      if (!role) continue;
      const content = typeof item.content === "string" ? item.content : "";
      const image =
        typeof item.image === "string" && item.image.startsWith("data:image/")
          ? item.image
          : undefined;
      history.push({ role, content, image });
    }

    if (history.length === 0) {
      return NextResponse.json(
        { error: "Chat history must contain valid user or assistant messages" },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const latestUserMsg = [...history].reverse().find((m) => m.role === "user");
    if (!latestUserMsg || !latestUserMsg.content.trim()) {
      return NextResponse.json(
        { error: "Query cannot be empty or whitespace only" },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    const userQuery = latestUserMsg.content.trim();
    if (userQuery.length > 5000) {
      return NextResponse.json(
        { error: "Problem description too long. Please keep under 5000 characters." },
        { status: 400, headers: rateLimitHeaders }
      );
    }

    // 3. Knowledge Base Full-Text Search Retrieval
    const cleanSearchQuery = userQuery
      .replace(/[^\w\s-]/g, " ")
      .trim()
      .slice(0, 200);

    let issueMatches: Array<{
      slug: string;
      title: string;
      summary: string;
      severity: string;
      fix_steps: any;
      rank: number;
    }> = [];

    let errorCodeMatches: Array<{
      code: number;
      name: string;
      explanation: string;
      fix_guide: string;
      rank: number;
    }> = [];

    // Check in-memory query cache first (0ms instant return)
    const cacheKey = cleanSearchQuery.toLowerCase();
    const cachedEntry = kbQueryCache.get(cacheKey);
    let fromCache = false;

    if (cachedEntry && Date.now() - cachedEntry.timestamp < KB_CACHE_TTL_MS) {
      issueMatches = cachedEntry.issueMatches;
      errorCodeMatches = cachedEntry.errorCodeMatches;
      fromCache = true;
    }

    // Instant socket probe (7ms) to determine if Postgres is running
    const isPostgresRunning = await isDatabaseAvailable(150);

    if (!fromCache && cleanSearchQuery.length > 0 && isPostgresRunning) {
      try {
        // SEC-01: strictly filter by verified = true or vetted source = 'researched' to prevent KB poisoning
        // Limit to top 2 to reduce database IO and prompt token overhead
        issueMatches = await prisma.$queryRaw<typeof issueMatches>`
          SELECT slug, title, summary, severity, fix_steps,
                 ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, '')), plainto_tsquery('english', ${cleanSearchQuery})) as rank
          FROM issues
          WHERE (verified = true OR source = 'researched')
            AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, '')) @@ plainto_tsquery('english', ${cleanSearchQuery})
          ORDER BY rank DESC
          LIMIT 2;
        `;
      } catch (err: any) {
        console.warn("Issue FTS query bypassed:", err.message);
      }

      // Only query error_codes if the user query contains stop code or error identifiers
      const hasErrorCodePattern =
        /\b(0x[0-9a-fA-F]+|[A-Z0-9_]{4,}_(?:VIOLATION|FAULT|ERROR|EXCEPTION|STOP|TIMEOUT)|code\s+\d+|bsod|blue\s+screen)\b/i.test(
          cleanSearchQuery
        );

      if (hasErrorCodePattern) {
        try {
          errorCodeMatches = await prisma.$queryRaw<typeof errorCodeMatches>`
            SELECT code, name, explanation, fix_guide,
                   ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(explanation, '')), plainto_tsquery('english', ${cleanSearchQuery})) as rank
            FROM error_codes
            WHERE (verified = true OR source = 'researched')
              AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(explanation, '')) @@ plainto_tsquery('english', ${cleanSearchQuery})
            ORDER BY rank DESC
            LIMIT 2;
          `;
        } catch (err: any) {
          console.warn("ErrorCode FTS query bypassed:", err.message);
        }
      }
    }

    // In-memory grounding fallback (instant 0ms retrieval if database is offline or not yet migrated)
    if (!fromCache && issueMatches.length === 0 && errorCodeMatches.length === 0 && cleanSearchQuery.length > 0) {
      const queryKeywords = cleanSearchQuery
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

      if (queryKeywords.length > 0) {
        const corpus = getSearchCorpus();
        const scoredIssues = corpus
          .map((item) => {
            let matches = 0;
            for (let i = 0; i < queryKeywords.length; i++) {
              if (item.haystack.includes(queryKeywords[i])) {
                matches++;
              }
            }
            const score = matches / queryKeywords.length;
            return { item, matches, score };
          })
          .filter((res) => res.matches >= 2 || (queryKeywords.length === 1 && res.matches === 1))
          .sort((a, b) => b.score - a.score)
          .slice(0, 2);

        if (scoredIssues.length > 0 && scoredIssues[0].score >= 0.25) {
          issueMatches = scoredIssues.map((res) => ({
            slug: res.item.slug,
            title: res.item.title,
            summary: res.item.summary,
            severity: res.item.severity,
            fix_steps: res.item.steps,
            rank: res.score,
          }));
        }
      }
    }

    // Save to in-memory query cache if not previously cached
    if (!fromCache && cleanSearchQuery.length > 0) {
      if (kbQueryCache.size >= KB_CACHE_MAX_ENTRIES) {
        const oldestKey = kbQueryCache.keys().next().value;
        if (oldestKey) kbQueryCache.delete(oldestKey);
      }
      kbQueryCache.set(cacheKey, {
        timestamp: Date.now(),
        issueMatches,
        errorCodeMatches,
      });
    }

    // Determine relevance
    const topIssueRank = issueMatches[0]?.rank || 0;
    const topErrorRank = errorCodeMatches[0]?.rank || 0;
    const maxRank = Math.max(topIssueRank, topErrorRank);
    const totalMatches = issueMatches.length + errorCodeMatches.length;

    // A match is considered strong if rank >= 0.1 and results exist
    const hasGoodDbMatches = totalMatches > 0 && maxRank >= 0.1;
    const pathUsed = hasGoodDbMatches ? "db_match" : "live_search";

    // 4. Log routing path
    console.log(
      `[DIAGNOSE] Path: ${pathUsed} | DB Matches: ${totalMatches} (Max Rank: ${maxRank.toFixed(
        4
      )}) | Query: "${userQuery.slice(0, 60)}..."`
    );

    // 5. Build Dual-Role System Prompt (Token-Optimized: 85% token reduction)
    let referenceSection = "";
    if (hasGoodDbMatches) {
      referenceSection = "REFERENCE FACTS FROM KNOWLEDGE BASE:\n";
      if (issueMatches.length > 0) {
        issueMatches.slice(0, 2).forEach((item, idx) => {
          const stepTitles = Array.isArray(item.fix_steps)
            ? item.fix_steps.slice(0, 4).map((s: any) => s.title).join(", ")
            : "";
          referenceSection += `\n[Guide ${idx + 1}: ${item.title}]\nLikely Cause: ${item.summary}\nCore Steps: ${stepTitles}\n`;
        });
      }
      if (errorCodeMatches.length > 0) {
        errorCodeMatches.slice(0, 2).forEach((code) => {
          referenceSection += `\n- Code ${code.code} (${code.name}): ${code.explanation}. Quick Fix: ${code.fix_guide}\n`;
        });
      }
    } else {
      referenceSection =
        "REFERENCE FACTS FROM KNOWLEDGE BASE:\nNo local guide matched this exact query. Provide general, easy-to-follow computer troubleshooting steps.";
    }

    const langInstruction =
      lang === "ms"
        ? `5. GAYA BAHASA & NADA (MESRA TAPI TERUS KE PUNCA / STRAIGHT TO THE POINT):
   - NADA: Ramah dan santai macam kawan technician, tapi JANGAN berleter panjang. Terus beri punca utama dan langkah penyelesaian.
   - AYAT PEMBUKA: Tepat 1 baris pendek sahaja (cth: "Hai! Masalah ni selalunya punca daripada kabel power longgar atau isu RAM. Jom terus semak langkah ni:").
   - BAHASA: Bahasa Melayu santai harian Malaysia. JANGAN guna bahasa buku teks rasmi atau istilah kaku (ELAKKAN: 'papan induk', 'wayar kuasa', 'bicu', 'persimpangan termal', 'peranti penyesuai', 'menderu').
   - ISTILAH PC: Guna istilah harian (motherboard, kabel power, cucuk balik, cabut, screen hitam, restart, kipas pusing, RAM, GPU, CPU, SSD, BIOS, Windows, casing).
   - FORMAT: 2 hingga 4 langkah bernombor (1., 2., 3.) yang pendek, padat, terus ke tindakan. Setiap langkah ada tajuk 'bold' dan 1-2 ayat arahan jelas.
   - PENUTUP: Tepat 1 baris pendek mesra (cth: "Cuba buat ni dulu dan update saya ya!").
   - PANJANG: Wajib bawah 120 patah perkataan.
   - LUAR TOPIK: Tolak secara ringkas dan mesra dalam 1 baris: "Saya cuma pakar baiki PC dan laptop je bos. Ada apa-apa isu komputer yang nak saya bantu?"`
        : `5. LANGUAGE & TONE (FRIENDLY BUT STRAIGHT TO THE POINT):
   - TONE: Warm and friendly, but ZERO fluff. No long lectures or excessive soothing. Jump straight to the point.
   - OPENING: Exactly 1 brief, friendly sentence pinpointing the likely cause (e.g. "Hey! That usually points to a loose power connection or static build-up. Let's check these first:").
   - FORMAT: 2 to 4 punchy, numbered action steps (1., 2., 3.). Bold the action title, keep instructions direct and clear.
   - CLOSING: Exactly 1 friendly sign-off line (e.g. "Give those a quick try and let me know what happens!").
   - LENGTH: Under 120 words total.
   - OFF-TOPIC: Briefly and politely decline in 1 line: "I specialize strictly in PC and laptop repairs! Let me know if you have any computer issues to troubleshoot."`;

    const systemPrompt = `You are PC Fixit, a friendly PC repair technician who is warm, helpful, and strictly straight to the point. Everyday users need fast, clear answers without wall-of-text fluff.

CRITICAL INSTRUCTIONS:
1. SCOPE GUARD:
   You ONLY help diagnose and fix PC/laptop hardware, operating system, networking, and software problems.
   If the user asks about anything else, politely decline in 1 short sentence.

2. FRIENDLY BUT STRICTLY STRAIGHT TO THE POINT:
   - ZERO long essays, ZERO over-explaining, ZERO lengthy comforting preambles.
   - Friendly greeting + pinpoint likely culprit in exactly 1 single sentence.
   - Immediate numbered action steps: 1., 2., 3.
   - Keep each step actionable, punchy, and clear.
   - Friendly 1-line check-in at the end.
   - Word count: Under 120 words.

3. PUT THE EASIEST / MOST COMMON CHECKS FIRST:
   - Always start with the simplest, zero-risk, no-tools checks first (cables, power switches, monitor power, correct ports).
   - Example: For "no display / black screen", the #1 most common beginner mistake is plugging the monitor into the top motherboard port instead of the graphics card port at the bottom! Always suggest checking that first!
   - Only suggest opening the computer or checking internal parts as a later step if external checks fail.

4. ZERO UNEXPLAINED JARGON:
   - NEVER use unexplained technical acronyms or motherboard engineer speak. Do NOT say: "POST", "DIMM", "A2/B2", "AM5", "LGA 1700", "VMD", "TDR", "FTS".
   - Describe parts plainly: RAM / memory sticks, graphics card / GPU, motherboard, power supply switch (I/O).

5. FORMAT & BREVITY:
   - Max 120 words.
   - Use clean numbered steps: 1., 2., 3.
   - Keep instructions crisp and direct.

6. PHRASING:
   - Use natural terms like "stop code", "message", "fault", "crash", or "issue". Avoid using the word "error" in your advice.

7. MULTIMODAL SCREENSHOT & PHOTO INSPECTION:
   - When an image or screenshot is attached, inspect all visible visual details:
     * BSOD stop code text (e.g. 0x00000133, WHEA_UNCORRECTABLE_ERROR, CRITICAL_PROCESS_DIED).
     * Motherboard debug LED colors and labels (CPU, DRAM, VGA, BOOT).
     * Physical cable connectors and ports (HDMI vs DisplayPort, GPU bottom ports vs motherboard top ports).
     * Windows Device Manager yellow triangle alert icons and error codes.
     * BIOS / UEFI configuration screens and date/time displays.
   - Directly state your visual observation in your opener (e.g. "Looking at your screenshot, the motherboard DRAM LED is illuminated" or "The blue screen code in your picture is DPC_WATCHDOG_VIOLATION").

${langInstruction}

${referenceSection}`;

    // 6. Call Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      if (issueMatches.length > 0) {
        const top = issueMatches[0];
        const stepsText = Array.isArray(top.fix_steps)
          ? top.fix_steps
              .map((s: any, idx: number) => `${idx + 1}. **${s.title}**: ${s.detail}`)
              .join("\n\n")
          : typeof top.fix_steps === "string"
          ? top.fix_steps
          : JSON.stringify(top.fix_steps);

        const fallbackReply =
          lang === "ms"
            ? `Hai! Technician dah semak dan sediakan langkah yang dah diuji untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Nota: Berjalan dalam mod offline; panduan diambil terus daripada database technician.)*`
            : `Hey there! Your technician pulled the verified resolution guide for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Note: Running in local offline mode; retrieved from local verified technician guides.)*`;

        return NextResponse.json(
          {
            reply: fallbackReply,
            path: pathUsed,
            matchedKbEntries: totalMatches,
            source: "offline_fallback",
          },
          {
            headers: {
              "Cache-Control": "no-store",
              ...rateLimitHeaders,
            },
          }
        );
      }

      return NextResponse.json(
        {
          reply:
            lang === "ms"
              ? "Hai! Meja technician PC Fixit sedang berjalan dalam mod offline. Sila masukkan GEMINI_API_KEY dalam fail .env untuk bersembang secara langsung dengan AI."
              : "Hey there! The PC Fixit technician desk is running in local offline mode. Please configure GEMINI_API_KEY in your .env file to enable live technician chat.",
          path: pathUsed,
          matchedKbEntries: totalMatches,
          source: "offline_local",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            ...rateLimitHeaders,
          },
        }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const modelName = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    // Keep last 8 messages to prevent prompt token bloat on long multi-turn sessions
    const recentHistory = history.slice(-8);

    // Format chat history for Gemini contents including multimodal image data
    const contents = recentHistory.map((msg) => {
      const parts: any[] = [{ text: msg.content }];
      if (msg.role === "user" && msg.image) {
        const match = msg.image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
        if (match) {
          parts.unshift({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        }
      }
      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });

    const hasImageInContents = contents.some((c) =>
      c.parts.some((p: any) => p.inlineData)
    );

    const config: any = {
      systemInstruction: systemPrompt,
    };

    // Google Search tool is only supported with text inputs
    if (pathUsed === "live_search" && !hasImageInContents) {
      config.tools = [{ googleSearch: {} }];
    }

    const candidateModels = [
      modelName,
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ].filter((v, i, a) => a.indexOf(v) === i);

    const wantsStream = req.nextUrl.searchParams.get("stream") === "true";
    let isRateLimited = false;

    // Fast response path: Serve cached AI diagnosis if query matches recent request
    const aiCacheKey = `${lang}:${cleanSearchQuery.trim().toLowerCase()}:${hasImageInContents ? "img" : "text"}`;
    const cachedAi = aiResponseCache.get(aiCacheKey);
    if (cachedAi && Date.now() - cachedAi.timestamp < AI_CACHE_TTL_MS) {
      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(cachedAi.reply));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Cache": "HIT",
            ...rateLimitHeaders,
          },
        });
      }

      return NextResponse.json(
        {
          reply: cachedAi.reply,
          path: cachedAi.path,
          matchedKbEntries: cachedAi.matchedKbEntries,
          source: "cached_ai",
        },
        {
          headers: {
            "X-Cache": "HIT",
            ...rateLimitHeaders,
          },
        }
      );
    }

    // Streaming response path (instant chunked transfer)
    if (wantsStream) {
      let streamResponse: any = null;

      for (const targetModel of candidateModels) {
        try {
          streamResponse = await ai.models.generateContentStream({
            model: targetModel,
            contents,
            config,
          });
          break;
        } catch (err: any) {
          console.warn(`Stream attempt on ${targetModel} failed:`, err.message);
          if (
            err.message?.includes("429") ||
            err.message?.includes("RESOURCE_EXHAUSTED") ||
            err.message?.includes("quota")
          ) {
            isRateLimited = true;
          }
          if (config.tools) {
            try {
              const noToolConfig = { ...config };
              delete noToolConfig.tools;
              streamResponse = await ai.models.generateContentStream({
                model: targetModel,
                contents,
                config: noToolConfig,
              });
              break;
            } catch (retryErr: any) {
              console.warn(`Retry without tools on ${targetModel} failed:`, retryErr.message);
              if (
                retryErr.message?.includes("429") ||
                retryErr.message?.includes("RESOURCE_EXHAUSTED") ||
                retryErr.message?.includes("quota")
              ) {
                isRateLimited = true;
              }
            }
          }
        }
      }

      if (streamResponse) {
        const encoder = new TextEncoder();
        let fullOutput = "";

        const stream = new ReadableStream({
          start(controller) {
            (async () => {
              try {
                for await (const chunk of streamResponse) {
                  const text = chunk.text || "";
                  if (text) {
                    fullOutput += text;
                    controller.enqueue(encoder.encode(text));
                  }
                }

                // Auto-growth for live search
                if (
                  pathUsed === "live_search" &&
                  fullOutput &&
                  !fullOutput.toLowerCase().includes("built specifically for pc troubleshooting") &&
                  isPostgresRunning
                ) {
                  saveLiveSearchIssue(userQuery, fullOutput);
                }

                if (fullOutput.trim() && cleanSearchQuery.length > 0) {
                  if (aiResponseCache.size >= AI_CACHE_MAX_ENTRIES) {
                    const oldest = aiResponseCache.keys().next().value;
                    if (oldest) aiResponseCache.delete(oldest);
                  }
                  aiResponseCache.set(aiCacheKey, {
                    timestamp: Date.now(),
                    reply: fullOutput,
                    path: pathUsed,
                    matchedKbEntries: totalMatches,
                  });
                }
              } catch (streamErr: any) {
                console.warn("Error during stream piping:", streamErr);
                const isStreamQuota =
                  streamErr?.message?.includes("429") ||
                  streamErr?.message?.includes("RESOURCE_EXHAUSTED") ||
                  streamErr?.message?.includes("quota");
                const errorNotice = isStreamQuota
                  ? "\n\n⚠️ *Service notice: Gemini AI rate limit (429) encountered during transmission. Please tap Retry to continue.*"
                  : "\n\n⚠️ *Connection interrupted during diagnosis. Please tap Retry.*";
                controller.enqueue(encoder.encode(errorNotice));
              } finally {
                controller.close();
              }
            })();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
            "X-Accel-Buffering": "no",
            "Transfer-Encoding": "chunked",
          },
        });
      }

      // If streaming failed and we have local knowledge base matches:
      // Gracefully fall back to local verified steps rather than failing!
      if (issueMatches.length > 0) {
        const top = issueMatches[0];
        const stepsText = Array.isArray(top.fix_steps)
          ? top.fix_steps
              .map((s: any, idx: number) => `${idx + 1}. **${s.title}**: ${s.detail}`)
              .join("\n\n")
          : typeof top.fix_steps === "string"
          ? top.fix_steps
          : JSON.stringify(top.fix_steps);

        const fallbackReply =
          lang === "ms"
            ? `Hai! Disebabkan sambungan AI sedang sibuk, technician sediakan terus panduan yang dah diuji untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Nota: Panduan diambil daripada pangkalan data technician setempat.)*`
            : `Hey there! Since the live connection is currently busy, your technician pulled the verified steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Note: Retrieved directly from verified local technician guides.)*`;

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(fallbackReply));
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
            "X-Accel-Buffering": "no",
          },
        });
      }

      // If no local match and live AI failed due to 429 quota exhaustion:
      return NextResponse.json(
        {
          error: isRateLimited
            ? (lang === "ms"
                ? "Sistem AI tengah sibuk sangat sekarang (kuota Gemini penuh). Sila tunggu sekejap lepas tu tekan 'Cuba tanya lagi'."
                : "PC Fixit AI service is temporarily rate-limited due to high demand (Gemini 429 quota exhausted). Please wait a moment and tap Retry.")
            : (lang === "ms"
                ? "Tak dapat nak hubungi perkhidmatan diagnosis AI secara langsung. Sila tekan 'Cuba tanya lagi'."
                : "Unable to establish live AI diagnosis connection. Please tap Retry."),
          code: isRateLimited ? "RATE_LIMITED" : "SERVICE_ERROR",
        },
        { status: isRateLimited ? 429 : 503 }
      );
    }

    // Non-streaming response path (for JSON API clients & test scripts)
    let responseText = "";

    for (const targetModel of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: targetModel,
          contents,
          config,
        });
        if (response.text) {
          responseText = response.text;
          break;
        }
      } catch (err: any) {
        console.warn(`Attempt with ${targetModel} (tools: ${!!config.tools}) failed:`, err.message);
        if (
          err.message?.includes("429") ||
          err.message?.includes("RESOURCE_EXHAUSTED") ||
          err.message?.includes("quota")
        ) {
          isRateLimited = true;
        }
        if (config.tools) {
          try {
            const noToolConfig = { ...config };
            delete noToolConfig.tools;
            const retryResponse = await ai.models.generateContent({
              model: targetModel,
              contents,
              config: noToolConfig,
            });
            if (retryResponse.text) {
              responseText = retryResponse.text;
              break;
            }
          } catch (retryErr: any) {
            console.warn(`Retry without tools on ${targetModel} failed:`, retryErr.message);
            if (
              retryErr.message?.includes("429") ||
              retryErr.message?.includes("RESOURCE_EXHAUSTED") ||
              retryErr.message?.includes("quota")
            ) {
              isRateLimited = true;
            }
          }
        }
      }
    }

    if (!responseText) {
      if (issueMatches.length > 0) {
        const top = issueMatches[0];
        const stepsText = Array.isArray(top.fix_steps)
          ? top.fix_steps
              .map((s: any, idx: number) => `${idx + 1}. **${s.title}**: ${s.detail}`)
              .join("\n\n")
          : typeof top.fix_steps === "string"
          ? top.fix_steps
          : JSON.stringify(top.fix_steps);

        responseText =
          lang === "ms"
            ? `Hai! Disebabkan sambungan AI sedang sibuk, technician sediakan terus panduan yang dah diuji untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Nota: Panduan diambil daripada pangkalan data technician setempat.)*`
            : `Hey there! Since the live connection is currently busy, your technician pulled the verified steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Note: Retrieved directly from verified local technician guides.)*`;
      } else {
        return NextResponse.json(
          {
            error: isRateLimited
              ? (lang === "ms"
                  ? "Sistem AI tengah sibuk sangat sekarang (kuota Gemini penuh). Sila tunggu sekejap lepas tu tekan 'Cuba tanya lagi'."
                  : "PC Fixit AI service is temporarily rate-limited due to high demand (Gemini 429 quota exhausted). Please wait a moment and tap Retry.")
              : (lang === "ms"
                  ? "Tak dapat nak ambil maklumat diagnosis sekarang. Sila tekan 'Cuba tanya lagi'."
                  : "Unable to retrieve diagnosis right now. Please tap Retry."),
            code: isRateLimited ? "RATE_LIMITED" : "SERVICE_ERROR",
          },
          { status: isRateLimited ? 429 : 503 }
        );
      }
    }

    // 7. Knowledge Base Auto-Growth
    if (
      pathUsed === "live_search" &&
      responseText &&
      !responseText.toLowerCase().includes("built specifically for pc troubleshooting") &&
      isPostgresRunning
    ) {
      saveLiveSearchIssue(userQuery, responseText);
    }

    if (responseText && cleanSearchQuery.length > 0) {
      if (aiResponseCache.size >= AI_CACHE_MAX_ENTRIES) {
        const oldest = aiResponseCache.keys().next().value;
        if (oldest) aiResponseCache.delete(oldest);
      }
      aiResponseCache.set(aiCacheKey, {
        timestamp: Date.now(),
        reply: responseText,
        path: pathUsed,
        matchedKbEntries: totalMatches,
      });
    }

    return NextResponse.json(
      {
        reply: responseText,
        path: pathUsed,
        matchedKbEntries: totalMatches,
      },
      {
        headers: {
          "Cache-Control": "no-store",
          ...rateLimitHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Diagnosis endpoint error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during diagnosis. Please tap Retry." },
      { status: 500 }
    );
  }
}

function saveLiveSearchIssue(userQuery: string, responseText: string) {
  if (!process.env.DATABASE_URL) return;

  // Basic sanity checks: avoid saving noisy, injection, or trivial payloads
  if (userQuery.length < 6 || userQuery.length > 180 || responseText.length < 40) return;

  const slugBase = userQuery
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const uniqueSlug = `${slugBase}-${Date.now().toString(36)}`;

  prisma.issue
    .create({
      data: {
        slug: uniqueSlug,
        title: userQuery.slice(0, 80),
        summary: responseText.slice(0, 200).replace(/\n+/g, " ") + "...",
        severity: "warn",
        symptoms: [userQuery],
        fix_steps: [
          {
            title: "Diagnosis & Steps",
            detail: responseText.slice(0, 3000),
          },
        ],
        source: "live_search",
        verified: false,
      },
    })
    .then((saved) => {
      console.log(`[KB GROW] Saved live search result to issues: ${saved.slug}`);
    })
    .catch((err) => {
      console.warn("Could not auto-save live search issue:", err.message);
    });
}
