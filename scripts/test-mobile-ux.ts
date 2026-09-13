import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";

interface TestResult {
  category: string;
  name: string;
  status: "PASS" | "FAIL";
  details?: string;
}

const results: TestResult[] = [];

function test(category: string, name: string, fn: () => void) {
  try {
    fn();
    results.push({ category, name, status: "PASS" });
    console.log(`[PASS] [${category}] ${name}`);
  } catch (err: any) {
    results.push({ category, name, status: "FAIL", details: err.message });
    console.error(`[FAIL] [${category}] ${name}: ${err.message}`);
  }
}

console.log("==================================================");
console.log("pcfix Mobile UX & Artemis Testing Standard Suite");
console.log("==================================================\n");

// 1. Viewport Meta Configuration
test("Viewport Configuration", "app/layout.tsx exports viewportFit cover and proper scaling", () => {
  const layoutPath = path.join(process.cwd(), "app/layout.tsx");
  const content = fs.readFileSync(layoutPath, "utf-8");
  assert(content.includes('viewportFit: "cover"'), "app/layout.tsx must specify viewportFit: 'cover' for edge-to-edge mobile notches");
  assert(content.includes('width: "device-width"'), "app/layout.tsx must specify width: 'device-width'");
  assert(content.includes('initialScale: 1'), "app/layout.tsx must specify initialScale: 1");
});

// 2. Mobile Touch & Tap Latency Elimination
test("Mobile Touch Hygiene", "app/globals.css specifies touch-action manipulation and removes tap highlight", () => {
  const cssPath = path.join(process.cwd(), "app/globals.css");
  const content = fs.readFileSync(cssPath, "utf-8");
  assert(content.includes("touch-action: manipulation"), "globals.css must set touch-action: manipulation to eliminate 300ms tap delay");
  assert(content.includes("-webkit-tap-highlight-color: transparent"), "globals.css must remove mobile grey tap highlight box");
  assert(content.includes(".pb-safe"), "globals.css must provide pb-safe utility for mobile home indicator");
  assert(content.includes(".touch-scroll"), "globals.css must provide touch-scroll utility for momentum touch rails");
});

// 3. iOS Input Zoom Prevention (>= 16px font size on inputs)
test("Mobile Input Typography", "Form inputs prevent auto-zoom on mobile devices", () => {
  const heroInputPath = path.join(process.cwd(), "components/HeroInput.tsx");
  const heroContent = fs.readFileSync(heroInputPath, "utf-8");
  assert(!heroContent.includes("text-[15px] sm:text-[16px]"), "HeroInput must not use text-[15px] on mobile which triggers Safari zoom");
  assert(heroContent.includes("text-base"), "HeroInput must use text-base (16px) for iOS zoom prevention");

  const chatPath = path.join(process.cwd(), "components/Chat.tsx");
  const chatContent = fs.readFileSync(chatPath, "utf-8");
  assert(chatContent.includes("text-base"), "Chat input must use text-base (16px) for iOS zoom prevention");
});

// 4. Mobile Navigation Drawer Architecture
test("Mobile Navigation Architecture", "Header mobile menu uses overlay sheet rather than pushing page content", () => {
  const headerPath = path.join(process.cwd(), "components/Header.tsx");
  const content = fs.readFileSync(headerPath, "utf-8");
  assert(content.includes("fixed inset-0 top-"), "Header must render a backdrop overlay for mobile nav");
  assert(content.includes("absolute left-0 right-0 top-full"), "Mobile nav must use absolute positioning to prevent page CLS");
  assert(content.includes("document.body.style.overflow = \"hidden\""), "Mobile nav must lock background body scroll when active");
});

// 5. Native Mobile Sharing
test("Mobile Sharing Capability", "Issue detail view utilizes navigator.share on mobile devices", () => {
  const issueViewPath = path.join(process.cwd(), "components/IssueDetailView.tsx");
  const content = fs.readFileSync(issueViewPath, "utf-8");
  assert(content.includes("navigator.share"), "IssueDetailView must support native mobile share dialog");
});

// 6. Negative Constraints Enforcement
test("Negative Constraints", "Zero em dashes and zero blinking ping animations across all code", () => {
  const filesToCheck = [
    "app/layout.tsx",
    "app/globals.css",
    "components/Header.tsx",
    "components/HeroInput.tsx",
    "components/QuickTriageDeck.tsx",
    "components/Chat.tsx",
    "components/IssueDetailView.tsx",
  ];

  for (const file of filesToCheck) {
    const fullPath = path.join(process.cwd(), file);
    const content = fs.readFileSync(fullPath, "utf-8");
    const forbiddenChar = String.fromCharCode(0x2014);
    const forbiddenAnim = ["animate", "ping"].join("-");
    assert(!content.includes(forbiddenChar), `File ${file} contains forbidden em dash`);
    assert(!content.includes(forbiddenAnim), `File ${file} contains forbidden animation`);
  }
});

console.log("\n--------------------------------------------------");
const passCount = results.filter((r) => r.status === "PASS").length;
const failCount = results.filter((r) => r.status === "FAIL").length;
console.log(`Mobile UX Suite: ${passCount} passed, ${failCount} failed.`);
console.log("--------------------------------------------------\n");

if (failCount > 0) {
  process.exit(1);
}
