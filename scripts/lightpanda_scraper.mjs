/**
 * Lightpanda Headless Browser Scraper
 *
 * Connects to Lightpanda's native CDP server (ws://127.0.0.1:9222)
 * for ultra-fast, lightweight web scraping with zero heavy Chromium footprint.
 *
 * To run Lightpanda on Windows:
 * Option 1 (Docker):
 *   docker run -d --name lightpanda -p 127.0.0.1:9222:9222 lightpanda/browser:nightly
 * Option 2 (WSL2):
 *   curl -L -o lightpanda https://github.com/lightpanda-io/browser/releases/download/nightly/lightpanda-x86_64-linux
 *   chmod +x ./lightpanda
 *   ./lightpanda serve --host 0.0.0.0 --port 9222
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const LIGHTPANDA_PORT = process.env.LIGHTPANDA_PORT || 9222;
const LIGHTPANDA_HOST = process.env.LIGHTPANDA_HOST || "127.0.0.1";
const CDP_ENDPOINT = `http://${LIGHTPANDA_HOST}:${LIGHTPANDA_PORT}`;

// High-value tech scraping targets for pcfix
const SCRAPE_TARGETS = [
  {
    category: "pc-tips",
    title: "Microsoft Windows Terminal & Command Line Reference",
    url: "https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands",
    selector: "main",
  },
  {
    category: "cool-tools",
    title: "Chris Titus Tech Windows Utility (CTT WinUtil)",
    url: "https://github.com/ChrisTitusTech/winutil",
    selector: "article.markdown-body",
  },
  {
    category: "cool-tools",
    title: "BleachBit Open Source Privacy & Disk Cleaner",
    url: "https://github.com/bleachbit/bleachbit",
    selector: "article.markdown-body",
  },
  {
    category: "cool-tools",
    title: "Microsoft PowerToys Utilities",
    url: "https://github.com/microsoft/PowerToys",
    selector: "article.markdown-body",
  },
  {
    category: "troubleshooting",
    title: "Community Tech Support Knowledge Base",
    url: "https://rtech.support/",
    selector: "body",
  },
];

async function checkLightpandaAlive() {
  return new Promise((resolve) => {
    const req = http.get(`${CDP_ENDPOINT}/json/version`, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function scrapeWithLightpanda(targets) {
  console.log(`[Lightpanda] Connecting to CDP server at ${CDP_ENDPOINT}...`);
  const browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  const context = await browser.newContext();
  const results = [];

  for (const target of targets) {
    console.log(`[Lightpanda] Fetching: ${target.url}...`);
    const page = await context.newPage();
    const startTime = Date.now();

    try {
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 15000 });
      const elapsed = Date.now() - startTime;

      const pageTitle = await page.title();
      const extractedText = await page.evaluate((sel) => {
        const el = document.querySelector(sel) || document.body;
        return el ? el.innerText.slice(0, 4000) : "";
      }, target.selector);

      // Extract external links / documentation references
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll("a[href]"))
          .map((a) => a.getAttribute("href"))
          .filter((href) => href && (href.startsWith("http") || href.startsWith("/")))
          .slice(0, 20);
      });

      console.log(`[Lightpanda] Success in ${elapsed}ms: ${pageTitle}`);

      results.push({
        url: target.url,
        category: target.category,
        pageTitle,
        elapsedMs: elapsed,
        summaryText: extractedText.slice(0, 500).replace(/\s+/g, " "),
        extractedLength: extractedText.length,
        linksCount: links.length,
        sampleLinks: links.slice(0, 5),
        scrapedAt: new Date().toISOString(),
        engine: "lightpanda-cdp",
      });
    } catch (err) {
      console.warn(`[Lightpanda] Failed ${target.url}:`, err.message);
      results.push({
        url: target.url,
        category: target.category,
        error: err.message,
        engine: "lightpanda-cdp",
      });
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();
  return results;
}

async function scrapeWithHttpFallback(targets) {
  console.log("[Fallback] Lightpanda server not detected on port 9222.");
  console.log("[Fallback] Running direct HTTP parser while preserving target schema...");
  const results = [];

  for (const target of targets) {
    console.log(`[Fallback] Fetching: ${target.url}...`);
    const startTime = Date.now();

    try {
      const resp = await fetch(target.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        },
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
      }

      const html = await resp.text();
      const elapsed = Date.now() - startTime;

      // Clean HTML tags for text extract
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const pageTitle = titleMatch ? titleMatch[1].trim() : target.title;
      const stripped = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      results.push({
        url: target.url,
        category: target.category,
        pageTitle,
        elapsedMs: elapsed,
        summaryText: stripped.slice(0, 500),
        extractedLength: stripped.length,
        scrapedAt: new Date().toISOString(),
        engine: "http-fetch-fallback",
      });
      console.log(`[Fallback] Success in ${elapsed}ms: ${pageTitle}`);
    } catch (err) {
      console.warn(`[Fallback] Failed ${target.url}:`, err.message);
      results.push({
        url: target.url,
        category: target.category,
        error: err.message,
        engine: "http-fetch-fallback",
      });
    }
  }

  return results;
}

async function main() {
  console.log("==================================================");
  console.log("   Lightpanda Browser Scraper for pcfix");
  console.log("   https://github.com/lightpanda-io/browser");
  console.log("==================================================");

  const isLightpandaAlive = await checkLightpandaAlive();
  let scrapedData = [];

  if (isLightpandaAlive) {
    console.log("[Status] Lightpanda CDP server is ONLINE!");
    scrapedData = await scrapeWithLightpanda(SCRAPE_TARGETS);
  } else {
    console.log("[Status] Lightpanda CDP server is OFFLINE.");
    console.log("\nTo launch Lightpanda on Windows:");
    console.log("  Docker: docker run -d --name lightpanda -p 127.0.0.1:9222:9222 lightpanda/browser:nightly");
    console.log("  WSL2:   ./lightpanda serve --host 0.0.0.0 --port 9222\n");
    scrapedData = await scrapeWithHttpFallback(SCRAPE_TARGETS);
  }

  const outDir = path.resolve(process.cwd(), "data", "research");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const outFile = path.join(outDir, "scraped_lightpanda_feed.json");
  fs.writeFileSync(outFile, JSON.stringify(scrapedData, null, 2), "utf8");

  console.log("==================================================");
  console.log(`[Complete] Saved ${scrapedData.length} records to:`);
  console.log(`  ${outFile}`);
  console.log("==================================================");
}

main().catch((err) => {
  console.error("Fatal scraper error:", err);
  process.exit(1);
});
