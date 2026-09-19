---
name: ban-small-circle-status-dots
description: Permanently bans all small circle status dots, bullets, and indicator circles across UI
metadata:
  type: feedback
---

# Banned Pattern: Small Circle Status Dots

Zero small circle indicator dots (`rounded-full` status indicators, `●`, or small circle bullets) across the entire application and all future mockups.

**Why:** The user explicitly requested: "i want you to remove the small circle thing in my entire project. i dont want to see that thing in my life forever starting now. Remember that". Circular indicator dots are strictly forbidden by user mandate.

**How to apply:**
- Never add small circle status dots (e.g. `h-1.5 w-1.5 rounded-full`, `h-2 w-2 rounded-full`, `●`, or circular bullet spans).
- For status badges: use clean pill containers with text (`rounded-full px-3 py-1 font-semibold text-ok`), without an internal circle dot.
- For list bullets: use clean dashes (`-`), numbers, or icons.
- For hardware LEDs / swatches: use rectangular SMD chips (`rounded-xs`) or square tiles (`rounded-md`).
- For typing indicators: use vertical micro-bars (`h-3 w-1.5 rounded-xs`).
- Enforce strictly with zero exceptions across all components, pages, and mockups.
