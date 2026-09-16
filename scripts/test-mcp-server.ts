import { NextRequest } from "next/server";
import { GET as mcpGetHandler, POST as mcpPostHandler } from "../app/api/mcp/route";

async function runMcpTests() {
  console.log("======================================================");
  console.log("TESTING PCFIX MODEL CONTEXT PROTOCOL (MCP) SERVER");
  console.log("======================================================\n");

  let passes = 0;
  let fails = 0;

  function assert(cond: boolean, name: string, detail?: string) {
    if (cond) {
      passes++;
      console.log(`  [PASS] ${name}`);
    } else {
      fails++;
      console.error(`  [FAIL] ${name} ${detail ? "-> " + detail : ""}`);
    }
  }

  // 1. GET /api/mcp
  {
    const req = new NextRequest("http://localhost:3000/api/mcp");
    const res = await mcpGetHandler();
    const data = await res.json();
    assert(res.status === 200, "GET /api/mcp returns HTTP 200");
    assert(data.name === "pcfix-mcp-server", "Returns correct server name");
    assert(Array.isArray(data.capabilities.tools), "Returns tools capability list");
  }

  // 2. POST initialize
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: { clientInfo: { name: "test-agent", version: "1.0" } },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST initialize returns HTTP 200");
    assert(data.result.serverInfo.name === "pcfix-mcp-server", "Initialize returns serverInfo");
    assert(data.result.protocolVersion === "2024-11-05", "Returns valid protocolVersion");
  }

  // 3. POST tools/list
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/list",
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST tools/list returns HTTP 200");
    assert(data.result.tools.length >= 5, `Returns at least 5 MCP tools (found: ${data.result.tools.length})`);
  }

  // 4. POST tools/call: pcfix_diagnose
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 3,
        method: "tools/call",
        params: {
          name: "pcfix_diagnose",
          arguments: { query: "black screen DRAM LED", limit: 2 },
        },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST tools/call pcfix_diagnose returns HTTP 200");
    const parsedContent = JSON.parse(data.result.content[0].text);
    assert(parsedContent.matchesFound > 0, "Finds matching diagnostic guides");
    assert(parsedContent.guides[0].slug.includes("dram") || parsedContent.guides[0].slug.includes("boot"), "Matched relevant DRAM or boot guide");
  }

  // 5. POST tools/call: pcfix_motherboard_qcode
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 4,
        method: "tools/call",
        params: {
          name: "pcfix_motherboard_qcode",
          arguments: { code: "55" },
        },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST tools/call pcfix_motherboard_qcode returns HTTP 200");
    const parsed = JSON.parse(data.result.content[0].text);
    assert(parsed.found === true, "Q-Code 55 is found in database");
    assert(parsed.meaning.includes("Memory"), "Q-Code 55 identifies memory fault");
  }

  // 6. POST tools/call: pcfix_check_silicon_defects
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 5,
        method: "tools/call",
        params: {
          name: "pcfix_check_silicon_defects",
          arguments: { component: "13900K" },
        },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST tools/call pcfix_check_silicon_defects returns HTTP 200");
    const parsed = JSON.parse(data.result.content[0].text);
    assert(parsed.count > 0, "Identifies Intel 13th Gen flaw");
    assert(parsed.defects[0].remediation.includes("0x12B"), "Prescribes 0x12B microcode remediation");
  }

  // 7. POST resources/list & resources/read
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 6,
        method: "resources/read",
        params: { uri: "pcfix://categories" },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST resources/read returns HTTP 200");
    assert(data.result.contents[0].uri === "pcfix://categories", "Returns requested resource URI");
  }

  console.log("\n======================================================");
  console.log(`MCP SERVER TESTS COMPLETED: ${passes} Passed, ${fails} Failed`);
  console.log("======================================================");

  if (fails > 0) process.exit(1);
}

runMcpTests().catch((err) => {
  console.error("Test error:", err);
  process.exit(1);
});
