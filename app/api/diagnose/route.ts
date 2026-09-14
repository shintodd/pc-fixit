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
  "please", "error", "issue", "problem", "triggers", "triggering",
  "computer", "turns", "turn", "turning", "stays", "stay", "staying",
  "make", "makes", "making", "take", "takes", "taking", "does", "did",
  "done", "tried", "trying", "look", "looks", "looking", "shows", "showing"
]);

const HIGH_VALUE_TECH_TOKENS = new Set([
  "dram", "vga", "cpu", "ram", "gpu", "bios", "uefi", "cmos", "nvme", "ssd", "hdd",
  "bsod", "wifi", "wlan", "ethernet", "bluetooth", "hdmi", "displayport", "psu",
  "post", "motherboard", "overheating", "artifact", "beeps",
  "asus", "msi", "gigabyte", "asrock", "qled", "qcode", "drdebug", "ezdebug",
  "nvidia", "amd", "radeon", "geforce", "arc", "tdr", "nvlddmkm", "amdkmdag",
  "igdkmdn64", "12vhpwr", "spaceinvaders", "vram", "smart", "vmd", "rst",
  "chkdsk", "dirtybit", "writeprotect", "unallocated", "dhcp", "apipa", "169254",
  "winsock", "netsh", "tcpip", "wifi6", "wifi6e", "wifi7", "mlo", "80211be", "tjmax", "prochot",
  "hysteresis", "transient", "excursion", "ocp", "opp"
]);

function extractKeywords(query: string): string[] {
  const normalized = query
    .toLowerCase()
    .replace(/\bwi[- ]?fi\s*6e?\b/g, "wifi6 wifi6e")
    .replace(/\bwi[- ]?fi\s*7\b/g, "wifi7")
    .replace(/\bwi[- ]?fi\b/g, "wifi")
    .replace(/\bblue[- ]?screen\b/g, "bluescreen")
    .replace(/\bno[- ]?boot\b/g, "wontboot")
    .replace(/\bno[- ]?display\b/g, "nodisplay")
    .replace(/\bshut[- ]?down\b/g, "shutdown")
    .replace(/\bturn(ing)?\s+on\b/g, "boot")
    .replace(/\bnot\s+turning\s+on\b/g, "wontboot")
    .replace(/\bq[- ]?code\b/g, "qcode")
    .replace(/\bez[- ]?debug\b/g, "ezdebug")
    .replace(/\bdr[\.-]?\s*debug\b/gi, "drdebug")
    .replace(/\b12v[- ]?2x6\b/g, "12vhpwr")
    .replace(/\b12v[- ]?hpwr\b/g, "12vhpwr")
    .replace(/\b12vhpwr\b/g, "12vhpwr")
    .replace(/\b169\.254(?:\.\d+\.\d+)?\b/g, "169254 apipa dhcp")
    .replace(/\btjmax\b/g, "tjmax throttle")
    .replace(/\btj[- ]?max\b/g, "tjmax throttle")
    .replace(/\bprochot\b/g, "prochot throttle")
    .replace(/\bproc[- ]?hot\b/g, "prochot throttle")
    .replace(/\bdebug\s+leds?\b/g, "debug led qled")
    .replace(/\bdriver\s+timeout\b/g, "driver timeout tdr")
    .replace(/\bpending\s+sectors?\b/g, "pending sector smart")
    .replace(/\bdirty\s+bits?\b/g, "dirty bit dirtybit smart")
    .replace(/\bwrite\s+protect(?:ed|ion)?\b/g, "write protect writeprotect smart")
    .replace(/\bself\s+assigned\b/g, "self assigned apipa 169254 dhcp")
    .replace(/\bspace\s+invaders?\b/g, "spaceinvaders")
    .replace(/[^a-z0-9\s]/g, " ");

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  const keywords: Set<string> = new Set();
  const VALID_SHORT_TERMS = new Set(["pc", "ip", "os", "ai", "ui", "io", "hd"]);

  for (const token of rawTokens) {
    if (STOP_WORDS.has(token)) continue;
    if (token.length > 2 || VALID_SHORT_TERMS.has(token)) {
      keywords.add(token);
      if (token.endsWith("ies") && token.length > 4) keywords.add(token.slice(0, -3) + "y");
      else if (token.endsWith("ing") && token.length > 5) keywords.add(token.slice(0, -3));
      else if (token.endsWith("ed") && token.length > 4) keywords.add(token.slice(0, -2));
      else if (token.endsWith("es") && token.length > 4) keywords.add(token.slice(0, -2));
      else if (token.endsWith("s") && !token.endsWith("ss") && token.length > 3) keywords.add(token.slice(0, -1));

      if (token === "wifi" || token === "wireless" || token === "wlan") {
        keywords.add("wifi");
        keywords.add("wireless");
        keywords.add("adapter");
        keywords.add("network");
      } else if (token.startsWith("disappear") || token === "missing" || token === "gone" || token === "lost" || token === "vanished") {
        keywords.add("disappear");
        keywords.add("disappears");
        keywords.add("disappeared");
        keywords.add("missing");
      } else if (token === "internet" || token === "ethernet" || token === "connection") {
        keywords.add("internet");
        keywords.add("network");
      } else if (token === "screen" || token === "display" || token === "monitor") {
        keywords.add("screen");
        keywords.add("display");
        keywords.add("monitor");
      } else if (token === "crash" || token === "freeze" || token === "restart" || token === "bsod" || token === "bluescreen") {
        keywords.add("crash");
        keywords.add("bsod");
      } else if (token === "slow" || token === "sluggish" || token === "lag") {
        keywords.add("slow");
        keywords.add("sluggish");
      } else if (token === "audio" || token === "sound" || token === "speaker" || token === "headphones") {
        keywords.add("audio");
        keywords.add("sound");
      }

      // Vendor debug synonym cluster: asus, msi, gigabyte, asrock, qled, qcode, debug led
      if (token === "drdebug" || token === "asrock") {
        keywords.add("asrock");
        keywords.add("drdebug");
        keywords.add("debug");
      } else if (token === "ezdebug" || token === "msi") {
        keywords.add("msi");
        keywords.add("ezdebug");
        keywords.add("debug");
      } else if (token === "qled" || token === "qcode" || token === "asus") {
        keywords.add("asus");
        keywords.add("qled");
        keywords.add("qcode");
        keywords.add("debug");
        keywords.add("led");
      } else if (token === "gigabyte") {
        keywords.add("gigabyte");
        keywords.add("debug");
      }

      // GPU TDR synonym cluster: isolate NVIDIA, AMD, and generic TDR
      if (token === "nvlddmkm" || token === "nvidia" || token === "geforce") {
        keywords.add("nvidia");
        keywords.add("nvlddmkm");
        keywords.add("tdr");
        keywords.add("timeout");
        keywords.add("driver");
      } else if (token === "amdkmdag" || token === "amd" || token === "radeon") {
        keywords.add("amd");
        keywords.add("radeon");
        keywords.add("amdkmdag");
        keywords.add("tdr");
        keywords.add("timeout");
        keywords.add("driver");
      } else if (token === "tdr") {
        keywords.add("tdr");
        keywords.add("timeout");
        keywords.add("driver");
      }

      // Storage synonym cluster: smart, reallocated, pending sector, vmd, dirty bit, write protect
      if (token === "smart" || token === "reallocated") {
        keywords.add("smart");
        keywords.add("reallocated");
        keywords.add("sector");
        keywords.add("pending");
      } else if (token === "vmd" || token === "rst") {
        keywords.add("vmd");
        keywords.add("rst");
        keywords.add("inaccessible");
      } else if (token === "dirtybit") {
        keywords.add("dirtybit");
        keywords.add("chkdsk");
        keywords.add("ntfs");
      } else if (token === "writeprotect") {
        keywords.add("writeprotect");
        keywords.add("readonly");
        keywords.add("lockout");
      }

      // Network synonym cluster: isolate Winsock and Netsh from APIPA and DHCP
      if (token === "apipa" || token === "169254" || token === "dhcp") {
        keywords.add("apipa");
        keywords.add("169254");
        keywords.add("dhcp");
        keywords.add("network");
      } else if (token === "winsock" || token === "netsh") {
        keywords.add("winsock");
        keywords.add("netsh");
        keywords.add("tcpip");
        keywords.add("network");
      }

      // Reset / Recovery synonym cluster
      if (token === "reset" || token === "recovery") {
        keywords.add("reset");
        keywords.add("recovery");
      }

      // Thermal/Power synonym cluster: tjmax, prochot, transient, trip, ocp, hysteresis
      if (token === "tjmax" || token === "prochot") {
        keywords.add("tjmax");
        keywords.add("prochot");
        keywords.add("throttle");
        keywords.add("thermal");
      } else if (token === "transient" || token === "trip" || token === "ocp" || token === "opp" || token === "excursion") {
        keywords.add("transient");
        keywords.add("trip");
        keywords.add("ocp");
        keywords.add("power");
        keywords.add("psu");
      } else if (token === "hysteresis") {
        keywords.add("hysteresis");
        keywords.add("curve");
        keywords.add("thermal");
      }
    }
  }

  return Array.from(keywords);
}

interface SearchCorpusItem {
  slug: string;
  title: string;
  summary: string;
  severity: string;
  category_slug?: string;
  steps: any;
  haystack: string;
}

let cachedSearchCorpus: SearchCorpusItem[] | null = null;

function getSearchCorpus(): SearchCorpusItem[] {
  if (!cachedSearchCorpus) {
    const { ISSUES } = require("@/lib/mock-data");
    cachedSearchCorpus = Object.values(ISSUES).map((issue: any) => {
      const normalizedTitle = issue.title.toLowerCase().replace(/\bwi[- ]?fi\b/g, "wifi");
      const normalizedSummary = issue.summary.toLowerCase().replace(/\bwi[- ]?fi\b/g, "wifi");
      const normalizedSymptoms = (issue.symptoms || [])
        .join(" ")
        .toLowerCase()
        .replace(/\bwi[- ]?fi\b/g, "wifi");
      const slugText = (issue.slug || "").replace(/-/g, " ");
      const compactSlug = (issue.slug || "").replace(/-/g, "");
      const categoryText = (issue.category_slug || "").replace(/-/g, " ");

      return {
        slug: issue.slug,
        title: issue.title,
        summary: issue.summary,
        severity: issue.severity,
        category_slug: issue.category_slug,
        steps: issue.steps,
        haystack: `${normalizedTitle} ${normalizedSummary} ${normalizedSymptoms} ${slugText} ${compactSlug} ${categoryText}`,
      };
    });
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
    const ALLOWED_IMAGE_MIME_TYPES = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);
    const MAX_IMAGE_BASE64_LENGTH = 7 * 1024 * 1024; // 7MB chars (~5MB binary)

    for (const item of rawHistory) {
      if (!item || typeof item !== "object") continue;
      const role =
        item.role === "assistant" ? "assistant" : item.role === "user" ? "user" : null;
      if (!role) continue;
      const content = typeof item.content === "string" ? item.content : "";
      let image: string | undefined = undefined;

      if (item.image !== undefined && item.image !== null) {
        if (typeof item.image !== "string") {
          return NextResponse.json(
            { error: "Invalid image format" },
            { status: 400, headers: rateLimitHeaders }
          );
        }
        if (item.image.length > MAX_IMAGE_BASE64_LENGTH) {
          return NextResponse.json(
            { error: "Image payload exceeds maximum allowed size of 5MB" },
            { status: 413, headers: rateLimitHeaders }
          );
        }
        const match = item.image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,/);
        if (!match || !ALLOWED_IMAGE_MIME_TYPES.has(match[1].toLowerCase())) {
          return NextResponse.json(
            { error: "Unsupported or invalid image format. Only JPEG, PNG, WEBP, and GIF images are supported." },
            { status: 400, headers: rateLimitHeaders }
          );
        }
        image = item.image;
      }

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
      const queryKeywords = extractKeywords(cleanSearchQuery);

      if (queryKeywords.length > 0) {
        const corpus = getSearchCorpus();
        const scoredIssues = corpus
          .map((item) => {
            let score = 0;
            let directMatches = 0;
            const lowerTitle = item.title
              .toLowerCase()
              .replace(/\bwi[- ]?fi\b/g, "wifi")
              .replace(/\bez[- ]?debug\b/g, "ezdebug")
              .replace(/\bdr[\.-]?\s*debug\b/gi, "drdebug")
              .replace(/\bq[- ]?code\b/g, "qcode");

            for (const kw of queryKeywords) {
              const isHighValue = HIGH_VALUE_TECH_TOKENS.has(kw);
              const titleWeight = isHighValue ? 8 : 3;
              const haystackWeight = isHighValue ? 4 : 1;

              if (lowerTitle.includes(kw)) {
                score += titleWeight;
                directMatches++;
              } else if (item.haystack.includes(kw)) {
                score += haystackWeight;
                directMatches++;
              }
            }

            const normalizedScore = score / Math.max(1, queryKeywords.length * 3);
            return { item, directMatches, score: normalizedScore };
          })
          .filter((res) => res.directMatches >= 1 && res.score >= 0.08)
          .sort((a, b) => b.score - a.score || b.directMatches - a.directMatches)
          .slice(0, 2);

        if (scoredIssues.length > 0) {
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

    const systemPrompt = `You are pcfix, a friendly PC repair technician who is warm, helpful, and strictly straight to the point. Everyday users need fast, clear answers without wall-of-text fluff.

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

8. IDENTITY & AI PRIVACY:
   - Your identity is strictly pcfix Technician Desk.
   - NEVER mention Google, Gemini, OpenAI, Claude, ChatGPT, LLM, or any AI provider or architecture names.
   - If asked what model or system you are, answer: "I am pcfix, your dedicated hardware and system repair diagnostic assistant."

${langInstruction}

${referenceSection}`;

    // 6. Call AI API
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
            ? `Hai! Berikut adalah langkah penyelesaian yang disahkan untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix.)*`
            : `Hey there! Here are the verified resolution steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system.)*`;

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

      // Category or universal triage guide when specific issue match is 0
      const lowerQ = cleanSearchQuery.toLowerCase();
      let triageCategoryTitle = "";
      let triageStepsText = "";

      if (lowerQ.includes("wifi") || lowerQ.includes("wi-fi") || lowerQ.includes("internet") || lowerQ.includes("network") || lowerQ.includes("ethernet") || lowerQ.includes("ip")) {
        triageCategoryTitle = "Network & Internet Connection Troubleshooting";
        triageStepsText =
          lang === "ms"
            ? `1. **Nyahcas Kuasa & Mulakan Semula (Power Cycle)**: Matikan modem dan router selama 30 saat, kemudian hidupkan semula.\n\n2. **Semak Device Manager**: Buka Device Manager (Win+X), periksa Network adapters. Jika ada tanda seru kuning, klik kanan dan pilih 'Update driver' atau 'Enable device'.\n\n3. **Tetapkan Semula Rangkaian (Network Reset)**: Buka Windows Settings > Network & internet > Advanced network settings > Network reset > Reset now.\n\n4. **Reset TCP/IP & Flush DNS**: Buka Command Prompt sebagai Administrator, taip:\n   \`ipconfig /flushdns\`\n   \`netsh int ip reset\`\n   \`netsh winsock reset\`\n   dan restart PC.`
            : `1. **Cold Power Cycle**: Unplug your modem and router for 30 seconds, then reconnect and let lights stabilize.\n\n2. **Inspect Device Manager**: Press Win+X, open Device Manager, and expand Network adapters. If you see a yellow warning icon or disabled adapter, right-click and choose 'Enable device' or 'Update driver'.\n\n3. **Windows Network Reset**: Go to Settings > Network & internet > Advanced network settings > Network reset > click 'Reset now'.\n\n4. **Flush DNS & Reset Stack**: In Administrator Command Prompt, execute:\n   \`ipconfig /flushdns\`\n   \`netsh int ip reset\`\n   \`netsh winsock reset\`\n   then reboot your PC.`;
      } else if (lowerQ.includes("boot") || lowerQ.includes("turn on") || lowerQ.includes("power") || lowerQ.includes("display") || lowerQ.includes("black")) {
        triageCategoryTitle = "System Power & Boot Diagnostics";
        triageStepsText =
          lang === "ms"
            ? `1. **Buang Cas Kapasitor (EC Reset)**: Cabut kabel power dari belakang PC (atau cabut charger laptop), tahan butang power selama 30 saat, pasang semula dan hidupkan.\n\n2. **Semak Sambungan Monitor**: Pastikan kabel HDMI/DisplayPort dipasang pada port kad grafik (GPU) di bahagian bawah casing, bukan port motherboard di atas.\n\n3. **Pasang Semula RAM (Reseat RAM)**: Buka casing dengan bekalan elektrik diputuskan, tanggalkan kepingan RAM, bersihkan pin emas perlahan-lahan, dan tekan masuk kembali sehingga klip berbunyi 'klik'.\n\n4. **Semak Lampu Debug Motherboard**: Lihat sama ada lampu LED CPU, DRAM, VGA, atau BOOT menyala berterusan.`
            : `1. **Capacitor Discharge (EC Reset)**: Unplug power from the PC (or disconnect laptop charger), hold the power button for 30 seconds to drain static, reconnect and power on.\n\n2. **Check Display Cable Port**: Ensure your monitor HDMI/DisplayPort cable is plugged into the dedicated graphics card (GPU) ports near the bottom of the case, not the motherboard ports at the top.\n\n3. **Reseat RAM Sticks**: Turn off power, pop open the side panel, unclip each RAM stick, gently wipe contacts, and firmly reinsert into slot 2 and 4 until both clips latch.\n\n4. **Inspect Debug LEDs**: Check if any motherboard diagnostic LEDs (CPU, DRAM, VGA, BOOT) remain lit.`;
      } else {
        triageCategoryTitle = "General Diagnostic Triage";
        triageStepsText =
          lang === "ms"
            ? `1. **Mulakan Semula PC (Hard Reset)**: Tutup PC sepenuhnya, cabut kabel elektrik 1 minit, pasang semula dan hidupkan.\n\n2. **Periksa Device Manager**: Tekan Win+X > Device Manager untuk memeriksa sebarang kerosakan pemacu (driver) bertanda seru kuning.\n\n3. **Imbas Integriti Windows**: Buka Command Prompt (Administrator) dan jalankan \`sfc /scannow\`.\n\n4. **Uji Melalui Safe Mode**: Mulakan Windows dalam mod selamat untuk mengasingkan konflik perisian pihak ketiga.`
            : `1. **Hard Reset**: Shut down your computer completely, unplug the power cable for 1 minute, reconnect and turn on.\n\n2. **Check Device Manager**: Press Win+X > Device Manager to inspect for any device faults or missing drivers marked with yellow alerts.\n\n3. **System File Integrity**: Open Command Prompt as Administrator and run \`sfc /scannow\` to repair corrupted OS components.\n\n4. **Test in Safe Mode**: Boot into Windows Safe Mode to test if third-party background software is conflicting.`;
      }

      const fallbackReply =
        lang === "ms"
          ? `Hai! Berikut adalah panduan penyelesaian langkah demi langkah untuk **${triageCategoryTitle}**:\n\n${triageStepsText}\n\n*(Langkah diagnosis disahkan daripada sistem pcfix. Beritahu saya sekiranya anda memerlukan bantuan lanjut.)*`
          : `Hey there! Here is the verified diagnostic guide for **${triageCategoryTitle}**:\n\n${triageStepsText}\n\n*(Verified steps from the pcfix diagnostic system. Let me know what you observe!)*`;

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
                controller.enqueue(
                  encoder.encode("\n\n⚠️ *Connection interrupted during diagnosis. Please tap Retry to continue.*")
                );
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
            ? `Hai! Berikut adalah langkah penyelesaian yang disahkan untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix.)*`
            : `Hey there! Here are the verified resolution steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system.)*`;

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

      // If no local match and live AI failed due to high traffic:
      return NextResponse.json(
        {
          error: isRateLimited
            ? (lang === "ms"
                ? "Sistem diagnosis kami sedang sibuk dengan trafik tinggi. Sila tunggu sebentar dan tekan 'Cuba tanya lagi'."
                : "The diagnostic system is experiencing high traffic right now. Please wait a moment and tap Retry.")
            : (lang === "ms"
                ? "Tidak dapat menyambung ke sistem diagnosis buat masa ini. Sila tekan 'Cuba tanya lagi'."
                : "Unable to reach the diagnostic service right now. Please tap Retry."),
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
            ? `Hai! Berikut adalah langkah penyelesaian yang disahkan untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix.)*`
            : `Hey there! Here are the verified resolution steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system.)*`;
      } else {
        return NextResponse.json(
          {
            error: isRateLimited
              ? (lang === "ms"
                  ? "Sistem diagnosis kami sedang sibuk dengan trafik tinggi. Sila tunggu sebentar dan tekan 'Cuba tanya lagi'."
                  : "The diagnostic system is experiencing high traffic right now. Please wait a moment and tap Retry.")
              : (lang === "ms"
                  ? "Tidak dapat menyambung ke sistem diagnosis buat masa ini. Sila tekan 'Cuba tanya lagi'."
                  : "Unable to reach the diagnostic service right now. Please tap Retry."),
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
