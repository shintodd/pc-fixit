"use client";

import { useEffect, useRef, useState, FormEvent } from "react";
import Link from "next/link";
import {
  ArrowUp,
  FileText,
  Copy,
  Check,
  Sparkles,
  Wrench,
  ThumbsUp,
  ThumbsDown,
  X,
  RotateCcw,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Monitor,
  Volume2,
  Smartphone,
  Terminal,
  Calculator,
  Image as ImageIcon,
  History,
  Trash2,
  Plus,
  Maximize2,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import {
  diagnoseProblem as mockDiagnose,
  compressImage,
  type ChatMessage,
} from "@/lib/diagnose-client";
import {
  loadSessions,
  saveSession,
  deleteSession,
  createNewSession,
  generateSessionTitle,
  updateSessionScroll,
  getActiveSessionId,
  setActiveSessionId,
  type ChatSession,
} from "@/lib/chat-storage";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import PortLocatorModal from "@/components/PortLocatorModal";
import BeepLedDecoderModal from "@/components/BeepLedDecoderModal";
import PhoneQrModal from "@/components/PhoneQrModal";
import CommandExplainerModal from "@/components/CommandExplainerModal";
import RepairFeasibilityModal from "@/components/RepairFeasibilityModal";
import { LiquidGlassPill } from "@/components/LiquidGlassCard";

export default function Chat({
  initialQuery,
  topic,
  guideSlug,
}: {
  initialQuery?: string;
  topic?: string;
  guideSlug?: string;
}) {
  const { t, language } = useLanguage();
  const category = CATEGORIES.find((c) => c.slug === topic);
  const targetGuideSlug = guideSlug || (topic && CATEGORIES.some((c) => c.slug === topic) ? topic : undefined);

  const QUICK_STARTERS = [
    { label: t("chat_starter_1"), color: "bg-critical" },
    { label: t("chat_starter_2"), color: "bg-warn" },
    { label: t("chat_starter_3"), color: "bg-critical" },
    { label: t("chat_starter_4"), color: "bg-accent" },
  ];

  const QUICK_SCENARIOS = language === "ms"
    ? [
        { label: "Mati Terus: Tak Ada Lampu / Kipas", query: "PC saya langsung tak boleh on, lampu tak ada, kipas tak pusing" },
        { label: "Kipas Pusing, Screen Hitam", query: "Kipas pusing elok tapi screen hitam, ada lampu DRAM menyala kat motherboard" },
        { label: "Keluar Kod Blue Screen", query: "Dapat kod error blue screen masa main game" },
        { label: "Disk Sangkut 100%", query: "PC hang dan disk usage sangkut 100%" },
        { label: "Wi-Fi Tiada Internet", query: "Wi-Fi connected tapi tiada internet, dapat IP 169.254" },
        { label: "Panas Melampau & Lag", query: "GPU cecah 90C dan game jadi lag sangat" },
      ]
    : [
        { label: "Dead: No Lights or Fans", query: "My PC won't turn on at all, no lights, no fans" },
        { label: "Fans Spin, Black Screen", query: "Fans spin, screen stays black, DRAM LED is lit" },
        { label: "Blue Screen Stop Code", query: "Got blue screen error code while playing games" },
        { label: "Disk Stuck at 100%", query: "Computer is frozen and disk usage is stuck at 100%" },
        { label: "Wi-Fi No Internet", query: "Wi-Fi connected but says no internet, 169.254 IP" },
        { label: "Overheating & Throttle", query: "GPU reaches 90C and thermal throttles under load" },
      ];

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const currentSessionIdRef = useRef<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const seed: ChatMessage[] = [{ role: "assistant", content: t("chat_intro") }];
    if (initialQuery) seed.push({ role: "user", content: initialQuery });
    return seed;
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(!!initialQuery);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [activeModal, setActiveModal] = useState<"port" | "beep" | "phone" | "cmd" | "calc" | null>(null);

  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const lastUserMessageRef = useRef<HTMLDivElement | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const isSelectingSessionRef = useRef(false);
  const hasRun = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock document viewport on /troubleshoot so chat acts as a docked app without page scrolling
  useEffect(() => {
    document.documentElement.classList.add("chat-viewport-lock");
    document.body.classList.add("chat-viewport-lock");
    return () => {
      document.documentElement.classList.remove("chat-viewport-lock");
      document.body.classList.remove("chat-viewport-lock");
    };
  }, []);

  const diagnosticTools = [
    {
      id: "port",
      icon: Monitor,
      label: t("tool_port_locator"),
      sub: language === "ms" ? "GPU vs Motherboard" : "GPU vs Motherboard",
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      id: "beep",
      icon: Volume2,
      label: t("tool_beep_led"),
      sub: language === "ms" ? "Kod beep & 4 lampu LED" : "Beep codes & 4-LEDs",
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "phone",
      icon: Smartphone,
      label: t("tool_phone_qr"),
      sub: language === "ms" ? "QR hantar ke phone" : "QR code to phone",
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      id: "cmd",
      icon: Terminal,
      label: t("tool_commands"),
      sub: language === "ms" ? "SFC, DISM, DNS fixes" : "SFC, DISM, DNS fixes",
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "calc",
      icon: Calculator,
      label: t("tool_feasibility"),
      sub: language === "ms" ? "Kira kos vs ganti baru" : "Cost vs replacement",
      color: "text-rose-500 bg-rose-500/10",
    },
  ];

  // Helper: Persist current session to client-only localStorage
  function persistSession(updatedMessages: ChatMessage[], targetSessionId?: string) {
    const sessId = targetSessionId || currentSessionIdRef.current || currentSessionId;
    if (!sessId) return;

    const currentSessions = loadSessions();
    const current = currentSessions.find((s) => s.id === sessId);
    const title =
      current?.title && current.title !== "New Diagnosis" && current.title !== "Diagnostik Baharu"
        ? current.title
        : generateSessionTitle(updatedMessages, language === "ms" ? "Diagnostik Baharu" : "New Diagnosis");

    const sessionToSave: ChatSession = {
      id: sessId,
      title,
      createdAt: current?.createdAt || Date.now(),
      updatedAt: Date.now(),
      messages: updatedMessages,
      topic: topic || current?.topic,
      scrollY: current?.scrollY,
    };

    saveSession(sessionToSave);
    setActiveSessionId(sessId);
    setSessions(loadSessions());
  }

  function scrollToBottomSmooth() {
    if (messageListRef.current) {
      messageListRef.current.scrollTo({
        top: messageListRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }

  // Initialize client sessions on mount
  useEffect(() => {
    const stored = loadSessions();
    setSessions(stored);

    if (initialQuery) {
      const newSess = createNewSession(t("chat_intro"), topic);
      newSess.title = initialQuery.length > 42 ? initialQuery.slice(0, 42) + "..." : initialQuery;
      newSess.messages = [
        { role: "assistant", content: t("chat_intro") },
        { role: "user", content: initialQuery },
      ];
      saveSession(newSess);
      setCurrentSessionId(newSess.id);
      currentSessionIdRef.current = newSess.id;
      setActiveSessionId(newSess.id);
      setSessions(loadSessions());
    } else if (stored.length > 0) {
      const activeId = getActiveSessionId();
      const targetSession = (activeId && stored.find((s) => s.id === activeId)) || stored[0];
      setCurrentSessionId(targetSession.id);
      currentSessionIdRef.current = targetSession.id;
      setActiveSessionId(targetSession.id);
      setMessages(targetSession.messages);
      if (targetSession.scrollY && targetSession.scrollY > 0) {
        requestAnimationFrame(() => {
          messageListRef.current?.scrollTo({ top: targetSession.scrollY, behavior: "auto" });
        });
      }
    } else {
      const newSess = createNewSession(t("chat_intro"), topic);
      setCurrentSessionId(newSess.id);
      currentSessionIdRef.current = newSess.id;
      setActiveSessionId(newSess.id);
      setMessages(newSess.messages);
      setSessions([]);
    }
  }, []);

  // Update initial intro message if user switches language before asking anything
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].role === "assistant") {
        return [{ role: "assistant", content: t("chat_intro") }];
      }
      return prev;
    });
  }, [language, t]);

  // Track scroll position: debounced save per session, and toggle floating bottom button
  useEffect(() => {
    const listEl = messageListRef.current;
    if (!listEl) return;

    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      const scrollY = listEl.scrollTop;
      const clientHeight = listEl.clientHeight;
      const scrollHeight = listEl.scrollHeight;
      const distanceFromBottom = scrollHeight - (scrollY + clientHeight);

      // Show floating button when client has scrolled up away from bottom
      const isScrolledUp = distanceFromBottom > 100 && messages.length > 1;
      setShowScrollBottom(isScrolledUp);

      // Save scroll position for active session in localStorage
      if (currentSessionId && scrollY >= 0 && !isSelectingSessionRef.current) {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          updateSessionScroll(currentSessionId, scrollY);
        }, 150);
      }
    };

    listEl.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      clearTimeout(scrollTimeout);
      listEl.removeEventListener("scroll", handleScroll);
    };
  }, [currentSessionId, messages.length]);

  // Scroll management: restore saved session position, or align to last user prompt (or top if greeting only)
  useEffect(() => {
    if (messages.length <= 1) {
      if (messageListRef.current && messageListRef.current.scrollTop > 0) {
        messageListRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const frameId = requestAnimationFrame(() => {
      const stored = loadSessions();
      const current = stored.find((s) => s.id === currentSessionId);

      if (current?.scrollY && current.scrollY > 0 && !loading) {
        messageListRef.current?.scrollTo({
          top: current.scrollY,
          behavior: "smooth",
        });
      } else if (lastUserMessageRef.current) {
        // Normal AI chat experience: focus on client's question so question and answer are both visible
        lastUserMessageRef.current.scrollIntoView({
          behavior: loading ? "auto" : "smooth",
          block: "start",
        });
      } else if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({
          behavior: loading ? "auto" : "smooth",
          block: "end",
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [currentSessionId]);

  // When a new message is submitted, scroll to the client prompt
  useEffect(() => {
    if (messages.length <= 1) return;

    const frameId = requestAnimationFrame(() => {
      if (loading && lastUserMessageRef.current) {
        lastUserMessageRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [messages.length, loading]);

  // Keep streaming response within view without sliding all the way to page bottom
  useEffect(() => {
    if (!loading || messages.length <= 1) return;

    const frameId = requestAnimationFrame(() => {
      lastMessageRef.current?.scrollIntoView({
        behavior: "auto",
        block: "nearest",
      });
    });
    return () => cancelAnimationFrame(frameId);
  }, [messages, loading]);

  useEffect(() => {
    let isMounted = true;
    if (initialQuery && !hasRun.current) {
      hasRun.current = true;
      let streamed = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      mockDiagnose(messages, (chunk) => {
        if (!isMounted) return;
        streamed += chunk;
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: streamed };
          return updated;
        });
      }, language)
        .then((finalText) => {
          if (!isMounted) return;
          const reply =
            finalText ||
            streamed ||
            `[DIAGNOSTIC_ERROR]: ${language === "ms" ? "Sambungan diagnostik terputus tanpa respons. Sila tekan Cuba semula." : "The diagnosis connection ended without a response. Please tap Retry."}`;

          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = {
              role: "assistant",
              content: reply,
            };
            persistSession(updated);
            return updated;
          });
        })
        .catch((err: any) => {
          if (!isMounted) return;
          const errMsg = `[DIAGNOSTIC_ERROR]: ${err?.message || (language === "ms" ? "Tidak dapat menyambung ke perkhidmatan diagnostik. Sila tekan Cuba semula." : "Could not connect to diagnosis service. Please tap Retry.")}`;
          setMessages((m) => {
            const updated = [...m];
            updated[updated.length - 1] = {
              role: "assistant",
              content: errMsg,
            };
            persistSession(updated);
            return updated;
          });
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function processAndAttachImage(file: File | Blob) {
    try {
      setIsProcessingImage(true);
      const compressed = await compressImage(file, 1024, 0.75);
      setPendingImage(compressed);
    } catch (err) {
      console.error("Image compression error:", err);
    } finally {
      setIsProcessingImage(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      processAndAttachImage(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) {
          processAndAttachImage(file);
        }
        break;
      }
    }
  }

  // Global window paste handler: paste screenshots from clipboard from anywhere on page
  useEffect(() => {
    function handleGlobalPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) {
            processAndAttachImage(file);
            inputRef.current?.focus();
          }
          break;
        }
      }
    }

    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  async function sendMessage(
    text: string,
    baseMessages?: ChatMessage[],
    attachedImage?: string | null
  ) {
    const imgToSend = attachedImage !== undefined ? attachedImage : pendingImage;
    if ((!text.trim() && !imgToSend) || loading) return;

    const currentList = baseMessages || messages;
    const trimmed = text.trim();
    const fallbackText = language === "ms" ? "[Screenshot dilampirkan]" : "[Attached screenshot]";

    const userMessage: ChatMessage = {
      role: "user",
      content: trimmed || fallbackText,
      image: imgToSend || undefined,
    };

    const next: ChatMessage[] = [...currentList, userMessage];

    // Ensure session ID is initialized and synced
    let activeId = currentSessionIdRef.current || currentSessionId;
    if (!activeId) {
      activeId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      setCurrentSessionId(activeId);
      currentSessionIdRef.current = activeId;
      setActiveSessionId(activeId);
    }

    setMessages(next);
    setInput("");
    setPendingImage(null);
    setLoading(true);

    // Save immediately so user prompt is persisted even if navigation happens mid-stream
    persistSession(next, activeId);

    let streamed = "";
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const reply = await mockDiagnose(next, (chunk) => {
        streamed += chunk;
        setMessages((m) => {
          const updated = [...m];
          updated[updated.length - 1] = { role: "assistant", content: streamed };
          return updated;
        });
      }, language);

      const finalReply =
        reply ||
        streamed ||
        `[DIAGNOSTIC_ERROR]: ${language === "ms" ? "Sambungan diagnostik terputus tanpa respons. Sila tekan Cuba semula." : "The diagnosis connection ended without a response. Please tap Retry."}`;

      const finalMessages = [...next, { role: "assistant" as const, content: finalReply }];
      setMessages(finalMessages);
      persistSession(finalMessages, activeId);
    } catch (err: any) {
      const errorMsg = `[DIAGNOSTIC_ERROR]: ${err?.message || (language === "ms" ? "Tidak dapat menyambung ke pelayan diagnostik. Sila tekan Cuba semula." : "Unable to reach the diagnosis server. Please tap Retry.")}`;
      const finalMessages = [...next, { role: "assistant" as const, content: errorMsg }];
      setMessages(finalMessages);
      persistSession(finalMessages, activeId);
    } finally {
      setLoading(false);
    }
  }

  function handleRetry() {
    if (loading) return;
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;

    const pruned = messages.filter((m, idx) => {
      if (
        idx === messages.length - 1 &&
        m.role === "assistant" &&
        (m.content.startsWith("[DIAGNOSTIC_ERROR]:") || !m.content.trim())
      ) {
        return false;
      }
      return true;
    });

    setMessages(pruned);
    sendMessage(lastUser.content, pruned.slice(0, -1), lastUser.image);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleNewSession() {
    if (loading) return;
    if (currentSessionId && messageListRef.current) {
      updateSessionScroll(currentSessionId, messageListRef.current.scrollTop);
    }
    const fresh = createNewSession(t("chat_intro"), topic);
    // Do not save blank sessions to localStorage
    setCurrentSessionId(fresh.id);
    currentSessionIdRef.current = fresh.id;
    setActiveSessionId(fresh.id);
    setMessages(fresh.messages);
    setPendingImage(null);
    setInput("");
    setSessions(loadSessions());
    setShowHistoryMobile(false);
    messageListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSelectSession(sess: ChatSession) {
    if (loading || sess.id === currentSessionId) return;

    if (currentSessionId && messageListRef.current) {
      updateSessionScroll(currentSessionId, messageListRef.current.scrollTop);
    }

    const freshStored = loadSessions();
    const target = freshStored.find((s) => s.id === sess.id) || sess;

    isSelectingSessionRef.current = true;
    setCurrentSessionId(target.id);
    currentSessionIdRef.current = target.id;
    setActiveSessionId(target.id);
    setMessages(target.messages);
    setPendingImage(null);
    setInput("");
    setShowHistoryMobile(false);

    requestAnimationFrame(() => {
      if (target.scrollY && target.scrollY > 0) {
        messageListRef.current?.scrollTo({ top: target.scrollY, behavior: "smooth" });
      } else if (target.messages.length <= 1) {
        messageListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      } else if (lastUserMessageRef.current) {
        lastUserMessageRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
      }

      setTimeout(() => {
        isSelectingSessionRef.current = false;
      }, 350);
    });
  }

  function handleDeleteSession(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    deleteSession(id);
    const updated = loadSessions();
    setSessions(updated);
    if (id === currentSessionId) {
      if (updated.length > 0) {
        const nextActive = updated[0];
        setCurrentSessionId(nextActive.id);
        currentSessionIdRef.current = nextActive.id;
        setActiveSessionId(nextActive.id);
        setMessages(nextActive.messages);
      } else {
        const fresh = createNewSession(t("chat_intro"), topic);
        setCurrentSessionId(fresh.id);
        currentSessionIdRef.current = fresh.id;
        setActiveSessionId(fresh.id);
        setMessages(fresh.messages);
        setSessions([]);
      }
    }
  }

  const isInitialOnly = messages.length === 1;
  const lastMsg = messages[messages.length - 1];
  const showTypingBubble =
    loading && (lastMsg?.role === "user" || (lastMsg?.role === "assistant" && !lastMsg.content.trim()));

  return (
    <div className="mx-auto flex w-full max-w-7xl 2xl:max-w-[1720px] flex-1 min-h-0 flex-col lg:flex-row gap-6 px-4 sm:px-8 lg:px-12 2xl:px-16 py-3 sm:py-4 h-full overflow-hidden">
      {/* Desktop Sidebar: Diagnostics Console, Recent Sessions & Fast Starters */}
      <aside className="hidden lg:flex flex-col w-80 shrink-0 gap-4 h-full overflow-y-auto pr-1 touch-scroll">
        {/* Recent Diagnoses Client History */}
        <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-4 shadow-card dark:shadow-card-dark backdrop-blur-md">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-line/70 dark:border-dark-line/70">
            <span className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
              <History className="h-3.5 w-3.5 text-accent" />
              {t("chat_recent_title")}
            </span>
            <button
              type="button"
              onClick={handleNewSession}
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-accent hover:bg-accent-soft dark:hover:bg-dark-accent/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={t("chat_new_session")}
            >
              <Plus className="h-3 w-3" />
              <span>{t("chat_new_session")}</span>
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="py-3 text-center text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
              {t("chat_no_recent")}
            </div>
          ) : (
            <div className="flex flex-col gap-1 max-h-52 overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isActive = sess.id === currentSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`group flex items-center justify-between rounded-xl px-2.5 py-2 text-[12px] cursor-pointer transition-colors ${
                      isActive
                        ? "bg-accent/10 dark:bg-accent/15 text-accent font-semibold"
                        : "text-ink-secondary dark:text-dark-ink-secondary hover:bg-subtle dark:hover:bg-dark-subtle hover:text-ink dark:hover:text-dark-ink"
                    }`}
                  >
                    <span className="truncate pr-2">{sess.title}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-ink-tertiary hover:text-critical transition-opacity"
                      title={language === "ms" ? "Padam sembang ini" : "Delete diagnosis"}
                      aria-label={language === "ms" ? "Padam sembang ini" : "Delete diagnosis"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* PC Technician Desk Status */}
        <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-5 shadow-card dark:shadow-card-dark backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-line/70 dark:border-dark-line/70">
            <span className="text-[13px] font-bold tracking-tight text-ink dark:text-dark-ink">
              {language === "ms" ? "Kaunter Technician PC" : "PC Technician Desk"}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {language === "ms" ? "Sedia Bantu" : "Ready to Help"}
            </span>
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-ink-secondary dark:text-dark-ink-secondary">
            {language === "ms"
              ? "Tanya apa-apa masalah komputer atau tampal screenshot skrin error. Technician sedia bantu terus ke punca kerosakan."
              : "Describe your PC problem or paste an error screenshot. Your technician pinpoints the fault with direct fix steps."}
          </p>
          <div className="mt-4 pt-3 border-t border-line/60 dark:border-dark-line/60 flex items-center justify-between text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary">
            <span>{t("nav_knowledge_base")}</span>
            <span className="font-semibold text-ink dark:text-dark-ink">
              {t("cat_guides_count", { count: 180 })}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-5 shadow-card dark:shadow-card-dark backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
              {language === "ms" ? "Soalan Popular Kepada Tech" : "Popular Tech Questions"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {QUICK_SCENARIOS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setInput(item.query);
                  sendMessage(item.query);
                }}
                className="group flex items-center justify-between rounded-xl px-3 py-2 text-left text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary hover:bg-subtle dark:hover:bg-dark-subtle hover:text-ink dark:hover:text-dark-ink transition-colors"
              >
                <span className="truncate pr-2">{item.label}</span>
                <ChevronRight className="h-3.5 w-3.5 text-ink-tertiary dark:text-dark-ink-tertiary transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line dark:border-dark-line bg-white/85 dark:bg-dark-card/85 p-5 shadow-card dark:shadow-card-dark backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-accent" />
              {language === "ms" ? "Alatan Diagnostik Pantas" : "Interactive Diagnostic Helpers"}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {diagnosticTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setActiveModal(tool.id as any)}
                  className="group flex items-center justify-between rounded-xl px-2.5 py-2 text-left hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg ${tool.color} shrink-0`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[12px] font-semibold text-ink dark:text-dark-ink truncate group-hover:text-accent transition-colors">
                        {tool.label}
                      </div>
                      <div className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary truncate">
                        {tool.sub}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-ink-tertiary dark:text-dark-ink-tertiary transition-transform group-hover:translate-x-0.5 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-line/80 dark:border-dark-line/80 bg-subtle/60 dark:bg-dark-subtle/60 p-4 text-[12px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed space-y-1.5">
          <div className="flex items-center gap-1.5 font-semibold text-ink dark:text-dark-ink">
            <ShieldCheck className="h-3.5 w-3.5 text-accent dark:text-dark-accent" />
            <span>{language === "ms" ? "Pesanan Keselamatan Technician" : "Technician Safety Tip"}</span>
          </div>
          <p>
            {language === "ms"
              ? "Pastikan cabut plug dinding dulu dan sentuh bahagian besi casing untuk buang elektrik statik sebelum sentuh part dalam PC."
              : "Always unplug the AC power cord and touch unpainted metal on the case to discharge static before handling internal parts."}
          </p>
        </div>
      </aside>

      {/* Main Chat Workspace */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Mobile History & Action Bar */}
        <div className="flex lg:hidden shrink-0 items-center justify-between gap-2 mb-2 pb-2 border-b border-line/50 dark:border-dark-line/50">
          <button
            type="button"
            onClick={() => setShowHistoryMobile((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line dark:border-dark-line bg-white/80 dark:bg-dark-card/80 px-3 py-1.5 text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary shadow-xs"
          >
            <History className="h-3.5 w-3.5 text-accent" />
            <span>{t("chat_recent_title")}</span>
            <span className="ml-1 rounded-full bg-accent/10 px-1.5 py-0.2 text-[10px] font-bold text-accent">
              {sessions.length}
            </span>
          </button>
          <button
            type="button"
            onClick={handleNewSession}
            className="inline-flex items-center gap-1 rounded-xl bg-accent px-3 py-1.5 text-[12px] font-semibold text-white shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t("chat_new_session")}</span>
          </button>
        </div>

        {/* Mobile History Dropdown Accordion */}
        <AnimatePresence>
          {showHistoryMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden mb-3 shrink-0 overflow-hidden rounded-2xl border border-line dark:border-dark-line bg-white/95 dark:bg-dark-card/95 p-3 shadow-card dark:shadow-card-dark"
            >
              <div className="flex items-center justify-between pb-2 border-b border-line/60 dark:border-dark-line/60 mb-2">
                <span className="text-[12px] font-bold text-ink dark:text-dark-ink">
                  {t("chat_recent_title")}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHistoryMobile(false)}
                  className="p-1 text-ink-tertiary hover:text-ink"
                  aria-label="Close history"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto touch-scroll">
                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess)}
                    className={`flex items-center justify-between rounded-xl px-2.5 py-2 text-[12px] cursor-pointer ${
                      sess.id === currentSessionId
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-ink-secondary hover:bg-subtle"
                    }`}
                  >
                    <span className="truncate pr-2">{sess.title}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="p-1 text-ink-tertiary hover:text-critical"
                      aria-label="Delete session"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {category && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 shrink-0 flex items-center justify-between gap-3 rounded-2xl border border-line dark:border-dark-line bg-subtle/80 dark:bg-dark-subtle/80 px-4 py-2.5 backdrop-blur-sm shadow-xs"
          >
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-[14px] font-medium text-ink dark:text-dark-ink">{category.title}</span>
            </div>
            {targetGuideSlug && (
              <Link
                href={`/issues/${targetGuideSlug}`}
                className="flex items-center gap-1.5 text-[13px] font-medium text-accent hover:underline"
              >
                <FileText className="h-3.5 w-3.5" />
                {t("triage_guide_link")}
              </Link>
            )}
          </motion.div>
        )}

        {/* Message List */}
        <div
          ref={messageListRef}
          role="log"
          aria-live="polite"
          aria-label="Diagnostic conversation"
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-4 py-2 pr-1 touch-scroll"
        >
          <AnimatePresence initial={false}>
            {(() => {
              const lastUserIdx = messages.map((m) => m.role).lastIndexOf("user");
              return messages.map((m, i) => {
                const isLast = i === messages.length - 1;
                const isLastUser = i === lastUserIdx;
                return (
                  <div
                    key={i}
                    ref={(el) => {
                      if (isLastUser) lastUserMessageRef.current = el;
                      if (isLast) lastMessageRef.current = el;
                    }}
                    className="scroll-mt-24"
                  >
                    <Bubble
                      message={m}
                      isLast={isLast}
                      isStreaming={loading && isLast && m.role === "assistant" && m.content.trim().length > 0}
                      onRetry={handleRetry}
                      onViewImage={(img) => setPreviewImage(img)}
                    />
                  </div>
                );
              });
            })()}
          </AnimatePresence>

          {/* Apple-style typing indicator */}
          <AnimatePresence>
            {showTypingBubble && <TypingBubble />}
          </AnimatePresence>

          {/* Quick starter suggestions */}
          {isInitialOnly && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="pt-2"
            >
              <div className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary mb-3 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                <span>
                  {language === "ms"
                    ? "Atau pilih simptom biasa untuk mula:"
                    : "Or click a common symptom to begin:"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {QUICK_STARTERS.map((starter) => (
                  <motion.button
                    key={starter.label}
                    type="button"
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => sendMessage(starter.label)}
                    aria-label={`Start with: ${starter.label}`}
                    className="flex items-center gap-2 rounded-pill border border-line dark:border-dark-line bg-white dark:bg-dark-card px-4 py-2 text-left text-[13px] text-ink-secondary dark:text-dark-ink-secondary shadow-xs transition-colors hover:border-accent/40 hover:bg-accent-soft dark:hover:bg-dark-accent/15 hover:text-accent dark:hover:text-dark-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${starter.color}`} aria-hidden="true" />
                    <span>{starter.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Diagnostic Quick Helpers */}
              <div className="mt-5 pt-4 border-t border-line/60 dark:border-dark-line/60">
                <div className="text-[12px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary mb-2.5 flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  <span>
                    {language === "ms"
                      ? "Alatan interaktif technician:"
                      : "Interactive technician helpers:"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {diagnosticTools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                      <button
                        key={tool.id}
                        type="button"
                        onClick={() => setActiveModal(tool.id as any)}
                        className="inline-flex items-center gap-2 rounded-xl border border-line dark:border-dark-line bg-white dark:bg-dark-card px-3 py-2 text-left text-[12px] font-medium text-ink-secondary dark:text-dark-ink-secondary shadow-xs hover:border-accent/40 hover:bg-subtle hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <div className={`p-1 rounded-lg ${tool.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

        </div>

        {/* Docked Input Bar with Image Attachment */}
        <div className="shrink-0 z-20 pt-2 pb-safe flex flex-col gap-1 pointer-events-none">
          {/* Floating Scroll to Bottom Button (ChatGPT / Claude style) */}
          <AnimatePresence>
            {showScrollBottom && (
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 8 }}
                transition={{ duration: 0.15 }}
                className="self-center mb-1 pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={scrollToBottomSmooth}
                  className="flex min-h-[36px] items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-dark-card/95 border border-line dark:border-dark-line shadow-card hover:border-accent/40 text-ink-secondary dark:text-dark-ink-secondary hover:text-accent backdrop-blur-md text-[12px] font-medium transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label={language === "ms" ? "Ke mesej terkini" : "Scroll to bottom"}
                  title={language === "ms" ? "Ke mesej terkini" : "Scroll to bottom"}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>{language === "ms" ? "Mesej Terkini" : "Latest Message"}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pointer-events-auto flex flex-col gap-1.5">
            {/* Pending Attached Image Chip */}
            <AnimatePresence>
            {pendingImage && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-dark-card/95 border border-line dark:border-dark-line shadow-card dark:shadow-card-dark backdrop-blur-md w-fit"
              >
                <img
                  src={pendingImage}
                  alt="Pending screenshot"
                  onClick={() => setPreviewImage(pendingImage)}
                  className="h-10 w-10 rounded-lg object-cover border border-line dark:border-dark-line cursor-pointer hover:opacity-80 transition-opacity"
                />
                <div className="flex flex-col">
                  <span className="text-[12px] font-semibold text-ink dark:text-dark-ink">
                    {t("chat_attached_image")}
                  </span>
                  <span className="text-[10px] text-ink-tertiary dark:text-dark-ink-tertiary">
                    {language === "ms" ? "Akan dihantar bersama pertanyaan" : "Will be analyzed with your question"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="ml-2 p-1 text-ink-tertiary dark:text-dark-ink-tertiary hover:text-critical transition-colors rounded-full"
                  title={t("chat_remove_image")}
                  aria-label={t("chat_remove_image")}
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {isProcessingImage && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-dark-card/95 border border-line dark:border-dark-line shadow-card text-[12px] text-ink-tertiary dark:text-dark-ink-tertiary w-fit"
              >
                <Loader2 className="h-4 w-4 animate-spin text-accent" />
                <span>{language === "ms" ? "Memproses screenshot..." : "Compressing screenshot..."}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form with Genuine Apple Liquid Glass */}
          <LiquidGlassPill
            as="form"
            aria-label="Diagnostic chat input"
            onSubmit={handleSubmit}
            onPaste={handlePaste}
            className="flex items-center gap-2 py-1.5 pl-3 pr-1.5 shadow-card dark:shadow-card-dark focus-within:ring-2 focus-within:ring-accent transition-all"
          >
            {/* Hidden File Input for Image Upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Image Attachment Trigger Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isProcessingImage}
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full text-ink-tertiary dark:text-dark-ink-tertiary hover:bg-subtle dark:hover:bg-dark-subtle hover:text-accent dark:hover:text-dark-accent transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={t("chat_upload_image")}
              aria-label={t("chat_upload_image")}
            >
              <ImageIcon className="h-4 w-4" />
            </button>

            <input
              ref={inputRef}
              id="chat-input"
              name="message"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                pendingImage
                  ? (language === "ms" ? "Tambah nota jika ada, atau tekan Hantar..." : "Add details or press Send...")
                  : t("chat_input_placeholder")
              }
              aria-label={t("chat_input_placeholder")}
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink dark:text-dark-ink placeholder:text-ink-tertiary dark:placeholder:text-dark-ink-tertiary focus:outline-none"
            />

            {/* Clear button */}
            <AnimatePresence>
              {input && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                  onClick={() => { setInput(""); inputRef.current?.focus(); }}
                  className="flex min-h-[36px] min-w-[36px] items-center justify-center p-1 text-ink-tertiary dark:text-dark-ink-tertiary hover:text-ink dark:hover:text-dark-ink transition-colors rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Clear input"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </motion.button>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={(!input.trim() && !pendingImage) || loading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.93 }}
              className="flex min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-full bg-accent dark:bg-accent text-white shadow-sm transition-all hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              aria-label={loading ? t("chat_thinking") : t("chat_send_btn")}
              title={t("chat_send_btn")}
            >
              <ArrowUp className="h-4 w-4" strokeWidth={2.5} aria-hidden="true" />
            </motion.button>
          </LiquidGlassPill>

          <p className="text-center text-[11px] text-ink-tertiary/75 dark:text-dark-ink-tertiary/75 pt-0.5">
            {language === "ms"
              ? "pcfix dalam pembangunan aktif. Ada sebarang masalah atau cadangan? "
              : "pcfix is under active development. Have an issue or suggestion? "}
            <a
              href="mailto:pcfixtechsupport@gmail.com"
              className="underline underline-offset-2 hover:text-ink dark:hover:text-dark-ink transition-colors font-medium"
            >
              pcfixtechsupport@gmail.com
            </a>
          </p>
          </div>
        </div>
      </div>

      {/* Enlarged Screenshot Modal (Lightbox) */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                aria-label="Close image preview"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={previewImage}
                alt="Enlarged screenshot"
                className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/15"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Helper Modals */}
      <PortLocatorModal isOpen={activeModal === "port"} onClose={() => setActiveModal(null)} />
      <BeepLedDecoderModal isOpen={activeModal === "beep"} onClose={() => setActiveModal(null)} />
      <PhoneQrModal isOpen={activeModal === "phone"} onClose={() => setActiveModal(null)} />
      <CommandExplainerModal isOpen={activeModal === "cmd"} onClose={() => setActiveModal(null)} />
      <RepairFeasibilityModal isOpen={activeModal === "calc"} onClose={() => setActiveModal(null)} />
    </div>
  );
}

function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-semibold text-ink dark:text-dark-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={idx}
          className="rounded-md bg-subtle dark:bg-dark-subtle px-1.5 py-0.5 font-mono text-[13px] font-semibold text-accent dark:text-dark-accent border border-line dark:border-dark-line"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

function Bubble({
  message,
  isLast,
  isStreaming,
  onRetry,
  onViewImage,
}: {
  message: ChatMessage;
  isLast: boolean;
  isStreaming?: boolean;
  onRetry?: () => void;
  onViewImage?: (src: string) => void;
}) {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const isUser = message.role === "user";

  if (!message.content.trim() && !message.image) return null;

  if (message.content.startsWith("[DIAGNOSTIC_ERROR]:")) {
    const errorText = message.content.replace("[DIAGNOSTIC_ERROR]:", "").trim();
    const isRateLimit =
      errorText.toLowerCase().includes("429") ||
      errorText.toLowerCase().includes("rate-limited") ||
      errorText.toLowerCase().includes("quota");

    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="group flex flex-col items-start gap-2 max-w-[92%] sm:max-w-[85%]"
      >
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-critical">
          <AlertCircle className="h-3.5 w-3.5" />
          <span>
            {isRateLimit
              ? (language === "ms" ? "Notis Had Kuota AI" : "AI Rate-Limit Notice")
              : (language === "ms" ? "Notis Perkhidmatan Diagnostik" : "Diagnosis Service Notice")}
          </span>
        </div>

        <div className="rounded-[20px] rounded-bl-[5px] border border-critical/30 bg-critical/5 dark:bg-critical/10 p-5 text-[14px] leading-relaxed text-ink dark:text-dark-ink shadow-card dark:shadow-card-dark space-y-3.5 select-text">
          <p>{errorText}</p>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {onRetry && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 rounded-pill bg-accent px-4 py-2 text-[13px] font-semibold text-white shadow-sm shadow-accent/25 hover:bg-accent-hover active:scale-95 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t("chat_retry_btn")}</span>
              </motion.button>
            )}

            <Link
              href="/wizard"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line dark:border-dark-line bg-white dark:bg-dark-card px-3.5 py-2 text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink hover:border-accent/40 transition-colors shadow-xs"
            >
              <Wrench className="h-3.5 w-3.5 text-accent" />
              <span>{t("nav_guided_fix")}</span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line dark:border-dark-line bg-white dark:bg-dark-card px-3.5 py-2 text-[13px] font-medium text-ink-secondary dark:text-dark-ink-secondary hover:text-ink dark:hover:text-dark-ink hover:border-accent/40 transition-colors shadow-xs"
            >
              <FileText className="h-3.5 w-3.5 text-accent" />
              <span>{t("issue_all_guides")}</span>
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  function copyText() {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-end gap-2"
      >
        {message.image && (
          <div
            onClick={() => onViewImage?.(message.image!)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 dark:border-dark-line shadow-md hover:opacity-95 transition-all max-w-[280px] sm:max-w-xs"
          >
            <img
              src={message.image}
              alt="Uploaded screenshot"
              className="max-h-52 w-auto rounded-2xl object-cover"
            />
            <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[12px] font-medium gap-1">
              <Maximize2 className="h-3.5 w-3.5" />
              <span>{language === "ms" ? "Besarkan" : "Expand"}</span>
            </div>
          </div>
        )}
        <div className="max-w-[78%] whitespace-pre-wrap rounded-[20px] rounded-br-[5px] px-4 py-2.5 text-[15px] leading-relaxed text-white shadow-md shadow-accent/20 bubble-user select-text break-words [overflow-wrap:anywhere]">
          {message.content}
        </div>
      </motion.div>
    );
  }

  const lines = message.content.split("\n");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col items-start gap-1.5"
    >
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/10">
          <Wrench className="h-2.5 w-2.5 text-accent" aria-hidden="true" />
        </div>
        <span>{language === "ms" ? "Juruteknik pcfix" : "pcfix Tech"}</span>
      </div>

      <div className="relative max-w-[90%] sm:max-w-[85%] rounded-[20px] rounded-bl-[5px] border border-line dark:border-dark-line bg-white dark:bg-dark-card px-5 py-4 text-[15px] leading-[1.65] text-ink dark:text-dark-ink shadow-card dark:shadow-card-dark select-text space-y-2.5 break-words [overflow-wrap:anywhere]">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          const cleanLine = trimmed.replace(/^#{1,4}\s+/, "");
          if (cleanLine === "---" || cleanLine === "***") {
            return <hr key={idx} className="border-line dark:border-dark-line my-2" />;
          }

          const isBullet = /^[\*\-]\s+/.test(cleanLine);
          if (isBullet) {
            const content = cleanLine.replace(/^[\*\-]\s+/, "");
            return (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                <span className="flex-1">{renderFormattedText(content)}</span>
              </div>
            );
          }

          const numMatch = cleanLine.match(/^(\d+)[.)]\s+(.+)/);
          if (numMatch) {
            return (
              <div key={idx} className="flex items-start gap-3 pl-1">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/10 text-[11px] font-semibold text-accent mt-0.5" aria-hidden="true">
                  {numMatch[1]}
                </span>
                <span className="flex-1">{renderFormattedText(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-ink dark:text-dark-ink">
              {renderFormattedText(cleanLine)}
            </p>
          );
        })}

        {isStreaming && (
          <motion.span
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "linear" }}
            className="inline-block ml-0.5 h-4 w-[3px] rounded-sm bg-accent align-middle"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex items-center gap-3 px-1 pt-0.5 text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary">
        <button
          type="button"
          onClick={copyText}
          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:text-ink dark:hover:text-dark-ink hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={copied ? t("chat_copied_btn") : t("chat_copy_btn")}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-ok" aria-hidden="true" />
              <span className="text-ok font-medium">{t("chat_copied_btn")}</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" aria-hidden="true" />
              <span>{t("chat_copy_btn")}</span>
            </>
          )}
        </button>

        <span className="opacity-30" aria-hidden="true">|</span>

        <div className="flex items-center gap-1">
          {feedback ? (
            <span className="text-ok font-medium">{language === "ms" ? "Terima kasih!" : "Thanks!"}</span>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setFeedback("up")}
                className="rounded-md p-0.5 hover:text-ok hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={language === "ms" ? "Membantu" : "Helpful"}
                aria-label="Mark response as helpful"
              >
                <ThumbsUp className="h-3 w-3" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setFeedback("down")}
                className="rounded-md p-0.5 hover:text-critical hover:bg-subtle dark:hover:bg-dark-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={language === "ms" ? "Tidak membantu" : "Not helpful"}
                aria-label="Mark response as unhelpful"
              >
                <ThumbsDown className="h-3 w-3" aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function TypingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 4, scale: 0.94 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-start gap-1.5"
    >
      <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-ink-tertiary dark:text-dark-ink-tertiary">
        <div className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/10">
          <Wrench className="h-2.5 w-2.5 text-accent" />
        </div>
        <span>pcfix</span>
      </div>

      <div className="flex items-center gap-[5px] rounded-[20px] rounded-bl-[5px] border border-line dark:border-dark-line bg-white dark:bg-dark-card px-5 py-4 shadow-card dark:shadow-card-dark">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={`h-[9px] w-[9px] rounded-full bg-ink-tertiary dark:bg-dark-ink-tertiary ${
              i === 0 ? "typing-dot-1" : i === 1 ? "typing-dot-2" : "typing-dot-3"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
