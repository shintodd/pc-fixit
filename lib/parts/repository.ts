import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { PartItem, ComponentType, RetailerQuote } from "@/lib/parts/types";
import { SEED_PARTS, RETAILERS } from "@/lib/parts/ingestion/mock-seed-data";

export async function getAllParts(filter?: {
  type?: ComponentType;
  brand?: string;
  inStockOnly?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}): Promise<PartItem[]> {
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const where: any = {};
      if (filter?.type) where.type = filter.type;
      if (filter?.brand) where.brand = { equals: filter.brand, mode: "insensitive" };
      if (filter?.search) {
        where.OR = [
          { name: { contains: filter.search, mode: "insensitive" } },
          { model: { contains: filter.search, mode: "insensitive" } },
        ];
      }

      const dbParts = await prisma.part.findMany({
        where,
        include: {
          prices: {
            include: { retailer: true },
          },
        },
        orderBy: { benchmarkScore: "desc" },
      });

      if (dbParts.length > 0) {
        return dbParts
          .map((p) => {
            const prices: RetailerQuote[] = p.prices.map((pr) => ({
              retailerId: pr.retailerId,
              retailerName: pr.retailer.name,
              retailerSlug: pr.retailer.slug,
              priceMyr: Number(pr.priceMyr),
              originalPriceMyr: pr.originalPriceMyr ? Number(pr.originalPriceMyr) : undefined,
              inStock: pr.inStock,
              stockQuantity: pr.stockQuantity ?? undefined,
              productUrl: pr.productUrl,
              lastScrapedAt: pr.lastScrapedAt.toISOString(),
            }));

            const inStockPrices = prices.filter((pr) => pr.inStock);
            const bestPriceMyr = inStockPrices.length > 0
              ? Math.min(...inStockPrices.map((pr) => pr.priceMyr))
              : (prices.length > 0 ? Math.min(...prices.map((pr) => pr.priceMyr)) : 0);

            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              brand: p.brand,
              model: p.model,
              type: p.type as ComponentType,
              specs: p.specs as any,
              benchmarkScore: p.benchmarkScore,
              imageUrl: p.imageUrl ?? undefined,
              bestPriceMyr,
              inStock: inStockPrices.length > 0,
              prices,
            };
          })
          .filter((p) => {
            if (filter?.inStockOnly && !p.inStock) return false;
            if (filter?.minPrice && p.bestPriceMyr < filter.minPrice) return false;
            if (filter?.maxPrice && p.bestPriceMyr > filter.maxPrice) return false;
            return true;
          });
      }
    } catch (err) {
      console.warn("PostgreSQL parts query failed, using in-memory seed catalog:", err);
    }
  }

  // In-Memory Fallback
  return SEED_PARTS.filter((p) => {
    if (filter?.type && p.type !== filter.type) return false;
    if (filter?.brand && p.brand.toLowerCase() !== filter.brand.toLowerCase()) return false;
    if (filter?.inStockOnly && !p.inStock) return false;
    if (filter?.minPrice && p.bestPriceMyr < filter.minPrice) return false;
    if (filter?.maxPrice && p.bestPriceMyr > filter.maxPrice) return false;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.model.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });
}

export async function getPartBySlug(slug: string): Promise<PartItem | null> {
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const dbPart = await prisma.part.findUnique({
        where: { slug },
        include: {
          prices: { include: { retailer: true } },
        },
      });

      if (dbPart) {
        const prices: RetailerQuote[] = dbPart.prices.map((pr) => ({
          retailerId: pr.retailerId,
          retailerName: pr.retailer.name,
          retailerSlug: pr.retailer.slug,
          priceMyr: Number(pr.priceMyr),
          originalPriceMyr: pr.originalPriceMyr ? Number(pr.originalPriceMyr) : undefined,
          inStock: pr.inStock,
          stockQuantity: pr.stockQuantity ?? undefined,
          productUrl: pr.productUrl,
          lastScrapedAt: pr.lastScrapedAt.toISOString(),
        }));

        const inStockPrices = prices.filter((pr) => pr.inStock);
        const bestPriceMyr = inStockPrices.length > 0
          ? Math.min(...inStockPrices.map((pr) => pr.priceMyr))
          : (prices.length > 0 ? Math.min(...prices.map((pr) => pr.priceMyr)) : 0);

        return {
          id: dbPart.id,
          slug: dbPart.slug,
          name: dbPart.name,
          brand: dbPart.brand,
          model: dbPart.model,
          type: dbPart.type as ComponentType,
          specs: dbPart.specs as any,
          benchmarkScore: dbPart.benchmarkScore,
          imageUrl: dbPart.imageUrl ?? undefined,
          bestPriceMyr,
          inStock: inStockPrices.length > 0,
          prices,
        };
      }
    } catch (err) {
      console.warn("PostgreSQL getPartBySlug failed, falling back:", err);
    }
  }

  return SEED_PARTS.find((p) => p.slug === slug || p.id === slug) || null;
}

export async function getPriceHistory(partId: string): Promise<{ date: string; priceMyr: number; retailerName: string }[]> {
  const dbAvailable = await isDatabaseAvailable();

  if (dbAvailable) {
    try {
      const history = await prisma.priceHistory.findMany({
        where: { partId },
        include: { retailer: true },
        orderBy: { recordedAt: "asc" },
      });

      if (history.length > 0) {
        return history.map((h) => ({
          date: h.recordedAt.toISOString().split("T")[0],
          priceMyr: Number(h.priceMyr),
          retailerName: h.retailer.name,
        }));
      }
    } catch (_) {}
  }

  // Simulated trend baseline if history table empty
  const part = await getPartBySlug(partId);
  if (!part) return [];
  const base = part.bestPriceMyr;
  const now = new Date();
  return [
    { date: new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0], priceMyr: Math.round(base * 1.08), retailerName: "Market Average" },
    { date: new Date(now.getTime() - 14 * 86400000).toISOString().split("T")[0], priceMyr: Math.round(base * 1.04), retailerName: "Market Average" },
    { date: new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0], priceMyr: Math.round(base * 1.01), retailerName: "Market Average" },
    { date: now.toISOString().split("T")[0], priceMyr: base, retailerName: "Live Quote" },
  ];
}
