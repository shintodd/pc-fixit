"use client";

import React, { useState, useEffect } from "react";
import { X, Wrench, ShieldAlert, Video, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ComponentType } from "@/lib/parts/types";

interface InstallationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: ComponentType;
}

interface GuideData {
  componentType: ComponentType;
  title: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  toolsRequired: string[];
  precautions: string[];
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    warning?: string;
  }[];
  videoTutorialUrl?: string;
}

export default function InstallationGuideModal({
  isOpen,
  onClose,
  initialType = "CPU",
}: InstallationGuideModalProps) {
  const [selectedType, setSelectedType] = useState<ComponentType>(initialType);
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialType) setSelectedType(initialType);
  }, [initialType]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setLoading(true);

    fetch(`/api/parts/guides/${selectedType}`)
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted) return;
        if (data.success && data.guide) {
          setGuide(data.guide);
        } else {
          setGuide(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load installation guide:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, selectedType]);

  if (!isOpen) return null;

  const componentTabs: { type: ComponentType; label: string }[] = [
    { type: "CPU", label: "Processor (CPU)" },
    { type: "GPU", label: "Graphics Card (GPU)" },
    { type: "RAM", label: "Memory (RAM)" },
    { type: "STORAGE", label: "M.2 SSD Storage" },
    { type: "COOLER", label: "CPU Cooler" },
    { type: "PSU", label: "Power Supply (PSU)" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          aria-hidden="true"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 450, damping: 30 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="guide-modal-title"
          className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[18px] bg-canvas border border-line shadow-2xl overflow-hidden dark:bg-dark-surface dark:border-dark-line"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent">
                <Wrench className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 id="guide-modal-title" className="text-lg font-semibold text-ink dark:text-white">
                  Component Installation Guides
                </h2>
                <p className="text-xs text-ink-muted-80 dark:text-dark-muted">
                  Step-by-step procedures, required tools, and anti-static ESD precautions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted-80 hover:bg-subtle hover:text-ink transition-colors dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Close installation guide"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          {/* Type Selector Tabs */}
          <div className="flex gap-2 px-6 py-3 border-b border-line dark:border-dark-line overflow-x-auto scrollbar-none bg-canvas dark:bg-dark-surface">
            {componentTabs.map((tab) => {
              const isActive = selectedType === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setSelectedType(tab.type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    isActive
                      ? "bg-accent text-white shadow-sm dark:bg-dark-accent dark:text-white"
                      : "text-ink-muted-80 hover:bg-subtle hover:text-ink dark:text-dark-muted dark:hover:bg-dark-subtle dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-ink dark:text-white">
            {loading ? (
              <div className="py-12 space-y-4">
                <div className="h-6 w-1/3 bg-subtle dark:bg-dark-subtle rounded animate-pulse" />
                <div className="h-4 w-2/3 bg-subtle dark:bg-dark-subtle rounded animate-pulse" />
                <div className="h-24 bg-subtle dark:bg-dark-subtle rounded-[14px] animate-pulse" />
              </div>
            ) : guide ? (
              <div className="space-y-6">
                {/* Overview Header */}
                <div>
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent dark:bg-dark-accent/10 dark:text-dark-accent uppercase">
                      {guide.difficulty}
                    </span>
                    <span className="text-xs text-ink-muted-80 dark:text-dark-muted">
                      Estimated time: {guide.estimatedMinutes} minutes
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mt-2 text-ink dark:text-white">{guide.title}</h3>
                  <p className="text-xs text-ink-muted-80 dark:text-dark-muted mt-1">{guide.summary}</p>
                </div>

                {/* Tools & Precautions Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[14px] border border-line bg-canvas-parchment/40 dark:border-dark-line dark:bg-dark-subtle/30 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-accent dark:text-dark-accent flex items-center gap-2">
                      <Wrench className="h-3.5 w-3.5" aria-hidden="true" /> Required Tools
                    </p>
                    <ul className="text-xs space-y-1 text-ink-muted-80 dark:text-dark-muted pl-4 list-disc">
                      {guide.toolsRequired.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-[14px] border border-amber-500/20 bg-amber-500/10 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300 flex items-center gap-2">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" /> Critical Precautions
                    </p>
                    <ul className="text-xs space-y-1 text-amber-800 dark:text-amber-200 pl-4 list-disc">
                      {guide.precautions.map((p, idx) => (
                        <li key={idx}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Steps Section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-ink dark:text-white uppercase tracking-wider">
                    Installation Procedure
                  </h4>
                  <div className="space-y-4">
                    {guide.steps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="p-4 rounded-[14px] border border-line bg-canvas dark:border-dark-line dark:bg-dark-subtle/20 space-y-2"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-white font-bold text-xs dark:bg-dark-accent">
                            {st.stepNumber}
                          </span>
                          <span className="font-semibold text-sm text-ink dark:text-white">{st.title}</span>
                        </div>
                        <p className="text-xs text-ink-muted-80 dark:text-dark-muted pl-8 leading-relaxed">
                          {st.description}
                        </p>
                        {st.warning && (
                          <div className="ml-8 mt-2 p-2.5 rounded-[10px] bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 text-xs">
                            <strong>Warning:</strong> {st.warning}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Video Tutorial Link */}
                {guide.videoTutorialUrl && (
                  <div className="p-4 rounded-[14px] border border-line bg-canvas-parchment/60 dark:border-dark-line dark:bg-dark-subtle/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="h-5 w-5 text-accent dark:text-dark-accent" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold text-ink dark:text-white">Video Walkthrough Available</p>
                        <p className="text-[11px] text-ink-muted-80 dark:text-dark-muted">
                          Watch verified step-by-step visual assembly tutorial
                        </p>
                      </div>
                    </div>
                    <a
                      href={guide.videoTutorialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors dark:bg-dark-accent dark:hover:bg-dark-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      Watch Tutorial
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-ink-muted-80 dark:text-dark-muted">
                Guide not available for this component.
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-line dark:border-dark-line bg-canvas-parchment/60 dark:bg-dark-subtle/50 text-xs">
            <span className="text-ink-muted-80 dark:text-dark-muted">
              pcfix assembly verification - Safe DIY installation
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-full bg-subtle text-ink font-medium hover:bg-line transition-colors dark:bg-dark-subtle dark:text-white dark:hover:bg-dark-line focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
