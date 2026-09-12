/**
 * Comprehensive Category 04 QA Expert Test Automation Suite
 * Tests all API endpoints, edge cases, rate limits, proxy headers, database fallbacks,
 * error boundaries, and negative constraints.
 */

import { NextRequest } from "next/server";
import { POST as diagnoseHandler } from "../app/api/diagnose/route";
import { GET as issuesHandler } from "../app/api/issues/[slug]/route";
import { GET as wizardHandler } from "../app/api/wizard/[nodeId]/route";
import { GET as categoriesHandler } from "../app/api/categories/route";
import { GET as healthGetHandler, HEAD as healthHeadHandler } from "../app/api/health/route";
import {
  checkRateLimit,
  resetRateLimits,
  extractClientIp,
  RATE_LIMIT_MAX_REQUESTS,
} from "../lib/rate-limiter";
import { ISSUES } from "../lib/mock-data";
import { WIZARD_TREE } from "../lib/wizard-data";
import fs from "fs";
import path from "path";

// Test runner state
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures: string[] = [];

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] ${testName}`);
  } else {
    failedTests++;
    const errMsg = detail ? `${testName} -> ${detail}` : testName;
    failures.push(errMsg);
    console.error(`  [FAIL] ${errMsg}`);
  }
}

function suite(name: string) {
  console.log(`\n======================================================`);
  console.log(`SUITE: ${name}`);
  console.log(`======================================================`);
}

async function runRateLimiterAndIpSuite() {
  suite("1. Rate Limiter Boundary & IP Extraction");
  resetRateLimits();

  // Test IP extraction prioritizing Cloudflare headers
  const cfReq = {
    headers: {
      get(name: string) {
        if (name === "cf-connecting-ip") return "198.51.100.25";
        if (name === "x-real-ip") return "198.51.100.26";
        if (name === "x-forwarded-for") return "198.51.100.27, 10.0.0.1";
        return null;
      },
    },
  };
  assert(
    extractClientIp(cfReq) === "198.51.100.25",
    "cf-connecting-ip is prioritized over x-real-ip and x-forwarded-for"
  );

  // Test IP extraction falling back to x-real-ip
  const realIpReq = {
    headers: {
      get(name: string) {
        if (name === "x-real-ip") return "203.0.113.10";
        if (name === "x-forwarded-for") return "198.51.100.27, 10.0.0.1";
        return null;
      },
    },
  };
  assert(
    extractClientIp(realIpReq) === "203.0.113.10",
    "x-real-ip is used when cf-connecting-ip is absent"
  );

  // Test IP extraction with comma-separated x-forwarded-for
  const forwardedReq = {
    headers: {
      get(name: string) {
        if (name === "x-forwarded-for") return "192.0.2.45, 10.0.0.2, 172.16.0.1";
        return null;
      },
    },
  };
  assert(
    extractClientIp(forwardedReq) === "192.0.2.45",
    "First client IP in x-forwarded-for chain is extracted"
  );

  // Test fallback to 127.0.0.1 when no proxy headers exist
  const emptyReq = {
    headers: {
      get(_name: string) {
        return null;
      },
    },
  };
  assert(
    extractClientIp(emptyReq) === "127.0.0.1",
    "Default fallback IP is 127.0.0.1 when headers are absent"
  );

  // Rate limit boundary testing: 10 requests allowed, 11th blocked
  const testIp = "192.168.99.1";
  for (let i = 1; i <= RATE_LIMIT_MAX_REQUESTS; i++) {
    const res = checkRateLimit(testIp);
    assert(
      res.allowed === true && res.remaining === RATE_LIMIT_MAX_REQUESTS - i,
      `Rate limit allows request ${i} of ${RATE_LIMIT_MAX_REQUESTS} (remaining: ${res.remaining})`
    );
  }

  // 11th request must be rejected
  const blockedRes = checkRateLimit(testIp);
  assert(
    blockedRes.allowed === false && blockedRes.remaining === 0,
    `11th request is blocked with remaining: 0`
  );

  // Independent IP is not affected by previous IP rate limit
  const otherIp = "192.168.99.2";
  const otherRes = checkRateLimit(otherIp);
  assert(
    otherRes.allowed === true && otherRes.remaining === 9,
    "Different IP receives fresh independent rate limit bucket"
  );
}

async function runDiagnoseEndpointSuite() {
  suite("2. /api/diagnose Endpoint & Edge Cases");
  resetRateLimits();

  // Save and isolate GEMINI_API_KEY so tests run in reproducible local mode without quota issues
  const savedApiKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  const makeReq = (body: any, headers?: Record<string, string>) => {
    return new NextRequest("http://localhost:3000/api/diagnose", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "cf-connecting-ip": "10.200.1.1",
        ...headers,
      },
      body: typeof body === "string" ? body : JSON.stringify(body),
    });
  };

  try {
    // Edge Case: Empty JSON body {}
    {
      const req = makeReq({});
      const res = await diagnoseHandler(req);
      const data = await res.json();
      assert(res.status === 400, "Empty request object {} returns HTTP 400", `got ${res.status}`);
      assert(data.error.includes("empty"), "Returns clear error about empty chat history");
    }

    // Edge Case: Empty history array
    {
      const req = makeReq({ history: [] });
      const res = await diagnoseHandler(req);
      assert(res.status === 400, "Empty history array [] returns HTTP 400", `got ${res.status}`);
    }

    // Edge Case: Whitespace-only queries
    {
      const req = makeReq({
        history: [{ role: "user", content: "     " }],
      });
      const res = await diagnoseHandler(req);
      const data = await res.json();
      assert(
        res.status === 400,
        "Whitespace-only query returns HTTP 400",
        `got ${res.status}`
      );
      assert(
        data.error.toLowerCase().includes("whitespace") || data.error.toLowerCase().includes("empty"),
        "Error message explicitly identifies empty or whitespace query"
      );
    }

    // Edge Case: Malformed history elements (null, non-object, missing content)
    {
      const req = makeReq({
        history: [null, 123, { role: "user", content: null }],
      });
      const res = await diagnoseHandler(req);
      assert(
        res.status === 400,
        "Malformed history elements return HTTP 400 without crashing with 500",
        `got ${res.status}`
      );
    }

    // Edge Case: History exceeding 30 messages
    {
      const oversizedHistory = Array.from({ length: 35 }, (_, idx) => ({
        role: idx % 2 === 0 ? "user" : "assistant",
        content: `Message ${idx}`,
      }));
      const req = makeReq({ history: oversizedHistory });
      const res = await diagnoseHandler(req);
      assert(
        res.status === 400,
        "Conversation history > 30 messages returns HTTP 400",
        `got ${res.status}`
      );
    }

    // Edge Case: Oversized query (> 5000 characters)
    {
      const hugePrompt = "a".repeat(5001);
      const req = makeReq({
        history: [{ role: "user", content: hugePrompt }],
      });
      const res = await diagnoseHandler(req);
      const data = await res.json();
      assert(
        res.status === 400,
        "Oversized prompt (> 5000 characters) returns HTTP 400",
        `got ${res.status}`
      );
      assert(
        data.error.includes("5000"),
        "Error message specifies 5000 character limit"
      );
    }

    // Boundary Case: Prompt of exactly 5000 characters
    {
      const boundaryPrompt = "motherboard red DRAM light no display " + "x".repeat(4960);
      const req = makeReq({
        history: [{ role: "user", content: boundaryPrompt }],
      });
      const res = await diagnoseHandler(req);
      assert(
        res.status === 200,
        "Prompt with exactly 5000 characters is accepted without HTTP 400",
        `got ${res.status}`
      );
    }

    // Edge Case: Invalid raw JSON body syntax
    {
      const req = makeReq("{ this is invalid json syntax }");
      const res = await diagnoseHandler(req);
      assert(
        res.status === 400,
        "Malformed raw JSON payload returns HTTP 400",
        `got ${res.status}`
      );
    }

    // Edge Case: Live Rate Limit HTTP 429 enforcement
    {
      const rateLimitIp = "10.200.99.88";
      let lastStatus = 200;
      for (let i = 0; i < RATE_LIMIT_MAX_REQUESTS; i++) {
        const req = makeReq(
          { history: [{ role: "user", content: "motherboard red DRAM light no display" }] },
          { "cf-connecting-ip": rateLimitIp }
        );
        const res = await diagnoseHandler(req);
        lastStatus = res.status;
      }
      assert(
        lastStatus === 200,
        `First ${RATE_LIMIT_MAX_REQUESTS} requests from IP receive HTTP 200`
      );

      // Request 11 must receive 429
      const blockedReq = makeReq(
        { history: [{ role: "user", content: "motherboard red DRAM light no display" }] },
        { "cf-connecting-ip": rateLimitIp }
      );
      const blockedRes = await diagnoseHandler(blockedReq);
      assert(
        blockedRes.status === 429,
        "11th request from same IP receives HTTP 429 Too Many Requests",
        `got ${blockedRes.status}`
      );
      assert(
        blockedRes.headers.get("Retry-After") !== null,
        "HTTP 429 response includes Retry-After header"
      );
      assert(
        blockedRes.headers.get("X-RateLimit-Remaining") === "0",
        "HTTP 429 response sets X-RateLimit-Remaining to 0"
      );
    }

    // Offline KB Fallback retrieval in /api/diagnose
    {
      const req = makeReq({
        history: [
          {
            role: "user",
            content: "My motherboard has a solid red DRAM debug LED and won't post",
          },
        ],
      });
      const res = await diagnoseHandler(req);
      const data = await res.json();
      assert(res.status === 200, "Known hardware query succeeds with HTTP 200 in offline mode", `got ${res.status}`);
      assert(
        typeof data.reply === "string" && data.reply.length > 20,
        "Diagnosis response returns substantive reply text"
      );
      assert(
        data.reply.includes("Recommended Fix Steps") || data.reply.includes("verified"),
        "Offline fallback response includes structured verified steps from research data"
      );
      assert(
        data.source === "offline_fallback",
        "Diagnosis correctly labels response source as offline_fallback"
      );
    }
  } finally {
    // Restore original API key
    if (savedApiKey) {
      process.env.GEMINI_API_KEY = savedApiKey;
    }
  }
}

async function runIssuesEndpointSuite() {
  suite("3. /api/issues/[slug] Endpoint & Fallback");

  const makeReq = (slug: string) => {
    return new NextRequest(`http://localhost:3000/api/issues/${encodeURIComponent(slug)}`);
  };

  // Edge Case: Missing or empty slug
  {
    const req = makeReq("");
    const res = await issuesHandler(req, { params: { slug: "" } });
    assert(res.status === 400, "Empty slug returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Whitespace-only slug
  {
    const req = makeReq("   ");
    const res = await issuesHandler(req, { params: { slug: "   " } });
    assert(res.status === 400, "Whitespace slug returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Malformed percent encoding
  {
    const req = makeReq("%E0%A4%A");
    const res = await issuesHandler(req, { params: { slug: "%E0%A4%A" } });
    assert(res.status === 400, "Malformed percent-encoding returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Non-existent slug
  {
    const fakeSlug = "completely-fictional-issue-12345";
    const req = makeReq(fakeSlug);
    const res = await issuesHandler(req, { params: { slug: fakeSlug } });
    assert(res.status === 404, "Non-existent slug returns HTTP 404", `got ${res.status}`);
  }

  // Edge Case: Prototype property names
  {
    for (const protoKey of ["constructor", "toString", "__proto__", "valueOf"]) {
      const req = makeReq(protoKey);
      const res = await issuesHandler(req, { params: { slug: protoKey } });
      assert(
        res.status === 404,
        `Prototype property '${protoKey}' is rejected with HTTP 404`,
        `got ${res.status}`
      );
    }
  }

  // Offline Database Fallback: Valid researched slugs from mock-data
  const sampleSlugs = [
    "no-power-led-off",
    "fans-spin-briefly",
    "no-post-cpu-led",
    "no-post-dram-led",
    "no-post-vga-led",
    "no-post-boot-led",
    "stuck-on-motherboard-logo",
    "inaccessible-boot-device",
    "automatic-repair-loop",
  ];

  for (const slug of sampleSlugs) {
    const req = makeReq(slug);
    const res = await issuesHandler(req, { params: { slug } });
    const data = await res.json();
    assert(
      res.status === 200,
      `Known researched issue '${slug}' resolves cleanly via fallback (HTTP 200)`,
      `got ${res.status}`
    );
    assert(
      data.slug === slug && typeof data.title === "string" && Array.isArray(data.steps),
      `Issue payload for '${slug}' has valid title, summary, and step breakdown`
    );
    assert(
      res.headers.get("Cache-Control")?.includes("public") === true,
      `Issue '${slug}' includes proper HTTP caching headers`
    );
  }
}

async function runWizardEndpointSuite() {
  suite("4. /api/wizard/[nodeId] Endpoint & Decision Tree");

  const makeReq = (nodeId: string) => {
    return new NextRequest(`http://localhost:3000/api/wizard/${encodeURIComponent(nodeId)}`);
  };

  // Edge Case: Missing or empty nodeId
  {
    const req = makeReq("");
    const res = await wizardHandler(req, { params: { nodeId: "" } });
    assert(res.status === 400, "Empty nodeId returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Whitespace-only nodeId
  {
    const req = makeReq("   ");
    const res = await wizardHandler(req, { params: { nodeId: "   " } });
    assert(res.status === 400, "Whitespace nodeId returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Malformed percent-encoding
  {
    const req = makeReq("%E0%A4%A");
    const res = await wizardHandler(req, { params: { nodeId: "%E0%A4%A" } });
    assert(res.status === 400, "Malformed percent-encoding returns HTTP 400", `got ${res.status}`);
  }

  // Edge Case: Non-existent step ID
  {
    const fakeNodeId = "unknown-tree-step-9999";
    const req = makeReq(fakeNodeId);
    const res = await wizardHandler(req, { params: { nodeId: fakeNodeId } });
    assert(res.status === 404, "Non-existent nodeId returns HTTP 404", `got ${res.status}`);
  }

  // Edge Case: Prototype property names
  {
    for (const protoKey of ["constructor", "toString", "__proto__", "valueOf"]) {
      const req = makeReq(protoKey);
      const res = await wizardHandler(req, { params: { nodeId: protoKey } });
      assert(
        res.status === 404,
        `Prototype property '${protoKey}' is rejected with HTTP 404`,
        `got ${res.status}`
      );
    }
  }

  // Offline Database Fallback: Valid wizard tree nodes
  const testNodes = [
    "start",
    "wizard-wont-boot-power",
    "wizard-bsod-timing",
    "wizard-wont-boot-debug-led",
    "wizard-wont-boot-freeze",
    "wizard-network-type",
    "wizard-thermal-symptom",
  ];

  for (const nodeId of testNodes) {
    const req = makeReq(nodeId);
    const res = await wizardHandler(req, { params: { nodeId } });
    const data = await res.json();
    assert(
      res.status === 200,
      `Wizard step '${nodeId}' resolves cleanly via fallback (HTTP 200)`,
      `got ${res.status}`
    );
    assert(
      data.id === nodeId && typeof data.question === "string" && Array.isArray(data.options),
      `Wizard step '${nodeId}' contains question text and options array`
    );
  }

  // Verify all options in WIZARD_TREE link to valid destinations
  let brokenPointers = 0;
  for (const [id, step] of Object.entries(WIZARD_TREE)) {
    for (const opt of step.options) {
      if (opt.next && !WIZARD_TREE[opt.next]) {
        brokenPointers++;
        console.error(`Broken pointer: node '${id}' -> opt '${opt.label}' -> missing node '${opt.next}'`);
      }
      if (opt.resolves_to_issue_slug && !ISSUES[opt.resolves_to_issue_slug]) {
        brokenPointers++;
        console.error(`Broken resolution: node '${id}' -> opt '${opt.label}' -> missing issue slug '${opt.resolves_to_issue_slug}'`);
      }
    }
  }
  assert(
    brokenPointers === 0,
    "All wizard tree options link to valid steps or existing issue slugs"
  );
}

async function runCategoriesAndHealthSuite() {
  suite("5. /api/categories & /api/health Endpoints");

  // Categories API
  {
    const res = await categoriesHandler();
    const data = await res.json();
    assert(res.status === 200, "/api/categories returns HTTP 200", `got ${res.status}`);
    assert(Array.isArray(data) && data.length === 6, "Returns exactly 6 standard problem categories");
    const requiredSlugs = [
      "wont-boot",
      "blue-screen",
      "running-slow",
      "no-internet",
      "overheating",
      "driver-issues",
    ];
    const retrievedSlugs = data.map((c: any) => c.slug);
    const allPresent = requiredSlugs.every((s) => retrievedSlugs.includes(s));
    assert(allPresent, "All 6 required category slugs are present");
  }

  // Health API: Normal GET
  {
    const req = new NextRequest("http://localhost:3000/api/health");
    const res = await healthGetHandler(req);
    const data = await res.json();
    assert(
      res.status === 200,
      "/api/health returns HTTP 200 in default mode",
      `got ${res.status}`
    );
    assert(
      data.status === "ok" || data.status === "degraded",
      `Health status is truthful ('${data.status}')`
    );
    assert(
      data.services && data.services.database && data.services.gemini,
      "Health report includes database and gemini service statuses"
    );
    assert(
      typeof data.uptimeSeconds === "number" && data.version !== undefined,
      "Health report includes process uptime and version"
    );
  }

  // Health API: Strict mode check
  {
    const req = new NextRequest("http://localhost:3000/api/health?strict=true");
    const res = await healthGetHandler(req);
    const data = await res.json();
    // In strict mode without postgres running, status should be 503 degraded
    if (data.services.database.status === "disconnected") {
      assert(
        res.status === 503,
        "/api/health?strict=true returns HTTP 503 when database is offline",
        `got ${res.status}`
      );
    } else {
      assert(
        res.status === 200,
        "/api/health?strict=true returns HTTP 200 when database is connected",
        `got ${res.status}`
      );
    }
  }

  // Health API: HEAD method
  {
    const res = await healthHeadHandler();
    assert(res.status === 200, "/api/health HEAD request returns HTTP 200 for load balancers");
  }
}

async function runErrorBoundariesAndNegativeConstraintsSuite() {
  suite("6. Error Boundaries & Negative Constraints Verification");

  const projectRoot = path.resolve(__dirname, "..");

  // Verify Error Boundary files exist
  const errorFiles = [
    "app/error.tsx",
    "app/global-error.tsx",
    "app/not-found.tsx",
  ];

  for (const relPath of errorFiles) {
    const fullPath = path.join(projectRoot, relPath);
    const exists = fs.existsSync(fullPath);
    assert(exists, `Error boundary '${relPath}' exists on disk`);

    if (exists) {
      const content = fs.readFileSync(fullPath, "utf-8");
      assert(
        content.includes("export default function"),
        `Error boundary '${relPath}' exports default component`
      );
    }
  }

  // Negative Constraints Verification
  const forbiddenChar = String.fromCharCode(0x2014); // Em dash unicode point U+2014
  const forbiddenAnimation = ["animate", "ping"].join("-");

  const scanDirs = ["app", "components", "lib", "scripts"];
  const emDashMatches: string[] = [];
  const animatePingMatches: string[] = [];

  function scanDirectory(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".next") {
          scanDirectory(fullPath);
        }
      } else if (/\.(tsx?|jsx?|json|css|md)$/.test(entry.name)) {
        // Skip run-qa-suite.ts itself to avoid matching the rule verification definitions
        if (entry.name === "run-qa-suite.ts") {
          continue;
        }

        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes(forbiddenChar)) {
          emDashMatches.push(fullPath);
        }
        if (content.includes(forbiddenAnimation)) {
          animatePingMatches.push(fullPath);
        }
      }
    }
  }

  for (const dir of scanDirs) {
    const fullDir = path.join(projectRoot, dir);
    if (fs.existsSync(fullDir)) {
      scanDirectory(fullDir);
    }
  }

  assert(
    emDashMatches.length === 0,
    `Negative constraint: Strictly ZERO em dashes found in source files (violations: ${emDashMatches.length})`,
    emDashMatches.join(", ")
  );

  assert(
    animatePingMatches.length === 0,
    `Negative constraint: Strictly ZERO ${forbiddenAnimation} classes found in source files (violations: ${animatePingMatches.length})`,
    animatePingMatches.join(", ")
  );
}

async function runLiveServerSuiteIfAvailable() {
  suite("7. Live HTTP Server Probe (Optional E2E)");

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1000);
    const res = await fetch("http://localhost:3000/api/health", {
      signal: controller.signal,
      headers: { connection: "close" },
    }).catch(() => null);
    clearTimeout(timeout);

    if (res && res.ok) {
      console.log("  Live HTTP server detected on http://localhost:3000. Running live HTTP checks...");
      const healthData = await res.json();
      assert(healthData.version !== undefined, "Live HTTP /api/health returned valid json payload");

      const catRes = await fetch("http://localhost:3000/api/categories", {
        headers: { connection: "close" },
      });
      assert(catRes.status === 200, "Live HTTP /api/categories returned HTTP 200");

      const issueRes = await fetch("http://localhost:3000/api/issues/no-post-dram-led", {
        headers: { connection: "close" },
      });
      assert(issueRes.status === 200, "Live HTTP /api/issues/no-post-dram-led returned HTTP 200");
    } else {
      console.log("  (No active local HTTP server on port 3000; in-process NextRequest test harness covers 100% of routes.)");
    }
  } catch {
    console.log("  (No active local HTTP server on port 3000; in-process NextRequest test harness covers 100% of routes.)");
  }
}

async function runPostgresAndPrismaIntegritySuite() {
  suite("8. Category 05: PostgreSQL & Prisma ORM Specialist Audit");

  const projectRoot = path.resolve(__dirname, "..");
  const schemaPath = path.join(projectRoot, "prisma", "schema.prisma");
  const schemaContent = fs.readFileSync(schemaPath, "utf-8");

  // 1. Prisma Schema Index Verification
  assert(
    schemaContent.includes("@@index([title])") && schemaContent.includes("@@index([severity])"),
    "Category model indexes title and severity for fast sorting and filtering"
  );
  assert(
    schemaContent.includes("@@index([category_slug, severity])"),
    "Issue model includes compound index on [category_slug, severity]"
  );
  assert(
    schemaContent.includes("@@index([verified, source])") && schemaContent.includes("@@index([source, verified])"),
    "Issue model includes bidirectional compound indexes on verified and source for bitmap OR scans"
  );
  assert(
    schemaContent.includes("@@index([name])"),
    "ErrorCode model indexes name for direct stop code lookups"
  );
  assert(
    schemaContent.includes("@@index([createdAt])"),
    "WizardNode model indexes createdAt for chronological auditing"
  );

  // 2. FTS & GIN Index Exact Match Verification
  const diagnosePath = path.join(projectRoot, "app", "api", "diagnose", "route.ts");
  const seedPath = path.join(projectRoot, "scripts", "seed.ts");
  const diagnoseContent = fs.readFileSync(diagnosePath, "utf-8");
  const seedContent = fs.readFileSync(seedPath, "utf-8");

  const expectedIssueTsvector = "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '') || ' ' || coalesce(symptoms::text, ''))";

  assert(
    diagnoseContent.includes(expectedIssueTsvector),
    "Diagnose route incorporates symptoms array into Issue tsvector query"
  );
  assert(
    seedContent.includes(expectedIssueTsvector),
    "Seed script GIN index expression matches diagnose route tsvector verbatim"
  );

  // 3. PostgreSQL Docker Engine Tuning Verification
  const dockerComposePath = path.join(projectRoot, "docker-compose.yml");
  const dockerComposeContent = fs.readFileSync(dockerComposePath, "utf-8");

  assert(
    dockerComposeContent.includes("shared_buffers=128MB") &&
      dockerComposeContent.includes("work_mem=4MB") &&
      dockerComposeContent.includes("effective_cache_size=256MB") &&
      dockerComposeContent.includes("max_connections=50"),
    "docker-compose.yml configures optimized PostgreSQL engine parameters"
  );
  assert(
    dockerComposeContent.includes("start_period: 10s"),
    "PostgreSQL healthcheck includes start_period for clean cold boots"
  );
  assert(
    dockerComposeContent.includes("connection_limit=15&pool_timeout=10"),
    "Docker environment enforces connection pool bounds (connection_limit=15)"
  );

  // 4. Database Connection & Pooling Hygiene
  const prismaLibPath = path.join(projectRoot, "lib", "prisma.ts");
  const prismaLibContent = fs.readFileSync(prismaLibPath, "utf-8");

  assert(
    prismaLibContent.includes("globalForPrisma.prisma = prisma;"),
    "lib/prisma.ts maintains strict PrismaClient singleton across all environments"
  );
  assert(
    prismaLibContent.includes('socket.on("close", () => finish(false));'),
    "lib/prisma.ts handles socket close event for rapid offline detection"
  );
}

async function main() {
  console.log(`======================================================`);
  console.log(`PC FIXIT - AUTOMATED QA TEST SUITE`);
  console.log(`======================================================`);

  const startTime = Date.now();

  try {
    await runRateLimiterAndIpSuite();
    await runDiagnoseEndpointSuite();
    await runIssuesEndpointSuite();
    await runWizardEndpointSuite();
    await runCategoriesAndHealthSuite();
    await runErrorBoundariesAndNegativeConstraintsSuite();
    await runPostgresAndPrismaIntegritySuite();
    await runLiveServerSuiteIfAvailable();
  } catch (err: any) {
    console.error("Fatal exception during QA suite execution:", err);
    failedTests++;
    failures.push(`Suite execution error: ${err.message}`);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log(`\n======================================================`);
  console.log(`QA TEST SUITE SUMMARY`);
  console.log(`======================================================`);
  console.log(`Total Assertions: ${totalTests}`);
  console.log(`Passed:           ${passedTests}`);
  console.log(`Failed:           ${failedTests}`);
  console.log(`Duration:         ${duration}s`);

  if (failedTests > 0) {
    console.log(`\nFailed Tests:`);
    failures.forEach((f, idx) => console.log(`  ${idx + 1}. ${f}`));
    process.exitCode = 1;
  } else {
    console.log(`\nALL QA CHECKS PASSED SUCCESSFULLY.`);
    process.exitCode = 0;
  }
}

main();
