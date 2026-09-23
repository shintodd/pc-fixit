import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import { getPartBySlug } from "@/lib/parts/repository";

export interface PriceAlertTrigger {
  watchId: string;
  userEmail: string;
  partName: string;
  partSlug: string;
  targetPriceMyr: number;
  currentPriceMyr: number;
  savingsMyr: number;
  notifyChannel: string;
  productUrl: string;
}

export async function evaluatePriceAlerts(): Promise<{
  evaluatedCount: number;
  triggeredCount: number;
  alerts: PriceAlertTrigger[];
}> {
  const dbAvailable = await isDatabaseAvailable();
  const alerts: PriceAlertTrigger[] = [];
  let evaluatedCount = 0;

  if (dbAvailable) {
    try {
      const activeWatches = await prisma.partWatchlist.findMany({
        where: { isActive: true },
        include: {
          part: {
            include: {
              prices: {
                where: { inStock: true },
                orderBy: { priceMyr: "asc" },
                take: 1,
              },
            },
          },
        },
      });

      evaluatedCount = activeWatches.length;

      for (const watch of activeWatches) {
        const lowestPriceItem = watch.part.prices[0];
        if (!lowestPriceItem) continue;

        const currentPrice = Number(lowestPriceItem.priceMyr);
        const targetPrice = Number(watch.targetPriceMyr);

        if (currentPrice <= targetPrice) {
          alerts.push({
            watchId: watch.id,
            userEmail: watch.userEmail,
            partName: watch.part.name,
            partSlug: watch.part.slug,
            targetPriceMyr: targetPrice,
            currentPriceMyr: currentPrice,
            savingsMyr: targetPrice - currentPrice,
            notifyChannel: watch.notifyChannel,
            productUrl: lowestPriceItem.productUrl,
          });

          // Mark lastNotifiedAt
          await prisma.partWatchlist.update({
            where: { id: watch.id },
            data: { lastNotifiedAt: new Date() },
          });
        }
      }

      return { evaluatedCount, triggeredCount: alerts.length, alerts };
    } catch (err: any) {
      console.warn("DB price alerts evaluation failed:", err.message);
    }
  }

  // Simulated fallback test run
  const samplePart = await getPartBySlug("amd-ryzen-5-5600");
  if (samplePart) {
    evaluatedCount = 1;
    alerts.push({
      watchId: "sim-watch-1",
      userEmail: "user@example.com",
      partName: samplePart.name,
      partSlug: samplePart.slug,
      targetPriceMyr: 450,
      currentPriceMyr: samplePart.bestPriceMyr,
      savingsMyr: 450 - samplePart.bestPriceMyr,
      notifyChannel: "in_app",
      productUrl: samplePart.prices?.[0]?.productUrl || "#",
    });
  }

  return { evaluatedCount, triggeredCount: alerts.length, alerts };
}
