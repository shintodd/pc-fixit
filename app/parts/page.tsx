"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Sparkles, ShoppingBag, ShieldCheck, Wrench, ShieldAlert } from "lucide-react";
import BuildGeneratorView from "@/components/parts/BuildGeneratorView";
import PartsCatalogView from "@/components/parts/PartsCatalogView";
import CompatibilityCheckerModal from "@/components/parts/CompatibilityCheckerModal";
import InstallationGuideModal from "@/components/parts/InstallationGuideModal";
import UsedInspectionGuideModal from "@/components/parts/UsedInspectionGuideModal";
import { ComponentType } from "@/lib/parts/types";

function PartsStudioContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams.get("tab") || "catalog";
  const typeParam = (searchParams.get("type") as ComponentType) || undefined;
  const conditionParam = (searchParams.get("condition") as "all" | "new" | "used") || "all";

  const [activeTab, setActiveTab] = useState<"generator" | "catalog">(
    tabParam === "generator" ? "generator" : "catalog"
  );

  // Modals launched via top tabs or query params
  const [showCompatModal, setShowCompatModal] = useState(tabParam === "validator");
  const [showGuideModal, setShowGuideModal] = useState(tabParam === "guides");
  const [showUsedModal, setShowUsedModal] = useState(tabParam === "inspection");

  useEffect(() => {
    if (tabParam === "catalog") setActiveTab("catalog");
    if (tabParam === "generator") setActiveTab("generator");
    if (tabParam === "validator") setShowCompatModal(true);
    if (tabParam === "guides") setShowGuideModal(true);
    if (tabParam === "inspection") setShowUsedModal(true);
  }, [tabParam]);

  const handleTabChange = (tab: "generator" | "catalog") => {
    setActiveTab(tab);
    router.replace(`/parts?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-canvas-parchment dark:bg-canvas py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Studio Hero Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Malaysian Hardware Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink dark:text-white">
            Parts & Build Studio
          </h1>
          <p className="max-w-2xl mx-auto text-sm text-ink-muted-80 dark:text-dark-muted leading-relaxed">
            Real Malaysian market valuations from brand-new retail to second-hand street prices. Dynamic compatibility testing, tier rankings, and expert hardware advice.
          </p>

          {/* Master Mode Switcher Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2.5">
            <div className="inline-flex p-1 rounded-full bg-canvas dark:bg-dark-surface border border-line dark:border-dark-line shadow-sm text-xs font-medium">
              <button
                type="button"
                onClick={() => handleTabChange("catalog")}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  activeTab === "catalog"
                    ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                    : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Hardware Catalog & Compatibility</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange("generator")}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  activeTab === "generator"
                    ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                    : "text-ink-muted-80 hover:text-ink dark:text-dark-muted dark:hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Smart Build Generator</span>
              </button>
            </div>

            {/* Quick Action Tools Pills */}
            <button
              type="button"
              onClick={() => setShowCompatModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-line bg-canvas hover:bg-subtle text-xs font-medium text-ink transition-colors dark:border-dark-line dark:bg-dark-surface dark:text-white dark:hover:bg-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-accent dark:text-dark-accent" aria-hidden="true" />
              <span>Compatibility Validator</span>
            </button>

            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-line bg-canvas hover:bg-subtle text-xs font-medium text-ink transition-colors dark:border-dark-line dark:bg-dark-surface dark:text-white dark:hover:bg-dark-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <Wrench className="h-3.5 w-3.5 text-accent dark:text-dark-accent" aria-hidden="true" />
              <span>Installation Guides</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUsedModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20 text-xs font-medium text-amber-800 transition-colors dark:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            >
              <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Used Inspection Guide</span>
            </button>
          </div>
        </div>

        {/* Tab Views */}
        <div>
          {activeTab === "generator" ? (
            <BuildGeneratorView />
          ) : (
            <PartsCatalogView
              initialType={typeParam}
              initialCondition={conditionParam}
            />
          )}
        </div>

        {/* Global Modals */}
        <CompatibilityCheckerModal
          isOpen={showCompatModal}
          onClose={() => setShowCompatModal(false)}
        />
        <InstallationGuideModal
          isOpen={showGuideModal}
          onClose={() => setShowGuideModal(false)}
          initialType={typeParam || "CPU"}
        />
        <UsedInspectionGuideModal
          isOpen={showUsedModal}
          onClose={() => setShowUsedModal(false)}
        />
      </div>
    </div>
  );
}

export default function PartsStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-canvas-parchment dark:bg-canvas">
          <div className="h-8 w-8 rounded-full border-2 border-accent border-t-transparent animate-spin" />
        </div>
      }
    >
      <PartsStudioContent />
    </Suspense>
  );
}
