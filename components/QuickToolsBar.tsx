"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Monitor, Volume2, Smartphone, Terminal, Calculator, Wrench } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LiquidGlassCard } from "@/components/LiquidGlassCard";

const PortLocatorModal = dynamic(() => import("@/components/PortLocatorModal"), { ssr: false });
const BeepLedDecoderModal = dynamic(() => import("@/components/BeepLedDecoderModal"), { ssr: false });
const PhoneQrModal = dynamic(() => import("@/components/PhoneQrModal"), { ssr: false });
const CommandExplainerModal = dynamic(() => import("@/components/CommandExplainerModal"), { ssr: false });
const RepairFeasibilityModal = dynamic(() => import("@/components/RepairFeasibilityModal"), { ssr: false });

export default function QuickToolsBar({ className = "" }: { className?: string }) {
  const { t, language } = useLanguage();
  const [activeModal, setActiveModal] = useState<"port" | "beep" | "phone" | "cmd" | "calc" | null>(null);

  const isMs = language === "ms";

  const tools = [
    {
      id: "port",
      icon: Monitor,
      label: t("tool_port_locator"),
      sub: isMs ? "Port GPU vs Motherboard" : "GPU vs Motherboard Ports",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "beep",
      icon: Volume2,
      label: t("tool_beep_led"),
      sub: isMs ? "Diagnos screen hitam" : "Black screen diagnostic",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "phone",
      icon: Smartphone,
      label: t("tool_phone_qr"),
      sub: isMs ? "Baiki masa PC padam" : "Read with PC off",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      id: "cmd",
      icon: Terminal,
      label: t("tool_commands"),
      sub: isMs ? "SFC, DISM, DNS" : "SFC, DISM, DNS fixes",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "calc",
      icon: Calculator,
      label: t("tool_feasibility"),
      sub: isMs ? "Kira kos & kelayakan" : "Cost vs replacement",
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  return (
    <>
      <section
        aria-label="Interactive Diagnostic Tools"
        className={`w-full ${className}`}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
            <Wrench className="h-3.5 w-3.5 text-accent" />
            <span>{isMs ? "Alatan Interaktif Pantas" : "Quick Diagnostic Helpers"}</span>
          </div>
          <span className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary hidden sm:inline">
            {isMs ? "1-klik buka panduan visual & audio" : "1-click visual & audio guides"}
          </span>
        </div>

        <div className="relative">
          {/* Ambient color bloom for tools bar */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-xl opacity-60 dark:opacity-40"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
            {tools.map((item) => {
              const Icon = item.icon;
              return (
                <LiquidGlassCard
                  key={item.id}
                  as="button"
                  type="button"
                  onClick={() => setActiveModal(item.id as any)}
                  borderRadius={18}
                  liquidPress
                  className="group flex flex-col items-start p-3 sm:p-3.5 shadow-xs hover:border-accent/40 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
                >
                  <div className={`p-2 rounded-xl ${item.color} mb-2.5 transition-transform duration-200 group-hover:scale-105`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="font-bold text-[13px] text-ink dark:text-dark-ink group-hover:text-accent transition-colors">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary truncate w-full mt-0.5">
                    {item.sub}
                  </div>
                </LiquidGlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* Modals */}
      <PortLocatorModal isOpen={activeModal === "port"} onClose={() => setActiveModal(null)} />
      <BeepLedDecoderModal isOpen={activeModal === "beep"} onClose={() => setActiveModal(null)} />
      <PhoneQrModal isOpen={activeModal === "phone"} onClose={() => setActiveModal(null)} />
      <CommandExplainerModal isOpen={activeModal === "cmd"} onClose={() => setActiveModal(null)} />
      <RepairFeasibilityModal isOpen={activeModal === "calc"} onClose={() => setActiveModal(null)} />
    </>
  );
}
