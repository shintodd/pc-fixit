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

  // 8. Error Handling: Invalid JSON-RPC version
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "1.0",
        id: 7,
        method: "ping",
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 400, "POST with invalid jsonrpc version returns HTTP 400");
    assert(data.error?.code === -32600, "Returns code -32600 for invalid jsonrpc version");
  }

  // 9. Error Handling: Unknown Method
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 8,
        method: "non_existent_method",
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(res.status === 200, "POST with unknown method returns HTTP 200 with error object");
    assert(data.error?.code === -32601, "Returns code -32601 for Method not found");
  }

  // 10. Error Handling: Missing Tool Call Name
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 9,
        method: "tools/call",
        params: {},
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(data.error?.code === -32602, "Returns code -32602 when tool name is missing");
  }

  // 11. Error Handling: Tool Call with Missing Required Params
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 10,
        method: "tools/call",
        params: {
          name: "pcfix_diagnose",
          arguments: {},
        },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(data.error?.code === -32602, "Returns code -32602 when diagnose 'query' is omitted");
    assert(data.error?.message.includes("query"), "Error message specifies missing 'query'");
  }

  // 12. Error Handling: Invalid Resource URI Scheme
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 11,
        method: "resources/read",
        params: { uri: "https://external-resource.com" },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(data.error?.code === -32602, "Returns code -32602 for invalid URI scheme");
    assert(data.error?.message.includes("pcfix://"), "Error message mandates 'pcfix://' scheme");
  }

  // 13. Error Handling: Non-Existent Resource URI
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 12,
        method: "resources/read",
        params: { uri: "pcfix://fictional-resource" },
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(data.error?.code === -32602, "Returns code -32602 for unknown resource URI");
    assert(data.error?.message.includes("Resource not found"), "Error message states Resource not found");
  }

  // 14. Notification Handling (notifications/initialized returns HTTP 204)
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/initialized",
      }),
    });
    const res = await mcpPostHandler(req);
    assert(res.status === 204, "Notification returns HTTP 204 No Content");
  }

  // 15. Preserving numeric id 0 in JSON-RPC
  {
    const req = new NextRequest("http://localhost:3000/api/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 0,
        method: "ping",
      }),
    });
    const res = await mcpPostHandler(req);
    const data = await res.json();
    assert(data.id === 0, "Preserves numeric id 0 without converting to null");
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
