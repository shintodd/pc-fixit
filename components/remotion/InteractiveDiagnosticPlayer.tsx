"use client";

import React, { useState } from "react";
import { Player } from "@remotion/player";
import {
  DiagnosticFlowVideo,
  type DiagnosticVideoProps,
} from "./DiagnosticFlowVideo";
import {
  Cpu,
  Monitor,
  HardDrive,
  Layers,
  Activity,
  Play,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

const PRESET_DIAGNOSTICS: Record<string, DiagnosticVideoProps> = {
  dram: {
    symptom: "No Display / Fans Spin at 100%",
    category: "Motherboard POST Triage",
    hardwareFocus: "Dual-Channel DDR5 Slots (A2 / B2)",
    debugLed: "DRAM",
    recommendedAction: "Reseat RAM modules into slots 2 & 4 until clips click firmly",
    warningText: "Always disconnect AC wall power before opening chassis latches",
    primaryColor: "#2563eb",
  },
  cpu: {
    symptom: "Instant Shutdown after 1 Second",
    category: "CPU & Socket Health",
    hardwareFocus: "EPS 12V 8-Pin CPU Power Cables",
    debugLed: "CPU",
    recommendedAction: "Verify top-left 8-pin EPS CPU cable is seated fully",
    warningText: "Do not mix PCIe 8-pin with EPS 8-pin connectors",
    primaryColor: "#ef4444",
  },
  vga: {
    symptom: "BEEP Code 1 Long 3 Short / No Signal",
    category: "GPU & Display Interface",
    hardwareFocus: "PCIe 5.0 x16 Primary Slot & 12VHPWR",
    debugLed: "VGA",
    recommendedAction: "Check 12VHPWR plug has zero gap before powering on",
    warningText: "Ensure video cable connects to GPU, not motherboard I/O",
    primaryColor: "#f59e0b",
  },
  boot: {
    symptom: "Reboots Straight into BIOS",
    category: "Storage & EFI Handshake",
    hardwareFocus: "Primary M.2 NVMe Slot (M.2_1 CPU Direct)",
    debugLed: "BOOT",
    recommendedAction: "Verify NVMe drive is detected in UEFI Boot Priority",
    warningText: "Check CSM / UEFI mode matches operating system partition format",
    primaryColor: "#10b981",
  },
};

export default function InteractiveDiagnosticPlayer() {
  const [selectedKey, setSelectedKey] = useState<string>("dram");
  const [customAction, setCustomAction] = useState<string>("");

  const currentProps = PRESET_DIAGNOSTICS[selectedKey];
  const activeProps: DiagnosticVideoProps = {
    ...currentProps,
    recommendedAction: customAction || currentProps.recommendedAction,
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* Control Deck for Dynamic Props */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#161b22] border border-black/10 dark:border-white/10 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>Remotion Dynamic In-App Engine</span>
          </div>
          <h3 className="text-lg font-bold text-ink dark:text-dark-ink">
            Reactive Hardware Motion Player
          </h3>
          <p className="text-xs text-ink-secondary dark:text-dark-ink-secondary">
            Zero MP4 downloads. Pure React DOM/Canvas rendered at 60fps from live state.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setSelectedKey("dram");
              setCustomAction("");
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedKey === "dram"
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-surface dark:bg-dark-subtle border-line dark:border-dark-line text-ink dark:text-dark-ink hover:border-blue-500/50"
            }`}
          >
            DRAM Alert
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedKey("cpu");
              setCustomAction("");
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedKey === "cpu"
                ? "bg-red-600 text-white border-red-600 shadow-sm"
                : "bg-surface dark:bg-dark-subtle border-line dark:border-dark-line text-ink dark:text-dark-ink hover:border-red-500/50"
            }`}
          >
            CPU Alert
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedKey("vga");
              setCustomAction("");
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedKey === "vga"
                ? "bg-amber-600 text-white border-amber-600 shadow-sm"
                : "bg-surface dark:bg-dark-subtle border-line dark:border-dark-line text-ink dark:text-dark-ink hover:border-amber-500/50"
            }`}
          >
            VGA Alert
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedKey("boot");
              setCustomAction("");
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              selectedKey === "boot"
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-surface dark:bg-dark-subtle border-line dark:border-dark-line text-ink dark:text-dark-ink hover:border-emerald-500/50"
            }`}
          >
            BOOT Alert
          </button>
        </div>
      </div>

      {/* Remotion Player Container */}
      <div className="relative overflow-hidden rounded-2xl border border-black/15 dark:border-white/15 bg-black shadow-2xl aspect-[16/9] w-full">
        <Player
          component={DiagnosticFlowVideo}
          inputProps={activeProps}
          durationInFrames={180}
          compositionWidth={1280}
          compositionHeight={720}
          fps={30}
          style={{
            width: "100%",
            height: "100%",
          }}
          controls
          autoPlay
          loop
        />
      </div>

      {/* Live Interactive Parametrization */}
      <div className="bg-surface dark:bg-dark-card border border-line dark:border-dark-line p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto flex-1">
          <span className="font-semibold text-ink dark:text-dark-ink shrink-0">
            Live Action Text:
          </span>
          <input
            type="text"
            value={customAction}
            placeholder={currentProps.recommendedAction}
            onChange={(e) => setCustomAction(e.target.value)}
            className="flex-1 px-3 py-1.5 rounded-lg bg-white dark:bg-dark-subtle border border-line dark:border-dark-line text-ink dark:text-dark-ink focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
        <div className="text-ink-secondary dark:text-dark-ink-secondary flex items-center gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4 text-ok" />
          <span>Type above to see video text mutate instantly while playing!</span>
        </div>
      </div>
    </div>
  );
}
