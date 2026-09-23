import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { getPartBySlug } from "@/lib/parts/repository";

export const runtime = "nodejs";

// In-memory watchlist fallback store
const inMemoryWatchlists: Array<{
  id: string;
  userEmail: string;
  partId: string;
  partName: string;
  targetPriceMyr: number;
  currentPriceMyr: number;
  notifyChannel: string;
  createdAt: string;
}> = [];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || searchParams.get("userEmail");

  if (!email) {
    return NextResponse.json({ success: false, error: "Query parameter 'email' is required" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    try {
      const items = await prisma.partWatchlist.findMany({
        where: { userEmail: email, isActive: true },
        include: { part: true },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        success: true,
        count: items.length,
        items: items.map((i) => ({
          id: i.id,
          userEmail: i.userEmail,
          partId: i.partId,
          partSlug: i.part.slug,
          partName: i.part.name,
          targetPriceMyr: Number(i.targetPriceMyr),
          notifyChannel: i.notifyChannel,
          createdAt: i.createdAt.toISOString(),
        })),
      });
    } catch (_) {}
  }

  const filtered = inMemoryWatchlists.filter((w) => w.userEmail.toLowerCase() === email.toLowerCase());
  return NextResponse.json({
    success: true,
    count: filtered.length,
    items: filtered,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userEmail, partSlug, partId, targetPriceMyr, notifyChannel = "in_app", webhookUrl } = body;

    if (!userEmail || (!partSlug && !partId) || !targetPriceMyr) {
      return NextResponse.json(
        { success: false, error: "Fields 'userEmail', 'partSlug' (or 'partId'), and 'targetPriceMyr' are required" },
        { status: 400 }
      );
    }

    const part = await getPartBySlug(partSlug || partId);
    if (!part) {
      return NextResponse.json({ success: false, error: "Part not found" }, { status: 404 });
    }

    const targetPrice = Number(targetPriceMyr);
    const dbAvailable = await isDatabaseAvailable();

    if (dbAvailable) {
      try {
        const item = await prisma.partWatchlist.create({
          data: {
            userEmail,
            partId: part.id,
            targetPriceMyr: targetPrice,
            notifyChannel,
            webhookUrl,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Watchlist active: alert will fire when ${part.name} drops below RM${targetPrice}.`,
          watch: {
            id: item.id,
            partName: part.name,
            currentPriceMyr: part.bestPriceMyr,
            targetPriceMyr: targetPrice,
          },
        });
      } catch (err: any) {
        console.warn("DB watchlist write error:", err.message);
      }
    }

    // In-memory fallback
    const fallbackId = `watch-${Date.now()}`;
    const entry = {
      id: fallbackId,
      userEmail,
      partId: part.id,
      partName: part.name,
      targetPriceMyr: targetPrice,
      currentPriceMyr: part.bestPriceMyr,
      notifyChannel,
      createdAt: new Date().toISOString(),
    };
    inMemoryWatchlists.push(entry);

    return NextResponse.json({
      success: true,
      message: `Watchlist active: alert will fire when ${part.name} drops below RM${targetPrice}.`,
      watch: entry,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ success: false, error: "Query param 'id' required" }, { status: 400 });
  }

  const dbAvailable = await isDatabaseAvailable();
  if (dbAvailable) {
    try {
      await prisma.partWatchlist.delete({ where: { id } });
      return NextResponse.json({ success: true, message: "Watchlist entry removed" });
    } catch (_) {}
  }

  const idx = inMemoryWatchlists.findIndex((w) => w.id === id);
  if (idx !== -1) {
    inMemoryWatchlists.splice(idx, 1);
  }

  return NextResponse.json({ success: true, message: "Watchlist entry removed" });
}
