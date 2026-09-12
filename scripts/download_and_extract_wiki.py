import urllib.request
import json
import os
import re

RAW_BASE = "https://raw.githubusercontent.com/r-techsupport/rTS_Wiki/master/src/content/docs/"

DOCS = [
    # Audio & Peripherals
    ("learning/audio-troubleshooting.md", "audio-mic-troubleshooting", "audio-peripherals", "medium"),
    ("factoids/ddu-audio.mdx", "ddu-audio-driver-clean-install", "audio-peripherals", "medium"),
    ("factoids/windows-ghost-monitor.md", "phantom-ghost-monitor-windows", "display-gaming", "low"),
    
    # Display & Gaming
    ("guides/No-Image-Troubleshooting.md", "no-display-signal-troubleshooting", "display-gaming", "high"),
    ("guides/clearing-shader-cache.md", "game-stuttering-clearing-shader-cache", "display-gaming", "low"),
    ("guides/blackscreen-after-secureboot.md", "blackscreen-after-enabling-secure-boot", "display-gaming", "critical"),
    ("factoids/ddu.mdx", "ddu-gpu-driver-clean-reinstall", "display-gaming", "medium"),
    
    # Storage & Disks
    ("disks/Disk-Management/diskmgmt.mdx", "new-drive-not-showing-in-windows", "storage-drives", "medium"),
    ("disks/Disk-Management/diskpart.md", "diskpart-clean-initialize-drive", "storage-drives", "high"),
    ("disks/Encryption/bitlocker.md", "bitlocker-recovery-key-prompt-troubleshooting", "storage-drives", "critical"),
    ("disks/chkdsk.md", "disk-errors-and-chkdsk-repair", "storage-drives", "medium"),
    ("disks/disk-health.md", "crystaldiskinfo-smart-health-check", "storage-drives", "medium"),
    ("factoids/writelock.md", "usb-drive-write-protected-fix", "storage-drives", "medium"),
    
    # Windows OS & Updates
    ("guides/Clearing-Windows-Update-Cache.md", "clearing-windows-update-cache-stuck", "windows-glitches", "medium"),
    ("guides/In-Place-Upgrade.md", "windows-in-place-upgrade-repair-without-data-loss", "windows-glitches", "high"),
    ("guides/dism-sfc.md", "sfc-scannow-and-dism-system-file-repair", "windows-glitches", "medium"),
    ("guides/Windows-Hello-Broken.md", "windows-hello-pin-fingerprint-broken", "windows-glitches", "medium"),
    ("guides/Rebuilding-Icon-Cache.md", "broken-blank-icons-iconcache-rebuild", "windows-glitches", "low"),
    ("factoids/cleanboot.md", "windows-clean-boot-troubleshooting", "windows-glitches", "medium"),
    ("factoids/pagefile.md", "out-of-memory-and-pagefile-configuration", "windows-glitches", "high"),
    ("guides/windows-recovery.md", "windows-automatic-repair-recovery-options", "windows-glitches", "critical"),
    
    # Networking
    ("networking/internet-not-working.md", "internet-not-working-comprehensive-triage", "no-internet", "high"),
    ("networking/dns.md", "dns-resolution-failure-and-custom-dns", "no-internet", "medium"),
    
    # Thermals & Hardware
    ("learning/throttling.md", "thermal-and-power-limit-throttling-diagnosis", "overheating", "high"),
    ("guides/psu-guide.md", "power-supply-black-screen-shutdowns", "wont-boot", "critical"),
    ("factoids/cmos.md", "reset-motherboard-cmos-and-bios-defaults", "wont-boot", "high"),
    ("factoids/breadboarding.md", "breadboarding-pc-outside-case-bench-test", "wont-boot", "critical"),
    ("factoids/swollen-battery.md", "swollen-bulging-laptop-battery-safety", "wont-boot", "critical"),
    ("guides/how-to-know-if-you-need-more-ram.md", "ram-bottleneck-and-memory-shortage", "running-slow", "medium")
]

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

def clean_markdown_to_text(text):
    # Strip frontmatter
    text = re.sub(r"^---[\s\S]*?---\n", "", text)
    # Strip astro components / JSX tags
    text = re.sub(r"<[^>]+>", "", text)
    return text.strip()

print(f"Downloading {len(DOCS)} targeted core community guides...")
downloaded = []
for rel_path, slug, cat, sev in DOCS:
    url = RAW_BASE + rel_path
    try:
        req = urllib.request.Request(url, headers=HEADERS)
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8', errors='ignore')
            content_clean = clean_markdown_to_text(content)
            downloaded.append({
                "slug": slug,
                "category": cat,
                "severity": sev,
                "raw": content_clean,
                "length": len(content_clean)
            })
            print(f"Downloaded: {slug} ({len(content_clean)} chars)")
    except Exception as e:
        print(f"Failed {url}: {e}")

print(f"Successfully downloaded {len(downloaded)} core guides.")
with open("data/research/scraped_wiki_cache.json", "w", encoding="utf-8") as f:
    json.dump(downloaded, f, indent=2)
