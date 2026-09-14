import { type ChatMessage } from "@/lib/diagnose-client";

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  topic?: string;
  scrollY?: number;
}

const STORAGE_KEY = "pcfixit_recent_chats_v1";
const ACTIVE_SESSION_KEY = "pcfixit_active_session_id_v1";
const MAX_SESSIONS = 25;
const MAX_MESSAGES_PER_SESSION = 30;

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

/**
 * Get currently active session ID from localStorage.
 */
export function getActiveSessionId(): string | null {
  if (!isClient()) return null;
  try {
    return window.localStorage.getItem(ACTIVE_SESSION_KEY);
  } catch (_) {
    return null;
  }
}

/**
 * Persist currently active session ID to localStorage.
 */
export function setActiveSessionId(id: string | null): void {
  if (!isClient()) return;
  try {
    if (id) {
      window.localStorage.setItem(ACTIVE_SESSION_KEY, id);
    } else {
      window.localStorage.removeItem(ACTIVE_SESSION_KEY);
    }
  } catch (_) {}
}

/**
 * Generate a short, readable title from first user query.
 */
export function generateSessionTitle(messages: ChatMessage[], defaultTitle = "New Diagnosis"): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser || !firstUser.content.trim()) return defaultTitle;
  const cleaned = firstUser.content.trim().replace(/\s+/g, " ");
  return cleaned.length > 42 ? cleaned.slice(0, 42) + "..." : cleaned;
}

/**
 * Load all stored chat sessions, sorted by most recent first.
 * Only returns sessions with at least one user query.
 */
export function loadSessions(): ChatSession[] {
  if (!isClient()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((s: ChatSession) => Array.isArray(s.messages) && s.messages.some((m) => m.role === "user"))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (err) {
    console.warn("Failed to load chat sessions from localStorage:", err);
    return [];
  }
}

/**
 * Save or update existing chat session.
 * Sessions without any user messages are never saved to localStorage.
 */
export function saveSession(session: ChatSession): void {
  if (!isClient()) return;

  // Guard: Never persist blank greeting sessions with zero user messages
  const hasUserMessage = Array.isArray(session.messages) && session.messages.some((m) => m.role === "user");
  if (!hasUserMessage) return;

  try {
    const sessions = loadSessions();
    const existingIndex = sessions.findIndex((s) => s.id === session.id);

    // Prune messages to prevent exceeding browser storage
    const trimmedSession: ChatSession = {
      ...session,
      updatedAt: Date.now(),
      messages: session.messages.slice(-MAX_MESSAGES_PER_SESSION),
    };

    if (existingIndex >= 0) {
      sessions.splice(existingIndex, 1);
      sessions.unshift(trimmedSession);
    } else {
      sessions.unshift(trimmedSession);
    }

    // Keep only most recent sessions
    const pruned = sessions.slice(0, MAX_SESSIONS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
    setActiveSessionId(session.id);
  } catch (err) {
    console.warn("Failed to save chat session to localStorage:", err);
    // If quota exceeded, remove oldest 5 sessions and try once more
    try {
      const sessions = loadSessions();
      if (sessions.length > 5) {
        const reduced = sessions.slice(0, sessions.length - 5);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
      }
    } catch (_) {}
  }
}

/**
 * Delete a specific chat session by id.
 */
export function deleteSession(id: string): void {
  if (!isClient()) return;
  try {
    const sessions = loadSessions().filter((s) => s.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    if (getActiveSessionId() === id) {
      setActiveSessionId(sessions[0]?.id || null);
    }
  } catch (err) {
    console.warn("Failed to delete chat session from localStorage:", err);
  }
}

/**
 * Clear all chat history.
 */
export function clearAllSessions(): void {
  if (!isClient()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch (err) {
    console.warn("Failed to clear chat sessions from localStorage:", err);
  }
}

/**
 * Create a new blank session instance.
 */
export function createNewSession(initialIntro: string, topic?: string): ChatSession {
  return {
    id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: "New Diagnosis",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [{ role: "assistant", content: initialIntro }],
    topic,
    scrollY: 0,
  };
}

/**
 * Update scroll position for a session without changing updatedAt or sort order.
 */
export function updateSessionScroll(id: string, scrollY: number): void {
  if (!isClient() || !id) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const sessions = JSON.parse(raw);
    if (!Array.isArray(sessions)) return;
    const existing = sessions.find((s: ChatSession) => s.id === id);
    if (existing) {
      existing.scrollY = Math.max(0, Math.round(scrollY));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  } catch (_) {}
}
