import { NextRequest, NextResponse } from "next/server";
import { ISSUES, IssueDetail } from "@/lib/mock-data";
import { CATEGORIES } from "@/lib/categories";
import siliconDefects from "@/data/research/silicon_defects.json";
import wizardTree from "@/data/research/wizard_tree.json";

export const runtime = "nodejs";

const Q_CODES = [
  { code: "00", category: "CPU", brands: "ASUS, MSI, ASRock", title: "CPU Execution Fault", fix: "Inspect EPS 12V 8-pin power cable. Inspect CPU LGA socket pins." },
  { code: "15", category: "RAM", brands: "ASUS, ASRock", title: "Pre-Memory System Agent Init", fix: "Wait up to 3 minutes for DDR5 memory training. Clear CMOS if hung." },
  { code: "55", category: "RAM", brands: "ASUS, MSI, Gigabyte, ASRock", title: "Memory Not Installed", fix: "Reseat RAM firmly into slots 2 and 4 until latches click shut." },
  { code: "79", category: "BOOT", brands: "ASUS, MSI", title: "CSM Initialization", fix: "Enter BIOS and switch boot mode from CSM to Pure UEFI mode." },
  { code: "99", category: "BOOT", brands: "ASUS, MSI, ASRock", title: "Super IO / PCIe Initialization", fix: "Unplug external USB peripherals and front-panel USB headers." },
  { code: "A2", category: "BOOT", brands: "ASUS, MSI, Gigabyte, ASRock", title: "IDE / SATA / NVMe Detection", fix: "Reseat M.2 NVMe SSD into top CPU-attached slot and check SATA cables." },
  { code: "b4", category: "BOOT", brands: "ASUS, MSI", title: "USB Device Hot Plug Fault", fix: "Unplug all USB devices except basic keyboard. Check for bent USB pins." },
  { code: "C5", category: "RAM", brands: "ASUS, ASRock", title: "Memory SPD Reading Error", fix: "Clear CMOS to revert to standard JEDEC defaults. Test single DIMM." },
  { code: "d6", category: "GPU", brands: "ASUS, MSI, Gigabyte, ASRock", title: "No Console Output / No GPU", fix: "Turn monitor on first. Ensure cable is in lower GPU port, not motherboard." },
  { code: "d7", category: "BOOT", brands: "ASUS, MSI, ASRock", title: "No Input Devices Found", fix: "Connect standard USB keyboard to rear I/O USB 2.0 port." },
  { code: "0d", category: "RAM", brands: "ASUS, MSI, Gigabyte", title: "Memory Training Failure (AM5)", fix: "Wait 3-5 minutes on first boot. Update BIOS to latest AGESA for DDR5." },
  { code: "AA", category: "NORMAL", brands: "ASUS, MSI, Gigabyte, ASRock", title: "System Booted Into OS (ACPI)", fix: "System is healthy. Operating system has full hardware control." },
  { code: "F9", category: "BOOT", brands: "ASUS, Gigabyte", title: "Recovery Firmware Requested", fix: "Use rear USB BIOS Flashback button with FAT32 flash drive to reflash BIOS." },
];

const TOOLS = [
  {
    name: "pcfix_diagnose",
    description: "Search pcfix database of 220 hardware troubleshooting guides by symptom, keyword, or error code to get verified step-by-step physical repair instructions.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Hardware problem description (e.g. 'black screen DRAM light', 'fans spin then turn off', 'Wi-Fi 169.254 address', '0x133')",
        },
        category: {
          type: "string",
          enum: ["wont-boot", "blue-screen", "running-slow", "no-internet", "overheating", "driver-issues"],
          description: "Optional category filter",
        },
        limit: {
          type: "number",
          description: "Maximum number of results to return (default: 3)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "pcfix_get_guide",
    description: "Retrieve complete step-by-step diagnostic and physical repair instructions for a specific pcfix issue slug.",
    inputSchema: {
      type: "object",
      properties: {
        slug: {
          type: "string",
          description: "Unique issue slug (e.g. 'no-post-dram-led', 'fans-spin-briefly', 'gpu-driver-crash-black-screen')",
        },
      },
      required: ["slug"],
    },
  },
  {
    name: "pcfix_motherboard_qcode",
    description: "Decode 2-digit hex motherboard debug Q-Code (ASUS, MSI, Gigabyte, ASRock) displayed on seven-segment LEDs when PC will not boot.",
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "2-character hex code (e.g. '00', '55', 'd6', 'A2', 'C5', '99')",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "pcfix_check_silicon_defects",
    description: "Check verified manufacturer hardware recalls, architectural defects, and silicon bugs (Intel 13th/14th Gen Vmin shift, NVIDIA 12VHPWR melting, AMD AM5 SoC voltage, Samsung 980 Pro 0E lockup).",
    inputSchema: {
      type: "object",
      properties: {
        component: {
          type: "string",
          description: "Hardware model or keyword (e.g. '13900K', '4090', '980 Pro', 'AM5', 'modular psu')",
        },
      },
    },
  },
  {
    name: "pcfix_front_panel_pinout",
    description: "Get standard 9-pin Intel front-panel header pinout wiring, wire polarities, and safe screwdriver jumpstart test instructions.",
    inputSchema: {
      type: "object",
      properties: {
        mode: {
          type: "string",
          enum: ["wiring", "jumpstart"],
          description: "Wiring layout or screwdriver jumpstart test guide",
        },
      },
    },
  },
];

const RESOURCES = [
  {
    uri: "pcfix://categories",
    name: "Hardware Problem Categories",
    description: "The 6 core PC hardware diagnostic categories supported by pcfix",
    mimeType: "application/json",
  },
  {
    uri: "pcfix://silicon-defects",
    name: "Known Silicon Defects Registry",
    description: "Verified architectural defects, recall notices, and vendor fixes",
    mimeType: "application/json",
  },
  {
    uri: "pcfix://wizard-tree",
    name: "Interactive Triage Decision Tree",
    description: "17-node guided troubleshooting decision tree graph",
    mimeType: "application/json",
  },
];

// GET: Server info and MCP capabilities
export async function GET() {
  return NextResponse.json(
    {
      name: "pcfix-mcp-server",
      version: "1.0.0",
      protocolVersion: "2024-11-05",
      description: "pcfix Model Context Protocol (MCP) server: Real-time PC hardware diagnostic engine, motherboard Q-Code lookup, and verified repair database.",
      endpoints: {
        mcpJsonRpc: "/api/mcp",
        health: "/api/health",
        categories: "/api/categories",
      },
      capabilities: {
        tools: TOOLS.map((t) => t.name),
        resources: RESOURCES.map((r) => r.uri),
      },
    },
    {
      headers: {
        "Cache-Control": "public, max-age=3600",
      },
    }
  );
}

// POST: JSON-RPC 2.0 Handler
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error: Invalid JSON" } },
      { status: 400 }
    );
  }

  const { jsonrpc, id, method, params } = body;

  if (jsonrpc !== "2.0") {
    return NextResponse.json(
      { jsonrpc: "2.0", id: id || null, error: { code: -32600, message: "Invalid Request: jsonrpc must be '2.0'" } },
      { status: 400 }
    );
  }

  // 1. Initialize
  if (method === "initialize") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: { listChanged: false },
          resources: { listChanged: false },
        },
        serverInfo: {
          name: "pcfix-mcp-server",
          version: "1.0.0",
        },
        instructions: "pcfix MCP Server provides verified PC hardware diagnostic procedures, motherboard POST Q-Code decoders, and silicon defect alerts. Always prioritize power safety steps before instructing users to open computer chassis or touch components.",
      },
    });
  }

  // 2. Notification ack
  if (method === "notifications/initialized") {
    return new NextResponse(null, { status: 204 });
  }

  // 3. Ping
  if (method === "ping") {
    return NextResponse.json({ jsonrpc: "2.0", id, result: {} });
  }

  // 4. Tools List
  if (method === "tools/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        tools: TOOLS,
      },
    });
  }

  // 5. Tools Call
  if (method === "tools/call") {
    const toolName = params?.name;
    const args = params?.arguments || {};

    if (!toolName) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: "Invalid params: missing tool name" },
      });
    }

    try {
      let resultData: any;

      switch (toolName) {
        case "pcfix_diagnose": {
          const query = String(args.query || "").toLowerCase();
          const category = args.category;
          const limit = typeof args.limit === "number" ? Math.min(args.limit, 10) : 3;

          const queryTokens = query.split(/\s+/).filter((t) => t.length > 1);
          const allIssues = Object.values(ISSUES);

          const scored = allIssues
            .filter((issue) => !category || issue.category_slug === category)
            .map((issue) => {
              let score = 0;
              const textCorpus = `${issue.title} ${issue.summary} ${issue.symptoms.join(" ")} ${issue.slug}`.toLowerCase();
              const highTechTokens = new Set(["dram", "vga", "cpu", "ram", "gpu", "nvme", "bsod", "qcode", "cmos", "12vhpwr", "post"]);

              for (const token of queryTokens) {
                const isHighTech = highTechTokens.has(token);
                const weight = isHighTech ? 10 : 1;

                if (textCorpus.includes(token)) score += weight;
                if (issue.title.toLowerCase().includes(token)) score += weight * 2;
                if (issue.slug.includes(token)) score += weight * 4;
              }
              return { issue, score };
            })
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map((item) => ({
              slug: item.issue.slug,
              title: item.issue.title,
              summary: item.issue.summary,
              severity: item.issue.severity,
              category: item.issue.category_slug,
              symptoms: item.issue.symptoms,
              stepsCount: item.issue.fix_steps.length,
              steps: item.issue.fix_steps,
            }));

          resultData = {
            query: args.query,
            matchesFound: scored.length,
            guides: scored,
          };
          break;
        }

        case "pcfix_get_guide": {
          const slug = String(args.slug || "").trim();
          const issue = ISSUES[slug];
          if (!issue) {
            resultData = {
              error: `No guide found with slug '${slug}'. Use pcfix_diagnose to find valid issue slugs.`,
            };
          } else {
            resultData = {
              slug: issue.slug,
              title: issue.title,
              summary: issue.summary,
              severity: issue.severity,
              category: issue.category_slug,
              symptoms: issue.symptoms,
              fix_steps: issue.fix_steps,
              related_error_codes: issue.related_error_codes,
            };
          }
          break;
        }

        case "pcfix_motherboard_qcode": {
          const code = String(args.code || "").trim().toUpperCase();
          const match = Q_CODES.find((q) => q.code.toUpperCase() === code);
          if (!match) {
            resultData = {
              code,
              found: false,
              message: `Q-Code '${code}' not in standard debug index. Check manufacturer manual or inspect 4-LED debug array (CPU, DRAM, VGA, BOOT).`,
              allIndexedCodes: Q_CODES.map((q) => `${q.code} (${q.title})`),
            };
          } else {
            resultData = {
              code: match.code,
              found: true,
              category: match.category,
              supportedMotherboards: match.brands,
              meaning: match.title,
              remediation: match.fix,
            };
          }
          break;
        }

        case "pcfix_check_silicon_defects": {
          const comp = String(args.component || "").toLowerCase();
          const matches = (siliconDefects as any[]).filter((d) => {
            if (!comp) return true;
            const hay = `${d.id} ${d.component} ${d.flawNameEn} ${d.category}`.toLowerCase();
            if (hay.includes(comp)) return true;
            if ((comp.includes("13900") || comp.includes("14900") || comp.includes("13th") || comp.includes("14th") || comp.includes("raptor")) && d.id.includes("intel-13-14")) return true;
            if ((comp.includes("4090") || comp.includes("4080") || comp.includes("12vhpwr")) && d.id.includes("12vhpwr")) return true;
            if ((comp.includes("am5") || comp.includes("7800") || comp.includes("ryzen 7000")) && d.id.includes("am5")) return true;
            if ((comp.includes("980") || comp.includes("samsung")) && d.id.includes("samsung")) return true;
            return false;
          });

          resultData = {
            filter: comp || "all",
            count: matches.length,
            defects: matches.map((m) => ({
              id: m.id,
              component: m.component,
              category: m.category,
              severity: m.severity,
              defect: m.flawNameEn,
              symptoms: m.symptomsEn,
              remediation: m.fixEn,
            })),
          };
          break;
        }

        case "pcfix_front_panel_pinout": {
          resultData = {
            standard: "Intel 9-Pin Front Panel (JFP1) Header",
            pins: [
              { pin: 1, label: "HDD LED +", polarity: "+ (Positive Anode)", note: "Drive activity light" },
              { pin: 2, label: "PWR LED +", polarity: "+ (Positive Anode)", note: "Power status light" },
              { pin: 3, label: "HDD LED -", polarity: "- (Ground)", note: "Drive activity ground" },
              { pin: 4, label: "PWR LED -", polarity: "- (Ground)", note: "Power status ground" },
              { pin: 5, label: "RESET SW", polarity: "No Polarity", note: "Momentary reset switch" },
              { pin: 6, label: "PWR SW", polarity: "No Polarity", note: "Main power button switch" },
              { pin: 7, label: "RESET SW (GND)", polarity: "No Polarity", note: "Reset circuit ground" },
              { pin: 8, label: "PWR SW (GND)", polarity: "No Polarity", note: "Power circuit ground" },
              { pin: 10, label: "KEY / BLANK", polarity: "Empty", note: "Missing pin orientation guide" },
            ],
            jumpstartProcedure: "To test if case power button is broken: With power connected, touch the metal tip of a flathead screwdriver across Pin 6 and Pin 8 for 1 second. System will turn on. Touch ONLY Pins 6 and 8.",
            safetyWarning: "Never touch 12V RGB, USB, or Audio headers with metal tools. Only bridge Pins 6 and 8 on the front-panel header.",
          };
          break;
        }

        default:
          return NextResponse.json({
            jsonrpc: "2.0",
            id,
            error: { code: -32601, message: `Method not found: unknown tool '${toolName}'` },
          });
      }

      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        result: {
          content: [
            {
              type: "text",
              text: JSON.stringify(resultData, null, 2),
            },
          ],
        },
      });
    } catch (err: any) {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: `Tool execution failed: ${err.message}` },
      });
    }
  }

  // 6. Resources List
  if (method === "resources/list") {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        resources: RESOURCES,
      },
    });
  }

  // 7. Resources Read
  if (method === "resources/read") {
    const uri = params?.uri;
    let contentText = "";

    if (uri === "pcfix://categories") {
      contentText = JSON.stringify(CATEGORIES, null, 2);
    } else if (uri === "pcfix://silicon-defects") {
      contentText = JSON.stringify(siliconDefects, null, 2);
    } else if (uri === "pcfix://wizard-tree") {
      contentText = JSON.stringify(wizardTree, null, 2);
    } else {
      return NextResponse.json({
        jsonrpc: "2.0",
        id,
        error: { code: -32602, message: `Resource not found: '${uri}'` },
      });
    }

    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      result: {
        contents: [
          {
            uri,
            mimeType: "application/json",
            text: contentText,
          },
        ],
      },
    });
  }

  return NextResponse.json({
    jsonrpc: "2.0",
    id,
    error: { code: -32601, message: `Method not found: '${method}'` },
  });
}
