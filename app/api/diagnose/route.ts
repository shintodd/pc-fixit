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

    const history: Array<{ role: "user" | "assistant"; content: string }> = [];
    for (const item of rawHistory) {
      if (!item || typeof item !== "object") continue;
      const role =
        item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      if (!role) continue;
      const content = typeof item.content === "string" ? item.content : "";
      history.push({ role, content });
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

    // Instant socket probe (7ms) to determine if Postgres is running
    const isPostgresRunning = await isDatabaseAvailable(150);

    if (cleanSearchQuery.length > 0 && isPostgresRunning) {
      try {
        // SEC-01: strictly filter by verified = true or vetted source = 'researched' to prevent KB poisoning
        // Incorporates symptoms text array into tsvector to maximize troubleshooting recall
        issueMatches = await prisma.$queryRaw<typeof issueMatches>`
          SELECT slug, title, summary, severity, fix_steps,
                 ts_rank(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, '')), plainto_tsquery('english', ${cleanSearchQuery})) as rank
          FROM issues
          WHERE (verified = true OR source = 'researched')
            AND to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, '')) @@ plainto_tsquery('english', ${cleanSearchQuery})
          ORDER BY rank DESC
          LIMIT 5;
        `;
      } catch (err: any) {
        console.warn("Issue FTS query bypassed:", err.message);
      }

      try {
        // SEC-01: filter error codes by verified or vetted source
        errorCodeMatches = await prisma.$queryRaw<typeof errorCodeMatches>`
          SELECT code, name, explanation, fix_guide,
                 ts_rank(to_tsvector('english', coalesce(name, '') || ' ' || coalesce(explanation, '')), plainto_tsquery('english', ${cleanSearchQuery})) as rank
          FROM error_codes
          WHERE (verified = true OR source = 'researched')
            AND to_tsvector('english', coalesce(name, '') || ' ' || coalesce(explanation, '')) @@ plainto_tsquery('english', ${cleanSearchQuery})
          ORDER BY rank DESC
          LIMIT 5;
        `;
      } catch (err: any) {
        console.warn("ErrorCode FTS query bypassed:", err.message);
      }
    }

    // In-memory grounding fallback (instant 0ms retrieval if database is offline or not yet migrated)
    if (issueMatches.length === 0 && errorCodeMatches.length === 0 && cleanSearchQuery.length > 0) {
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
          .slice(0, 5);

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

    // 5. Build Dual-Role System Prompt
    let referenceSection = "";
    if (hasGoodDbMatches) {
      referenceSection = "REFERENCE FACTS FROM KNOWLEDGE BASE:\n";
      if (issueMatches.length > 0) {
        issueMatches.forEach((item, idx) => {
          referenceSection += `\n[Guide ${idx + 1}] Title: ${item.title}\nSummary: ${item.summary}\nFix Steps: ${
            Array.isArray(item.fix_steps)
              ? item.fix_steps.map((s: any) => `${s.title}: ${s.detail}`).join("; ")
              : JSON.stringify(item.fix_steps)
          }\n`;
        });
      }
      if (errorCodeMatches.length > 0) {
        errorCodeMatches.forEach((code) => {
          referenceSection += `\n- Code ${code.code} (${code.name}): ${code.explanation}. Fix: ${code.fix_guide}\n`;
        });
      }
    } else {
      referenceSection =
        "REFERENCE FACTS FROM KNOWLEDGE BASE:\nNo local guide matched this exact query. Provide general, easy-to-follow computer troubleshooting steps.";
    }

    const langInstruction =
      lang === "ms"
        ? `5. GAYA BAHASA & NADA (ABANG TECHNICIAN PC MALAYSIA PALING MESRA & SANTAI):
   - ANDA ADALAH "ABANG / KAWAN TECHNICIAN PC" YANG PALING RAMAH, PENYABAR, SELESA DISEMBANG, DAN SANGAT MEMBANTU.
   - PENTING: Mula setiap jawapan dengan 1 baris ayat mesra yang menenangkan pengguna (contoh: "Relaks bos, jangan panik ya! Benda ni biasa sangat jadi dan selalunya mudah je nak setel. Jom kita check sama-sama:" atau "Faham sangat, memang pening bila PC buat hal macam ni kan. Jom kita cuba troubleshoot langkah asas dulu:").
   - Bercakap dalam Bahasa Melayu santai harian (Bahasa Melayu pasar yang mesra seperti technician berbual santai dengan pelanggan di meja bengkel).
   - JANGAN sekali-kali guna bahasa buku teks rasmi atau istilah Indonesia yang kaku (ELAKKAN: 'papan induk', 'wayar kuasa', 'bicu', 'persimpangan termal', 'peranti penyesuai', 'menderu').
   - Guna istilah harian yang orang Malaysia biasa guna: 'motherboard', 'kabel power', 'cucuk kabel sampai rapat', 'cabut balik', 'screen hitam', 'tak keluar display', 'restart PC', 'kipas pusing', 'bateri CMOS', 'sangkut / hang / lag', 'grafik kad / GPU', 'casing'.
   - Istilah standard PC kekalkan dalam BI: RAM, GPU, CPU, USB, HDMI, DisplayPort, BIOS, Windows, Safe Mode, SSD, Task Manager.
   - Terangkan bahagian PC dengan jelas untuk orang yang tiada latar belakang teknikal (nyatakan rupa dan lokasinya).
   - Berikan langkah bernombor (1., 2., 3.) yang padat dan mudah dibuat satu demi satu (bawah 200 patah perkataan).
   - Akhiri jawapan dengan soalan atau dorongan mesra: "Cuba test langkah ni dulu ya. Kalau masih tak jadi atau keluar apa-apa display lain, update saya balik kat sini. Kita cari punca sampai setel!"
   - Jika pengguna tanya di luar topik PC/laptop, tolak dengan nada santai & mesra: "Alamak, saya cuma pakar bab baiki PC dan laptop je bos! Ada apa-apa masalah komputer yang saya boleh tolong tengokkan?"`
        : `5. LANGUAGE & TONE (YOUR FRIENDLY NEIGHBORHOOD PC TECH):
   - You are the friendliest, warmest, most patient neighborhood PC repair technician.
   - CRITICAL: Always open with a reassuring 1-liner that eases anxiety (e.g. "Don't panic! This is actually super common and usually way easier to fix than it looks. Let's check a few quick things together:" or "I totally get how frustrating that is! Take a breath, and let's get this sorted out step by step:").
   - Speak like an encouraging, knowledgeable friend helping out over a workbench. Zero arrogance, zero robotic phrasing.
   - Break down fixes into clear, friendly numbered steps (1., 2., 3.) under 200 words.
   - End with an encouraging check-in: "Give those a try and let me know how it goes! If it's still acting up, tell me what you see and we will dig deeper together."
   - If user asks off-topic questions, politely and warmly redirect: "I specialize strictly in fixing PCs and laptops! If you've got any computer headaches, I'm right here to help you get them sorted."`;

    const systemPrompt = `You are PC Fixit, the friendliest, most encouraging, and patient PC repair technician in the world. You help everyday computer users who are stressed because their computer isn't working and who have zero technical background.

CRITICAL INSTRUCTIONS:
1. SCOPE GUARD:
   You ONLY help diagnose and fix PC/laptop hardware, operating system, networking, and software problems.
   If the user asks about anything else (e.g. poetry, stories, cooking, pets, general chat, unrelated coding), politely and warmly refuse: "I'm your dedicated PC repair technician and only focus on troubleshooting computers. Please describe a PC or laptop issue, and I'll gladly help you fix it!" Do not answer off-topic requests even partially.

2. REASSURING, EMPATHETIC & ULTRA-FRIENDLY:
   - Users are often anxious about broken components, losing data, or expensive repair bills.
   - Immediately reassure them that most PC problems are simple connections, switches, or basic settings!
   - Be patient, kind, and encourage them every step of the way.

3. SIMPLIFY & PUT THE MOST COMMON / EASIEST CHECKS FIRST:
   - Always start with the simplest, zero-risk, no-tools checks first (cables, power switches, monitor power, correct ports).
   - Example: For "no display / black screen", the #1 most common beginner mistake is plugging the monitor into the top motherboard port instead of the graphics card port at the bottom! Always suggest checking that first!
   - Only suggest opening the computer or checking internal parts as a later step if external checks fail.

4. ZERO UNEXPLAINED JARGON:
   - NEVER use unexplained technical acronyms or motherboard engineer speak. Do NOT say: "POST", "DIMM", "A2/B2", "AM5", "LGA 1700", "VMD", "TDR", "FTS".
   - Describe parts by what they look like and where they are:
     - RAM -> "memory sticks (the long rectangular cards snapped into your computer)"
     - Graphics card -> "the lower video port on the back of your computer (the graphics card), not the top one near the USB ports"
     - CMOS battery -> "the small silver coin battery on your motherboard"
     - Power supply switch -> "the rocker switch (marked I/O) on the back of the computer power box"
     - Boot / POST -> "the computer starting up"

5. FORMAT & BREVITY:
   - Keep answers concise, clear, and easy to read (under 200 words).
   - Use clean numbered steps: 1., 2., 3.
   - Do NOT dump multiple massive scenarios or long essays. Give the most likely fixes first.

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

    // Format chat history for Gemini contents
    const contents = history.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const config: any = {
      systemInstruction: systemPrompt,
    };

    if (pathUsed === "live_search") {
      config.tools = [{ googleSearch: {} }];
    }

    const candidateModels = [
      modelName,
      "gemini-3.6-flash",
      "gemini-3.5-flash-lite",
    ].filter((v, i, a) => a.indexOf(v) === i);

    const wantsStream = req.nextUrl.searchParams.get("stream") === "true";
    let isRateLimited = false;

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
