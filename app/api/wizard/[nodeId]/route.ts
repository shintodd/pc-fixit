import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { WIZARD_TREE } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
};

export async function GET(
  _req: NextRequest,
  { params }: { params?: { nodeId?: string } }
) {
  const rawNodeId = params?.nodeId;
  if (!rawNodeId || typeof rawNodeId !== "string" || !rawNodeId.trim()) {
    return NextResponse.json(
      { error: "Invalid or missing nodeId" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let nodeId: string;
  try {
    nodeId = decodeURIComponent(rawNodeId).trim();
  } catch {
    return NextResponse.json(
      { error: "Malformed nodeId encoding" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!nodeId) {
    return NextResponse.json(
      { error: "Invalid or missing nodeId" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const VALID_NODE_ID_REGEX = /^[a-zA-Z0-9_-]{1,120}$/;
  if (!VALID_NODE_ID_REGEX.test(nodeId)) {
    return NextResponse.json(
      { error: "Invalid wizard nodeId format" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (await isDatabaseAvailable()) {
    try {
      const node = await prisma.wizardNode.findUnique({
        where: { id: nodeId },
      });

      if (node) {
        return NextResponse.json(node, { headers: CACHE_HEADERS });
      }
    } catch (err: any) {
      console.warn(`Database unavailable for wizard node ${nodeId}, falling back to static research data:`, err.message);
    }
  }

  // Fallback to compiled research tree if DB is offline or not yet seeded
  if (Object.prototype.hasOwnProperty.call(WIZARD_TREE, nodeId)) {
    const fallbackStep = WIZARD_TREE[nodeId];
    if (fallbackStep) {
      return NextResponse.json(
        {
          id: fallbackStep.id,
          question: fallbackStep.question,
          options: fallbackStep.options,
        },
        { headers: CACHE_HEADERS }
      );
    }
  }

  return NextResponse.json(
    { error: `Wizard step '${nodeId}' not found` },
    { status: 404, headers: { "Cache-Control": "no-store" } }
  );
}
