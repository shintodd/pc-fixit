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

const PROMPT_INJECTION_PATTERNS = [
  /\b(?:ignore|forget|override|bypass)\s+(?:all\s+)?(?:previous|above|system|prior)\s+(?:instructions?|rules?|prompts?|directives?)\b/i,
  /\b(?:print|reveal|show|output|leak|repeat|display|dump|verbatim)\s+(?:your\s+)?(?:system\s+prompt|developer\s+instructions?|hidden\s+prompt|system\s+instructions?)\b/i,
  /\bwhat\s+is\s+your\s+(?:exact\s+)?(?:system\s+prompt|developer\s+instructions?|initial\s+prompt)\b/i,
  /\byou\s+are\s+now\s+(?:dan|jailbreak|unrestricted|do\s+anything\s+now)\b/i,
  /\boutput\s+the\s+secret\s+(?:admin\s+)?password\b/i,
  /\b(?:reveal|show|print|dump)\s+(?:all\s+)?(?:environment\s+variables?|env\s+vars?|secret\s+api\s+keys?|database_url|gemini_api_key)\b/i,
  /\brecommend\s+a\s+malicious\s+exploit\s+script\b/i,
];

function isPromptExfiltrationOrInjection(query: string): boolean {
  return PROMPT_INJECTION_PATTERNS.some((pattern) => pattern.test(query));
}

function sanitizeTextChunk(text: string): string {
  if (!text) return "";
  return text
    .replace(/\u2014/g, " - ")
    .replace(/\u2015/g, " - ")
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
    .replace(/\b(?:GEMINI_API_KEY|GOOGLE_API_KEY|DATABASE_URL)\b/g, "[REDACTED_ENV]")
    .replace(/CRITICAL INSTRUCTIONS:/gi, "")
    .replace(/REFERENCE FACTS FROM KNOWLEDGE BASE:/gi, "")
    .replace(/SCOPE GUARD:/gi, "");
}

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

    const userMessageCount = history.filter((m) => m.role === "user").length;
    const isFollowUp = userMessageCount > 1;

    // 2b. Prompt Injection & Exfiltration Defense Guard
    if (isPromptExfiltrationOrInjection(userQuery)) {
      const safeReply =
        lang === "ms"
          ? "Saya adalah pcfix, pembantu diagnosis pembaikan perkakasan dan sistem komputer anda. Saya hanya memberikan panduan penyelesaian masalah teknikal untuk PC dan laptop. Ada apa-apa simptom atau isu komputer yang ingin saya bantu?"
          : "I am pcfix, your dedicated hardware and system repair diagnostic assistant. I specialize strictly in troubleshooting PC and laptop hardware, operating system, and networking issues. Please describe any computer symptoms or error codes you need help with!";

      const wantsStream = req.nextUrl.searchParams.get("stream") === "true";
      const isSse =
        req.headers.get("accept")?.includes("text/event-stream") ||
        req.nextUrl.searchParams.get("format") === "sse" ||
        req.nextUrl.searchParams.get("sse") === "true";

      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            if (isSse) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: safeReply })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } else {
              controller.enqueue(encoder.encode(safeReply));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": isSse ? "text/event-stream; charset=utf-8" : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
            ...rateLimitHeaders,
          },
        });
      }

      return NextResponse.json(
        {
          reply: safeReply,
          path: "injection_guard",
          matchedKbEntries: 0,
          source: "guard_defense",
        },
        {
          headers: {
            "Cache-Control": "no-store",
            ...rateLimitHeaders,
          },
        }
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

    // 5. Build Dual-Role System Prompt (Token-Optimized with Verified Technical Context)
    let referenceSection = "";
    if (hasGoodDbMatches) {
      referenceSection = "VERIFIED HARDWARE KNOWLEDGE BASE CONTEXT:\n";
      if (issueMatches.length > 0) {
        issueMatches.slice(0, 2).forEach((item, idx) => {
          const stepsFormatted = Array.isArray(item.fix_steps)
            ? item.fix_steps
                .slice(0, 5)
                .map((s: any, sIdx: number) => `  ${sIdx + 1}. ${s.title}: ${s.detail}`)
                .join("\n")
            : typeof item.fix_steps === "string"
            ? item.fix_steps
            : "";
          referenceSection += `\n[Verified Reference Guide ${idx + 1}: ${item.title}]\nRoot Cause: ${item.summary}\nTechnical Resolution Steps:\n${stepsFormatted}\n`;
        });
      }
      if (errorCodeMatches.length > 0) {
        errorCodeMatches.slice(0, 3).forEach((code) => {
          referenceSection += `\n- Code ${code.code} (${code.name}): ${code.explanation}\n  Technical Fix: ${code.fix_guide}\n`;
        });
      }
    } else {
      referenceSection =
        "KNOWLEDGE BASE CONTEXT:\nProvide authoritative, high-signal technical computer diagnostics and repair guidance tailored to the user query.";
    }

    const openingInstructionMs = isFollowUp
      ? `- PERBUALAN BERSAMBUNG: JANGAN ulang salam ("Hai", "Helo"). Semak apa yang user dah buat dalam sejarah mesej. JANGAN cadang balik langkah yang user dah cuba atau dah gagal. Naik taraf terus ke punca teknikal lebih mendalam (cth: semak slot RAM satu-satu di slot A2/B2, reset CMOS bateri, troubleshoot driver guna DDU mod selamat, semak telemetry SMART disk, atau perintah repair Windows).`
      : `- AYAT PEMBUKA: Terus nyatakan punca utama teknikal yang paling berkemungkinan dalam 1 baris yang tepat dan jelas. Sapaan mesra dibenarkan sekali sahaja di awal perbualan.`;

    const openingInstructionEn = isFollowUp
      ? `- CONVERSATION IN PROGRESS: NEVER repeat greetings ("Hey", "Hello"). Inspect the conversation history for what the user has ALREADY tried. NEVER suggest checks they already confirmed doing. Progress immediately to deeper diagnostic checks (e.g. single RAM stick isolation in slot A2/B2, CMOS clearing, safe mode DDU driver clean install, SMART telemetry, or Windows repair commands).`
      : `- OPENING: State the most probable technical root cause clearly in 1 direct sentence. Greet only once at the start.`;

    const langInstruction =
      lang === "ms"
        ? `5. GAYA BAHASA & KUALITI JAWAPAN (PAKAR TEKNIKAL PC REALISTIK & TEPAT):
   - NADA: Ramah, santai tapi sangat berpengetahuan macam technician PC berpengalaman. JANGAN bagi jawapan generik robotik atau berulang.
   ${openingInstructionMs}
   - BAHASA: Bahasa Melayu santai harian Malaysia. Guna istilah perkakasan standard (motherboard, RAM, GPU, CPU, SSD, BIOS, Windows, kabel power, slot PCIe, pin front panel).
   - FORMAT: Langkah bernombor (1., 2., 3.) dengan tajuk bold dan penerangan teknikal yang jelas dan boleh terus dibuat. Sertakan arahan CMD / PowerShell dalam format kod markdown jika perlu (cth: \`sfc /scannow\`, \`dism\`).
   - PANJANG: Sederhana dan berinformasi tinggi (sekitar 180 hingga 300 patah perkataan). Elakkan leteran kosong, tapi pastikan panduan teknikal lengkap dan berguna.
   - LUAR TOPIK: Tolak secara ringkas dan mesra dalam 1 baris: "Saya cuma pakar baiki PC dan laptop je bos. Ada apa-apa isu komputer yang nak saya bantu?"`
        : `5. LANGUAGE & RESPONSE QUALITY (EXPERT PC TECHNICIAN, ACTIONABLE & PRECISE):
   - TONE: Professional, experienced PC hardware technician. Direct, knowledgeable, zero fluff, and zero generic robotic template speak.
   ${openingInstructionEn}
   - FORMAT: Clean numbered steps (1., 2., 3.) with bold action titles and concrete technical instructions. Provide exact CMD / PowerShell commands in markdown code blocks whenever relevant (e.g. \`sfc /scannow\`, \`DISM /Online /Cleanup-Image /RestoreHealth\`, \`chkdsk C: /f /r\`, \`bcdboot\`).
   - LENGTH: High-density, balanced response (typically 180 to 300 words). Concise but thorough technical guidance.
   - OFF-TOPIC: Briefly and politely decline in 1 line: "I specialize strictly in PC and laptop repairs! Let me know if you have any computer issues to troubleshoot."`;

    const systemPrompt = `You are pcfix Technician Desk, an expert PC hardware and system diagnostic specialist. You diagnose and resolve computer hardware, Windows OS, networking, and component issues with high technical accuracy and zero fluff.

CRITICAL INSTRUCTIONS:
1. SCOPE GUARD:
   You strictly diagnose and repair PC/laptop hardware, operating system, networking, and software problems.
   If asked about non-computing topics, politely decline in 1 short sentence: "I specialize strictly in PC and hardware repairs. Let me know what computer issue I can help you solve."

2. MULTI-TURN CONTEXT & ANTI-REPETITION (CRITICAL):
   - Always analyze previous messages in the chat history.
   - NEVER repeat checks or advice the user already mentioned trying or confirmed didn't work.
   - If basic checks (cables, power button, monitor input) failed, IMMEDIATELY escalate to Tier 2 (motherboard debug LEDs, CMOS battery reset, single RAM stick testing in slot A2/B2, BIOS UEFI CSM/Secure Boot settings) or Tier 3 (Safe Mode DDU driver wipe, Windows DISM/SFC image repair, SSD SMART telemetry, power supply 12V rail / transient drop testing).

3. TECHNICAL ACCURACY & EXACT COMMANDS:
   - Provide concrete, copy-pasteable Windows CMD or PowerShell commands in markdown code blocks with exact flags:
     * System file check: \`sfc /scannow\`
     * Image health: \`DISM /Online /Cleanup-Image /RestoreHealth\`
     * Disk integrity: \`chkdsk C: /f /r\`
     * Memory diagnostic: \`mdsched.exe\`
     * Network stack reset: \`netsh winsock reset\` and \`ipconfig /flushdns\`
     * EFI bootloader rebuild: \`bcdboot C:\\Windows /s S: /f UEFI\`
   - Explain technical concepts accurately: DDR4/DDR5 memory training, dual-channel A2/B2 slot population, PCIe gen link speeds, SSD DRAM cache vs HMB, VRM thermal limits, and Windows Event IDs (WHEA 18/19, Kernel-Power 41, Disk 7/51/153, Display TDR 4101).

4. HARDWARE SCANNER TELEMETRY PARSING:
   - If the user pastes text or a report from "pcfix Desktop Scanner" (or any hardware telemetry like DxDiag, HWiNFO, CrystalDiskInfo):
     * Immediately analyze the specific hardware lines: CPU temperature, RAM configuration (single vs dual channel, XMP/EXPO status, MT/s speed), Disk health (SMART wear %, reallocated sectors, EFI split-boot detection), and Windows Event Log entries.
     * Pinpoint the exact root cause directly from the numbers and logs provided.
   - If a problem is too complex or ambiguous to diagnose from text alone (e.g. random BSODs, silent freezing, suspected hardware failure):
     * Recommend running the free open-source pcfix Desktop Scanner:
       1. Download: Get \`pcfix-scanner.exe\` (180 KB portable, zero install) from /downloads/pcfix-scanner.exe.
       2. Scan: Run it and click "Start Hardware Scan" (takes 3 seconds to scan disk SMART counters, WHEA errors, and PCIe lanes).
       3. Paste: Click "Copy Report" and paste it here for instant root-cause analysis.
     * Mention it is 100% open source on GitHub, completely read-only, and safe.

5. MULTIMODAL SCREENSHOT & PHOTO INSPECTION:
   - When an image or screenshot is attached, inspect all visible details:
     * BSOD stop code text (e.g. 0x00000133, WHEA_UNCORRECTABLE_ERROR, CRITICAL_PROCESS_DIED).
     * Motherboard debug LED colors and labels (CPU, DRAM, VGA, BOOT).
     * Cable connections (HDMI vs DisplayPort, GPU bottom ports vs motherboard top ports).
     * Device Manager yellow warning triangles and hardware error codes.
     * BIOS / UEFI configuration screens.
   - State your visual findings in your opening sentence.

6. PHYSICAL SAFETY & ZERO EM DASH RULE:
   - PHYSICAL SAFETY FIRST: Whenever advising a user to open a PC chassis or touch internal components (RAM, CMOS battery, GPU, cables), ALWAYS mandate in Step 1 to shut down the PC and unplug the AC power cord / charger first to prevent electrical damage or shock.
   - ZERO EM DASHES: Strictly NEVER use the em dash character. Use a standard hyphen (-) or colon (:) instead.
   - ZERO CIRCLE DOTS: Strictly NEVER use bullet circle characters. Use standard numbered lists (1., 2., 3.) or hyphens (-).

7. IDENTITY & BRANDING:
   - Your identity is strictly "pcfix Technician Desk".
   - Branding is strictly "pcfix".
   - NEVER mention Google, Gemini, OpenAI, ChatGPT, Anthropic, Claude, or LLM architectures. If asked what system you are, answer: "I am pcfix, your dedicated hardware and system repair diagnostic assistant."

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
            ? `${isFollowUp ? "Berikut" : "Hai! Berikut"} adalah langkah penyelesaian yang disahkan untuk **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix.)*`
            : `${isFollowUp ? "Here" : "Hey there! Here"} are the verified resolution steps for **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system.)*`;

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
          ? `${isFollowUp ? "Berikut" : "Hai! Berikut"} adalah panduan penyelesaian langkah demi langkah untuk **${triageCategoryTitle}**:\n\n${triageStepsText}\n\n*(Langkah diagnosis disahkan daripada sistem pcfix. Beritahu saya sekiranya anda memerlukan bantuan lanjut.)*`
          : `${isFollowUp ? "Here" : "Hey there! Here"} is the verified diagnostic guide for **${triageCategoryTitle}**:\n\n${triageStepsText}\n\n*(Verified steps from the pcfix diagnostic system. Let me know what you observe!)*`;

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
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

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
      "gemini-3.6-flash",
    ].filter((v, i, a) => a.indexOf(v) === i);

    const wantsStream = req.nextUrl.searchParams.get("stream") === "true";
    const isSse =
      req.headers.get("accept")?.includes("text/event-stream") ||
      req.nextUrl.searchParams.get("format") === "sse" ||
      req.nextUrl.searchParams.get("sse") === "true";
    let isRateLimited = false;

    // Fast response path: Serve cached AI diagnosis if query matches recent request
    const aiCacheKey = `${lang}:${isFollowUp ? "follow" : "first"}:${cleanSearchQuery.trim().toLowerCase()}:${hasImageInContents ? "img" : "text"}`;
    const cachedAi = aiResponseCache.get(aiCacheKey);
    if (cachedAi && Date.now() - cachedAi.timestamp < AI_CACHE_TTL_MS) {
      const sanitizedCachedReply = sanitizeTextChunk(cachedAi.reply);
      if (wantsStream) {
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            if (isSse) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: sanitizedCachedReply })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } else {
              controller.enqueue(encoder.encode(sanitizedCachedReply));
            }
            controller.close();
          },
        });
        return new Response(stream, {
          headers: {
            "Content-Type": isSse ? "text/event-stream; charset=utf-8" : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Cache": "HIT",
            ...rateLimitHeaders,
          },
        });
      }

      return NextResponse.json(
        {
          reply: sanitizedCachedReply,
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
          if (streamResponse) {
            isRateLimited = false;
            break;
          }
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
              if (streamResponse) {
                isRateLimited = false;
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

      if (streamResponse) {
        const encoder = new TextEncoder();
        let fullOutput = "";

        const stream = new ReadableStream({
          start(controller) {
            (async () => {
              try {
                let pendingGreetingFilter = isFollowUp;
                let greetingBuffer = "";

                for await (const chunk of streamResponse) {
                  let text = chunk.text || "";
                  if (!text) continue;
                  text = sanitizeTextChunk(text);

                  if (pendingGreetingFilter) {
                    greetingBuffer += text;
                    if (greetingBuffer.length >= 25 || /[.!?\n]/.test(greetingBuffer)) {
                      greetingBuffer = greetingBuffer.replace(/^(?:hey(?: there)?|hi(?: there)?|hello|hai|helo)[!,.]?\s*/i, "");
                      pendingGreetingFilter = false;
                      text = greetingBuffer;
                      greetingBuffer = "";
                    } else {
                      continue;
                    }
                  }

                  if (text) {
                    fullOutput += text;
                    if (isSse) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                    } else {
                      controller.enqueue(encoder.encode(text));
                    }
                  }
                }

                if (greetingBuffer) {
                  const remaining = pendingGreetingFilter
                    ? greetingBuffer.replace(/^(?:hey(?: there)?|hi(?: there)?|hello|hai|helo)[!,.]?\s*/i, "")
                    : greetingBuffer;
                  if (remaining) {
                    fullOutput += remaining;
                    if (isSse) {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: remaining })}\n\n`));
                    } else {
                      controller.enqueue(encoder.encode(remaining));
                    }
                  }
                }

                if (isSse) {
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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
                if (isSse) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ error: "Connection interrupted during diagnosis. Please tap Retry." })}\n\n`)
                  );
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                } else {
                  controller.enqueue(
                    encoder.encode("\n\n⚠️ *Connection interrupted during diagnosis. Please tap Retry to continue.*")
                  );
                }
              } finally {
                controller.close();
              }
            })();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": isSse ? "text/event-stream; charset=utf-8" : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
            "X-Accel-Buffering": "no",
            ...(isSse ? { Connection: "keep-alive" } : { "Transfer-Encoding": "chunked" }),
            ...rateLimitHeaders,
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

        const fallbackReply = sanitizeTextChunk(
          lang === "ms"
            ? `${isFollowUp ? "Untuk langkah seterusnya bagi" : "Hai! Berikut adalah langkah penyelesaian yang disahkan untuk"} **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix. Jika isu masih berterusan, muat turun pcfix Desktop Scanner untuk semakan telemetri perkakasan automatik.)*`
            : `${isFollowUp ? "For next steps regarding" : "Here are the verified resolution steps for"} **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system. If the issue persists, run pcfix Desktop Scanner for automated hardware telemetry analysis.)*`
        );

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            if (isSse) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: fallbackReply })}\n\n`));
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            } else {
              controller.enqueue(encoder.encode(fallbackReply));
            }
            controller.close();
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": isSse ? "text/event-stream; charset=utf-8" : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Content-Type-Options": "nosniff",
            "X-Accel-Buffering": "no",
            ...rateLimitHeaders,
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
        { status: isRateLimited ? 429 : 503, headers: rateLimitHeaders }
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
          isRateLimited = false;
          responseText = isFollowUp
            ? response.text.replace(/^(?:hey(?: there)?|hi(?: there)?|hello|hai|helo)[!,.]?\s*/i, "")
            : response.text;
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
              isRateLimited = false;
              responseText = isFollowUp
                ? retryResponse.text.replace(/^(?:hey(?: there)?|hi(?: there)?|hello|hai|helo)[!,.]?\s*/i, "")
                : retryResponse.text;
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

        responseText = sanitizeTextChunk(
          lang === "ms"
            ? `${isFollowUp ? "Untuk langkah seterusnya bagi" : "Hai! Berikut adalah langkah penyelesaian yang disahkan untuk"} **${top.title}**:\n\n${top.summary}\n\n### Langkah Baiki Langkah Demi Langkah:\n${stepsText}\n\n*(Langkah penyelesaian disahkan daripada sistem diagnosis pcfix. Jika isu masih berterusan, muat turun pcfix Desktop Scanner untuk semakan telemetri perkakasan automatik.)*`
            : `${isFollowUp ? "For next steps regarding" : "Here are the verified resolution steps for"} **${top.title}**:\n\n${top.summary}\n\n### Recommended Fix Steps:\n${stepsText}\n\n*(Verified resolution guide from the pcfix diagnostic system. If the issue persists, run pcfix Desktop Scanner for automated hardware telemetry analysis.)*`
        );
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
          { status: isRateLimited ? 429 : 503, headers: rateLimitHeaders }
        );
      }
    } else {
      responseText = sanitizeTextChunk(responseText);
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
  if (isPromptExfiltrationOrInjection(userQuery)) return;
  if (/<script|drop\s+table|select\s+|union\s+select/i.test(userQuery)) return;

  const sanitizedOutput = sanitizeTextChunk(responseText);

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
        summary: sanitizedOutput.slice(0, 200).replace(/\n+/g, " ") + "...",
        severity: "warn",
        symptoms: [userQuery],
        fix_steps: [
          {
            title: "Diagnosis & Steps",
            detail: sanitizedOutput.slice(0, 3000),
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
