const fs = require("fs");
const path = require("path");

const toolsDir = path.join(__dirname, "..", "public", "images", "tools");
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

const icons = {
  // 1. Microsoft PowerToys (Official 4-color modular grid)
  "powertoys.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <rect width="64" height="64" rx="16" fill="#1e293b"/>
    <rect x="14" y="14" width="16" height="16" rx="4" fill="#0078d4"/>
    <rect x="34" y="14" width="16" height="16" rx="4" fill="#107c41"/>
    <rect x="14" y="34" width="16" height="16" rx="4" fill="#d83b01"/>
    <rect x="34" y="34" width="16" height="16" rx="4" fill="#ffb900"/>
    <path d="M22 18v8M18 22h8M42 22l-4 4M38 22l4 4M20 42h4v-4M42 38v8h-4" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // 2. Rufus (USB boot drive with lightning)
  "rufus.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="rufusGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#ea580c"/>
        <stop offset="1" stop-color="#c2410c"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#rufusGrad)"/>
    <rect x="22" y="10" width="20" height="12" rx="2" fill="#cbd5e1"/>
    <rect x="26" y="13" width="4" height="4" rx="1" fill="#475569"/>
    <rect x="34" y="13" width="4" height="4" rx="1" fill="#475569"/>
    <rect x="18" y="20" width="28" height="34" rx="5" fill="#f8fafc"/>
    <path d="M33 24l-8 14h8l-3 12 11-16h-8l4-10z" fill="#ea580c"/>
  </svg>`,

  // 3. CrystalDiskInfo (Hard Drive with SMART heartline)
  "crystaldiskinfo.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="cdiGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0284c7"/>
        <stop offset="1" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#cdiGrad)"/>
    <rect x="14" y="14" width="36" height="36" rx="6" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="32" cy="27" r="8" stroke="#38bdf8" stroke-width="2"/>
    <circle cx="32" cy="27" r="3" fill="#38bdf8"/>
    <path d="M18 42h7l3-6 4 10 3-4h11" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // 4. Display Driver Uninstaller DDU (GPU cleaner)
  "ddu.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="dduGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#e11d48"/>
        <stop offset="1" stop-color="#9f1239"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#dduGrad)"/>
    <rect x="14" y="18" width="36" height="24" rx="4" fill="#1e1b4b" stroke="#f43f5e" stroke-width="2"/>
    <circle cx="26" cy="30" r="6" stroke="#f43f5e" stroke-width="2"/>
    <circle cx="38" cy="30" r="6" stroke="#f43f5e" stroke-width="2"/>
    <path d="M20 46h24v4H20z" fill="#cbd5e1"/>
    <path d="M40 12l8 8M48 12l-8 8" stroke="#fecdd3" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // 5. Everything Voidtools (Magnifying search index)
  "everything.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="everyGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f59e0b"/>
        <stop offset="1" stop-color="#d97706"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#everyGrad)"/>
    <rect x="16" y="14" width="24" height="32" rx="3" fill="#ffffff" opacity="0.9"/>
    <path d="M22 22h12M22 28h12M22 34h8" stroke="#f59e0b" stroke-width="2" stroke-linecap="round"/>
    <circle cx="36" cy="36" r="11" fill="#ffffff" stroke="#f59e0b" stroke-width="3"/>
    <path d="M44 44l8 8" stroke="#ffffff" stroke-width="4" stroke-linecap="round"/>
  </svg>`,

  // 6. WizTree (NTFS Treemap visualizer)
  "wiztree.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="wizGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#10b981"/>
        <stop offset="1" stop-color="#047857"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#wizGrad)"/>
    <rect x="14" y="14" width="22" height="20" rx="3" fill="#a7f3d0"/>
    <rect x="38" y="14" width="12" height="20" rx="3" fill="#6ee7b7"/>
    <rect x="14" y="36" width="14" height="14" rx="3" fill="#34d399"/>
    <rect x="30" y="36" width="20" height="14" rx="3" fill="#059669"/>
    <path d="M25 24l-3 4h6l-4 6 7-7h-5l3-3z" fill="#047857"/>
  </svg>`,

  // 7. HWiNFO64 (Silicon telemetry & sensors)
  "hwinfo64.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="hwGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2563eb"/>
        <stop offset="1" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#hwGrad)"/>
    <rect x="18" y="18" width="28" height="28" rx="4" fill="#0f172a" stroke="#60a5fa" stroke-width="2"/>
    <path d="M24 14v4M32 14v4M40 14v4M24 46v4M32 46v4M40 46v4M14 24h4M14 32h4M14 40h4M46 24h4M46 32h4M46 40h4" stroke="#93c5fd" stroke-width="2" stroke-linecap="round"/>
    <text x="32" y="36" fill="#60a5fa" font-size="10" font-family="monospace" font-weight="bold" text-anchor="middle">64</text>
  </svg>`,

  // 8. FanControl (Dynamic fan curve manager)
  "fancontrol.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="fanGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#06b6d4"/>
        <stop offset="1" stop-color="#0891b2"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#fanGrad)"/>
    <circle cx="32" cy="32" r="18" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 2"/>
    <circle cx="32" cy="32" r="5" fill="#ffffff"/>
    <path d="M32 27c0-8 6-12 10-12s3 6-2 10l-8 2zM37 32c8 0 12 6 12 10s-6 3-10-2l-2-8zM32 37c0 8-6 12-10 12s-3-6 2-10l8-2zM27 32c-8 0-12-6-12-10s6-3 10 2l2 8z" fill="#ffffff"/>
  </svg>`,

  // 9. LatencyMon (DPC & ISR latency monitor)
  "latencymon.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="latGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f43f5e"/>
        <stop offset="1" stop-color="#be123c"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#latGrad)"/>
    <rect x="12" y="16" width="40" height="32" rx="4" fill="#0f172a" stroke="#fda4af" stroke-width="2"/>
    <path d="M16 32h7l4-10 5 18 4-12 3 6h9" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="22" r="2.5" fill="#22c55e"/>
  </svg>`,

  // 10. Intelligent Standby List Cleaner ISLC (Memory cache purge)
  "islc.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="islcGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#8b5cf6"/>
        <stop offset="1" stop-color="#6d28d9"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#islcGrad)"/>
    <rect x="14" y="22" width="36" height="20" rx="3" fill="#1e1b4b" stroke="#c4b5fd" stroke-width="2"/>
    <rect x="18" y="26" width="4" height="6" fill="#a78bfa"/>
    <rect x="24" y="26" width="4" height="6" fill="#a78bfa"/>
    <rect x="30" y="26" width="4" height="6" fill="#a78bfa"/>
    <rect x="36" y="26" width="4" height="6" fill="#a78bfa"/>
    <rect x="42" y="26" width="4" height="6" fill="#a78bfa"/>
    <path d="M18 42h28" stroke="#fbbf24" stroke-width="2" stroke-dasharray="2 2"/>
    <path d="M36 12l-6 10h6l-3 8 9-11h-5l4-7z" fill="#fef08a"/>
  </svg>`,

  // 11. Microsoft Sysinternals RAMMap (Memory map grid)
  "rammap.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="ramGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3b82f6"/>
        <stop offset="1" stop-color="#1e40af"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#ramGrad)"/>
    <rect x="14" y="14" width="36" height="36" rx="4" fill="#0f172a" stroke="#93c5fd" stroke-width="2"/>
    <rect x="18" y="18" width="8" height="8" rx="1" fill="#3b82f6"/>
    <rect x="28" y="18" width="8" height="8" rx="1" fill="#10b981"/>
    <rect x="38" y="18" width="8" height="8" rx="1" fill="#f59e0b"/>
    <rect x="18" y="28" width="8" height="8" rx="1" fill="#8b5cf6"/>
    <rect x="28" y="28" width="8" height="8" rx="1" fill="#ec4899"/>
    <rect x="38" y="28" width="8" height="8" rx="1" fill="#06b6d4"/>
    <rect x="18" y="38" width="8" height="8" rx="1" fill="#64748b"/>
    <rect x="28" y="38" width="8" height="8" rx="1" fill="#3b82f6"/>
    <rect x="38" y="38" width="8" height="8" rx="1" fill="#22c55e"/>
  </svg>`,

  // 12. Ventoy (Multiboot USB)
  "ventoy.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="venGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#9333ea"/>
        <stop offset="1" stop-color="#6b21a8"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#venGrad)"/>
    <path d="M16 18l16 28 16-28h-9l-7 14-7-14z" fill="#ffffff"/>
    <circle cx="32" cy="22" r="3.5" fill="#fde047"/>
    <path d="M22 46h20" stroke="#c084fc" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // 13. EarTrumpet (Modern Audio Mixer)
  "eartrumpet.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="earGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0ea5e9"/>
        <stop offset="1" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#earGrad)"/>
    <path d="M18 36v-8h8l10-8v24l-10-8h-8z" fill="#ffffff"/>
    <path d="M42 24c3 2 5 5 5 8s-2 6-5 8M47 18c6 4 9 9 9 14s-3 10-9 14" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  // 14. ScreenToGif (GIF recorder & editor)
  "screentogif.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="stgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#f43f5e"/>
        <stop offset="1" stop-color="#be123c"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#stgGrad)"/>
    <rect x="14" y="16" width="36" height="26" rx="4" fill="#ffffff"/>
    <rect x="20" y="22" width="24" height="14" rx="2" fill="#1e293b"/>
    <circle cx="32" cy="29" r="4" fill="#ef4444"/>
    <path d="M26 46h12M32 42v4" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`,

  // 15. Bulk Crap Uninstaller BCU (Aggressive batch uninstaller)
  "bcuninstaller.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="bcuGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#10b981"/>
        <stop offset="1" stop-color="#047857"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#bcuGrad)"/>
    <path d="M20 22h24l-3 26H23L20 22z" fill="#ffffff" opacity="0.9"/>
    <path d="M16 18h32M28 14h8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <path d="M28 26v16M36 26v16" stroke="#047857" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // 16. AtlasOS (Stripped gaming OS modification)
  "atlasos.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="atlasGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0f172a"/>
        <stop offset="1" stop-color="#1e293b"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#atlasGrad)" stroke="#38bdf8" stroke-width="2"/>
    <path d="M32 14l16 10v20l-16 10-16-10V24L32 14z" stroke="#38bdf8" stroke-width="2" fill="none"/>
    <path d="M32 20l11 20H21l11-20z" fill="#0284c7"/>
    <path d="M32 26l6 11H26l6-11z" fill="#0f172a"/>
  </svg>`,

  // 17. O&O ShutUp10++ (Privacy & Telemetry Shield)
  "oo-shutup10.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="shutupGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1e40af"/>
        <stop offset="1" stop-color="#1e3a8a"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#shutupGrad)"/>
    <path d="M32 12l16 6v14c0 11-7 20-16 22-9-2-16-11-16-22V18l16-6z" fill="#ffffff" opacity="0.95"/>
    <circle cx="32" cy="30" r="6" fill="#1e40af"/>
    <rect x="26" y="38" width="12" height="4" rx="2" fill="#ef4444"/>
  </svg>`,

  // 18. Chris Titus Tech WinUtil
  "winutil.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="cttGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0284c7"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#cttGrad)"/>
    <rect x="14" y="14" width="36" height="26" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <path d="M18 22l5 4-5 4M26 30h8" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="44" cy="46" r="6" stroke="#fbbf24" stroke-width="2"/>
    <path d="M44 42v8M40 46h8" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // 19. Terminal / PowerShell tip icon
  "tip-terminal.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="termGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#1e293b"/>
        <stop offset="1" stop-color="#0f172a"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#termGrad)" stroke="#475569" stroke-width="2"/>
    <circle cx="18" cy="18" r="2.5" fill="#ef4444"/>
    <circle cx="25" cy="18" r="2.5" fill="#f59e0b"/>
    <circle cx="32" cy="18" r="2.5" fill="#22c55e"/>
    <path d="M18 30l7 6-7 6M28 42h16" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // 20. Battery health tip icon
  "tip-battery.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="batGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#059669"/>
        <stop offset="1" stop-color="#047857"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#batGrad)"/>
    <rect x="14" y="22" width="36" height="20" rx="4" stroke="#ffffff" stroke-width="3" fill="none"/>
    <path d="M52 28v8" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <rect x="19" y="27" width="16" height="10" rx="2" fill="#4ade80"/>
    <path d="M28 24l-3 6h4l-2 6 5-7h-4l2-5z" fill="#ffffff"/>
  </svg>`,

  // 21. Wi-Fi extraction tip icon
  "tip-wifi.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="wifiGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#2563eb"/>
        <stop offset="1" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#wifiGrad)"/>
    <circle cx="32" cy="46" r="3" fill="#ffffff"/>
    <path d="M24 38c4.5-4 11.5-4 16 0M18 30c8-7 20-7 28 0M12 22c11-9.5 29-9.5 40 0" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="46" cy="20" r="6" fill="#f59e0b"/>
    <path d="M46 17v3M46 22h.01" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
  </svg>`,

  // 22. System repair / DISM / SFC tip icon
  "tip-repair.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="repGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#0284c7"/>
        <stop offset="1" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#repGrad)"/>
    <path d="M32 12l16 6v14c0 11-7 20-16 22-9-2-16-11-16-22V18l16-6z" fill="#0f172a" stroke="#38bdf8" stroke-width="2"/>
    <path d="M25 32l5 5 10-10" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,

  // 23. God Mode control panel tip icon
  "tip-godmode.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="godGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#d97706"/>
        <stop offset="1" stop-color="#b45309"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#godGrad)"/>
    <circle cx="32" cy="32" r="8" stroke="#ffffff" stroke-width="3" fill="none"/>
    <path d="M32 14v4M32 46v4M14 32h4M46 32h4M19 19l3 3M42 42l3 3M19 45l3-3M42 22l3-3" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="32" r="3" fill="#fef08a"/>
  </svg>`,

  // 24. Fun stuff retro easter egg icon
  "fun-retro.svg": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
    <defs>
      <linearGradient id="funGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
        <stop stop-color="#7c3aed"/>
        <stop offset="1" stop-color="#5b21b6"/>
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="16" fill="url(#funGrad)"/>
    <rect x="14" y="20" width="36" height="24" rx="8" fill="#1e1b4b" stroke="#c4b5fd" stroke-width="2"/>
    <path d="M22 32h8M26 28v8" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="40" cy="30" r="2.5" fill="#f43f5e"/>
    <circle cx="44" cy="34" r="2.5" fill="#38bdf8"/>
    <circle cx="36" cy="34" r="2.5" fill="#fbbf24"/>
  </svg>`,
};

for (const [filename, content] of Object.entries(icons)) {
  const filePath = path.join(toolsDir, filename);
  fs.writeFileSync(filePath, content.trim(), "utf8");
  console.log(`Generated: ${filename}`);
}

console.log("Finished generating all 24 tool and tip SVG icons.");
