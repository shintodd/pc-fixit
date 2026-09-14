import { NextRequest, NextResponse } from "next/server";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { ISSUES } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
};

export async function GET(
  _req: NextRequest,
  { params }: { params?: { slug?: string } }
) {
  const rawSlug = params?.slug;
  if (!rawSlug || typeof rawSlug !== "string" || !rawSlug.trim()) {
    return NextResponse.json(
      { error: "Invalid or missing issue slug" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  let slug: string;
  try {
    slug = decodeURIComponent(rawSlug).trim();
  } catch {
    return NextResponse.json(
      { error: "Malformed issue slug encoding" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (!slug) {
    return NextResponse.json(
      { error: "Invalid or missing issue slug" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  const VALID_SLUG_REGEX = /^[a-zA-Z0-9_-]{1,120}$/;
  if (!VALID_SLUG_REGEX.test(slug)) {
    return NextResponse.json(
      { error: "Invalid issue slug format" },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  if (await isDatabaseAvailable()) {
    try {
      const issue = await prisma.issue.findUnique({
        where: { slug },
        include: {
          category: true,
          error_codes: true,
        },
      });

      if (issue) {
        return NextResponse.json(issue, { headers: CACHE_HEADERS });
      }
    } catch (err: any) {
      console.warn(`Database unavailable for issue ${slug}, falling back to static research data:`, err.message);
    }
  }

  // Fallback to compiled research data if DB is offline or not yet seeded
  if (Object.prototype.hasOwnProperty.call(ISSUES, slug)) {
    const fallbackIssue = ISSUES[slug];
    if (fallbackIssue) {
      return NextResponse.json(fallbackIssue, { headers: CACHE_HEADERS });
    }
  }

  return NextResponse.json(
    { error: "Issue not found" },
    { status: 404, headers: { "Cache-Control": "no-store" } }
  );
}
