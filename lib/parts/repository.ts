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
  condition?: "all" | "new" | "used";
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

      const priceWhere: any = {};
      if (filter?.condition === "new") {
        priceWhere.condition = "new";
      } else if (filter?.condition === "used") {
        priceWhere.condition = { not: "new" };
      }

      const dbParts = await prisma.part.findMany({
        where,
        include: {
          prices: {
            where: Object.keys(priceWhere).length > 0 ? priceWhere : undefined,
            include: { retailer: true },
          },
        },
        orderBy: { benchmarkScore: "desc" },
      });

      if (dbParts.length > 0) {
        return dbParts
          .map((p) => {
            const prices: RetailerQuote[] = p.prices.map((pr: any) => ({
              retailerId: pr.retailerId,
              retailerName: pr.retailer.name,
              retailerSlug: pr.retailer.slug,
              priceMyr: Number(pr.priceMyr),
              originalPriceMyr: pr.originalPriceMyr ? Number(pr.originalPriceMyr) : undefined,
              condition: (pr.condition as any) || "new",
              sellerLocation: pr.sellerLocation ?? undefined,
              listingTitle: (pr as any).listingTitle ?? undefined,
              isMarketplace: Boolean(pr.retailer.isMarketplace),
              inStock: pr.inStock,
              stockQuantity: pr.stockQuantity ?? undefined,
              productUrl: pr.productUrl,
              lastScrapedAt: pr.lastScrapedAt.toISOString(),
            }));

            prices.sort((a, b) => a.priceMyr - b.priceMyr);

            const inStockPrices = prices.filter((pr) => pr.inStock);
            const newPrices = inStockPrices.filter((pr) => pr.condition === "new");
            const usedPrices = inStockPrices.filter((pr) => pr.condition !== "new");

            const bestNewPriceMyr = newPrices.length > 0 ? Math.min(...newPrices.map((pr) => pr.priceMyr)) : undefined;
            const bestUsedPriceMyr = usedPrices.length > 0 ? Math.min(...usedPrices.map((pr) => pr.priceMyr)) : undefined;
            const bestPriceMyr = inStockPrices.length > 0
              ? Math.min(...inStockPrices.map((pr) => pr.priceMyr))
              : (prices.length > 0 ? Math.min(...prices.map((pr) => pr.priceMyr)) : 0);

            const seedMatch = SEED_PARTS.find((s) => s.slug === p.slug || s.model === p.model);

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
              marketPricing: seedMatch?.marketPricing,
              opinion: seedMatch?.opinion,
              bestPriceMyr,
              bestNewPriceMyr,
              bestUsedPriceMyr,
              hasUsedListings: usedPrices.length > 0,
              inStock: inStockPrices.length > 0,
              prices,
            };
          })
          .filter((p) => {
            if (filter?.condition === "used" && !p.hasUsedListings) return false;
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
    if (filter?.condition === "used" && !p.hasUsedListings) return false;
    if (filter?.condition === "new" && !p.bestNewPriceMyr) return false;
    const effectivePrice = filter?.condition === "used"
      ? (p.bestUsedPriceMyr || p.bestPriceMyr)
      : (filter?.condition === "new" ? (p.bestNewPriceMyr || p.bestPriceMyr) : p.bestPriceMyr);

    if (filter?.minPrice && effectivePrice < filter.minPrice) return false;
    if (filter?.maxPrice && effectivePrice > filter.maxPrice) return false;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.model.toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  }).map((p) => {
    const sortedAll = (p.prices ?? []).slice().sort((a, b) => a.priceMyr - b.priceMyr);
    if (filter?.condition === "new") {
      const newQuotes = (p.prices ?? []).filter((pr) => pr.condition === "new").sort((a, b) => a.priceMyr - b.priceMyr);
      return {
        ...p,
        bestPriceMyr: p.bestNewPriceMyr || (newQuotes[0]?.priceMyr ?? p.bestPriceMyr),
        prices: newQuotes.length > 0 ? newQuotes : sortedAll,
      };
    }
    if (filter?.condition === "used") {
      const usedQuotes = (p.prices ?? []).filter((pr) => pr.condition !== "new").sort((a, b) => a.priceMyr - b.priceMyr);
      return {
        ...p,
        bestPriceMyr: p.bestUsedPriceMyr || (usedQuotes[0]?.priceMyr ?? p.bestPriceMyr),
        prices: usedQuotes.length > 0 ? usedQuotes : sortedAll,
      };
    }
    return {
      ...p,
      prices: sortedAll,
    };
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
        const prices: RetailerQuote[] = dbPart.prices.map((pr: any) => ({
          retailerId: pr.retailerId,
          retailerName: pr.retailer.name,
          retailerSlug: pr.retailer.slug,
          priceMyr: Number(pr.priceMyr),
          originalPriceMyr: pr.originalPriceMyr ? Number(pr.originalPriceMyr) : undefined,
          condition: (pr.condition as any) || "new",
          sellerLocation: pr.sellerLocation ?? undefined,
          listingTitle: (pr as any).listingTitle ?? undefined,
          isMarketplace: Boolean(pr.retailer.isMarketplace),
          inStock: pr.inStock,
          stockQuantity: pr.stockQuantity ?? undefined,
          productUrl: pr.productUrl,
          lastScrapedAt: pr.lastScrapedAt.toISOString(),
        }));

        const inStockPrices = prices.filter((pr) => pr.inStock);
        const newPrices = inStockPrices.filter((pr) => pr.condition === "new");
        const usedPrices = inStockPrices.filter((pr) => pr.condition !== "new");

        const bestNewPriceMyr = newPrices.length > 0 ? Math.min(...newPrices.map((pr) => pr.priceMyr)) : undefined;
        const bestUsedPriceMyr = usedPrices.length > 0 ? Math.min(...usedPrices.map((pr) => pr.priceMyr)) : undefined;
        const bestPriceMyr = inStockPrices.length > 0
          ? Math.min(...inStockPrices.map((pr) => pr.priceMyr))
          : (prices.length > 0 ? Math.min(...prices.map((pr) => pr.priceMyr)) : 0);

        const seedMatch = SEED_PARTS.find((s) => s.slug === dbPart.slug || s.model === dbPart.model);

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
          marketPricing: seedMatch?.marketPricing,
          opinion: seedMatch?.opinion,
          bestPriceMyr,
          bestNewPriceMyr,
          bestUsedPriceMyr,
          hasUsedListings: usedPrices.length > 0,
          inStock: inStockPrices.length > 0,
          prices,
        };
      }
    } catch (err) {
      console.warn("PostgreSQL getPartBySlug failed, falling back:", err);
    }
  }

  const found = SEED_PARTS.find((p) => p.slug === slug || p.id === slug);
  if (!found) return null;
  return {
    ...found,
    prices: (found.prices ?? []).slice().sort((a, b) => a.priceMyr - b.priceMyr),
  };
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
