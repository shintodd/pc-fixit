import json
import os

NEW_ISSUES = {
    "no-internet": [
        {
            "id": "net-ethernet-capped-100mbps",
            "slug": "ethernet-cable-capped-100mbps-gigabit",
            "title": "Ethernet speed capped at 100 Mbps instead of 1 Gbps (1000 Mbps)",
            "summary": "Paying for 300Mbps to 1Gbps internet but Windows Ethernet link speed shows capped at 100/100 Mbps.",
            "severity": "medium",
            "category_slug": "no-internet",
            "symptoms": [
                "Windows Network Properties shows 'Link speed (Receive/Transmit): 100/100 (Mbps)'",
                "Speed test never exceeds 94-95 Mbps on a 500Mbps+ fiber plan",
                "Ethernet port LED shows amber/orange instead of green"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Inspect and replace damaged Cat5/Cat5e Ethernet cable",
                    "instruction": "Gigabit Ethernet (1000 Mbps) requires all 8 copper pins to negotiate properly. If even one pin is bent or severed, Windows falls back to 4-pin Fast Ethernet (100 Mbps). Swap cable for a certified Cat6 patch cable.",
                    "caution": "Avoid flat or ultra-thin ribbon Ethernet cables over long runs due to crosstalk."
                },
                {
                    "order": 2,
                    "title": "Disable Energy Efficient Ethernet and Green Ethernet",
                    "instruction": "Open Device Manager -> Network adapters -> right-click your Intel/Realtek Ethernet controller -> Properties -> Advanced tab. Set 'Energy Efficient Ethernet', 'Green Ethernet', and 'Gigabit Lite' to 'Disabled'.",
                    "caution": "Power saving features cause Realtek NICs to downshift link speed."
                },
                {
                    "order": 3,
                    "title": "Force Speed & Duplex to 1.0 Gbps Full Duplex",
                    "instruction": "In the same Advanced tab, find 'Speed & Duplex'. If set to 'Auto Negotiation' and negotiating 100 Mbps, test setting it explicitly to '1.0 Gbps Full Duplex'. Click OK.",
                    "caution": "If the link completely drops when forced to 1.0 Gbps, the physical cable or wall port jack is physically damaged."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "net-vpn-disconnect-no-internet",
            "slug": "no-internet-after-vpn-disconnects-killswitch",
            "title": "Internet completely dies whenever VPN is disconnected or uninstalled",
            "summary": "Browser cannot open any websites after disconnecting from NordVPN, ExpressVPN, or ProtonVPN.",
            "severity": "high",
            "category_slug": "no-internet",
            "symptoms": [
                "Internet works while connected to VPN, but immediately dies when VPN is turned off",
                "Browser reports 'DNS_PROBE_FINISHED_NO_INTERNET'",
                "VPN Kill-Switch remained engaged in Windows network stack"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Reopen VPN client and turn off 'Kill Switch'",
                    "instruction": "Launch your VPN app (NordVPN, Proton, Express, Mullvad). Go to Settings -> Connection / Security -> toggle OFF 'Kill Switch' and 'Block non-VPN traffic'. Disconnect properly from within the app.",
                    "caution": "Force-closing a VPN via Task Manager leaves its Windows firewall filter rules active."
                },
                {
                    "order": 2,
                    "title": "Reset Windows Firewall and TAP adapters",
                    "instruction": "Open Windows Defender Firewall -> click 'Restore defaults' on the left sidebar. Then open Device Manager -> Network adapters -> right-click any virtual 'TAP-Windows Adapter' or 'Wintun Userspace Tunnel' -> Uninstall device.",
                    "caution": "Windows will cleanly regenerate standard network routes on reboot."
                },
                {
                    "order": 3,
                    "title": "Flush DNS and reset TCP/IP and Winsock catalog",
                    "instruction": "Open Command Prompt as Administrator. Run: 'netsh winsock reset', 'netsh int ip reset', 'ipconfig /release', 'ipconfig /flushdns', 'ipconfig /renew'. Reboot PC.",
                    "caution": "Reboot is required for the Winsock reset to take effect."
                }
            ],
            "related_error_codes": ["DNS_PROBE_FINISHED_NO_INTERNET"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "net-wifi-ping-spikes-60-seconds",
            "slug": "wifi-ping-spikes-every-minute-gaming-lag",
            "title": "Wi-Fi ping spikes to 300ms+ every 60 seconds during online gaming",
            "summary": "Gaming has steady 20ms ping that spikes to 300ms-1000ms every 60 seconds due to Windows background Wi-Fi scanning.",
            "severity": "medium",
            "category_slug": "no-internet",
            "symptoms": [
                "Ping spikes in Valorant, CS2, Fortnite, or Rocket League exactly every 60 seconds",
                "Command Prompt 'ping 1.1.1.1 -t' shows 15ms with periodic 400ms jumps",
                "Windows WLAN AutoConfig background roaming scan active"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Disable background Wi-Fi network scanning with WLAN Optimizer or netsh",
                    "instruction": "Windows scans for nearby Wi-Fi networks every 60 seconds, which freezes game packets. Open Command Prompt (Admin) and run: 'netsh wlan set autoconfig enabled=no interface=\"Wi-Fi\"'.",
                    "caution": "To search for new Wi-Fi networks in the future, re-enable with: 'netsh wlan set autoconfig enabled=yes interface=\"Wi-Fi\"'."
                },
                {
                    "order": 2,
                    "title": "Switch Wi-Fi adapter to 5 GHz band exclusively",
                    "instruction": "In Device Manager -> Network adapters -> Wi-Fi card -> Properties -> Advanced. Set 'Preferred Band' to 'Prefer 5GHz Band' and 'Channel Width for 5GHz' to 'Auto'.",
                    "caution": "2.4 GHz is crowded with microwave ovens and Bluetooth interference."
                },
                {
                    "order": 3,
                    "title": "Disable Roaming Aggressiveness",
                    "instruction": "In the same Advanced tab, set 'Roaming Aggressiveness' to '1. Lowest'. This stops your PC from constantly hunting for other mesh router nodes.",
                    "caution": "Keep at lowest if PC is stationary at a desk."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        }
    ],
    "overheating": [
        {
            "id": "thermal-fan-curve-hysteresis-revving",
            "slug": "pc-fans-revving-up-down-every-few-seconds",
            "title": "PC case and CPU fans revving up and down loudly every 5 seconds",
            "summary": "Fans repeatedly accelerate to 100% and drop back down during light desktop usage, causing annoying fan oscillation.",
            "severity": "low",
            "category_slug": "overheating",
            "symptoms": [
                "Fans ramp up to high RPM when opening a browser tab and spin down immediately",
                "Audible pulsating fan noise every few seconds",
                "Modern Ryzen and Intel CPUs spiking to 65C for 1 second during background tasks"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Add Fan Step Up / Step Down time delay (Hysteresis) in BIOS",
                    "instruction": "Reboot into BIOS -> open Hardware Monitor / Q-Fan Control / Smart Fan. Find 'CPU Fan Step Up Time' (or Spin Up Time) and set to '3.0 seconds' (or Level 3). Set 'Step Down Time' to '5.0 seconds'.",
                    "caution": "This delays fan response so short 1-second temperature spikes do not trigger sudden fan revving."
                },
                {
                    "order": 2,
                    "title": "Flatten the fan curve below 65 degrees Celsius",
                    "instruction": "In the BIOS fan curve graph, keep fan speed at a constant quiet 35% to 40% from 30C up to 65C. Only ramp up fan speed when temperatures exceed 75C under actual gaming or render workloads.",
                    "caution": "Modern 7nm/5nm CPUs run hot at idle by design; constant 40% fan speed is completely safe."
                },
                {
                    "order": 3,
                    "title": "Use Fan Control software to sync case fans to GPU temperature",
                    "instruction": "Download free open-source 'Fan Control' (by Rem0o). Set front intake case fans to follow GPU temperature instead of CPU spikes for whisper-quiet desktop operation.",
                    "caution": "Save configuration and enable 'Start with Windows'."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "thermal-aio-cooler-dead-pump-throttling",
            "slug": "aio-liquid-cooler-pump-dead-95c-idle",
            "title": "Liquid AIO cooler CPU temperature hitting 95C-100C at idle (Pump Failure)",
            "summary": "CPU temperatures instantly spike to 100C within 60 seconds of turning on PC, fans spin at maximum, and PC shuts down.",
            "severity": "critical",
            "category_slug": "overheating",
            "symptoms": [
                "CPU temperature reaches 90C-100C at idle in BIOS or desktop",
                "AIO radiator fans blowing cool air while CPU is burning hot",
                "BIOS reports 'CPU Fan Error' or AIO pump RPM reads 0 RPM"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Check AIO pump power connector and RPM in BIOS",
                    "instruction": "Check that the 3-pin or 4-pin AIO pump header is plugged into the motherboard's dedicated 'AIO_PUMP' or 'W_PUMP' port (set to 100% full speed in BIOS). Verify pump reads between 2000-4500 RPM.",
                    "caution": "Never plug an AIO pump into a port set to low DC voltage control."
                },
                {
                    "order": 2,
                    "title": "Feel both rubber coolant tubes for vibration and temperature disparity",
                    "instruction": "Gently touch both rubber tubes with fingers. You should feel slight fluid vibration. If one tube is scorching hot and the other tube is stone cold, coolant is not circulating (pump impeller is stuck or dead).",
                    "caution": "Do not pull on the tubes; simply touch the exterior sleeve."
                },
                {
                    "order": 3,
                    "title": "Check AIO radiator orientation for trapped air bubbles",
                    "instruction": "Ensure the highest point of the AIO radiator loop is ABOVE the CPU block. If the radiator is mounted at the bottom of the case, air bubbles rise into the pump, running it dry and burning it out.",
                    "caution": "Mount radiator to the top of the case (preferred) or front with tubes at the bottom."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "thermal-cooler-plastic-peel-left-on",
            "slug": "cpu-cooler-plastic-peel-sticker-left-on-heatsink",
            "title": "CPU cooler plastic protective peel was left on the copper coldplate",
            "summary": "Newly built PC throttles at 90C-100C immediately because the transparent factory peel sticker was not removed before applying paste.",
            "severity": "critical",
            "category_slug": "overheating",
            "symptoms": [
                "Brand new PC build reaches 95C-100C under light load or Cinebench test",
                "Cooler is properly screwed down and fans spin, but thermals are terrible",
                "Thermal paste was applied directly on top of the factory plastic warning film"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Remove CPU cooler and inspect coldplate base",
                    "instruction": "Unscrew CPU cooler mounting bracket. Lift cooler straight up. Check the bottom copper surface. Look for a transparent plastic film with warning text ('Warning! Please peel off before installation').",
                    "caution": "On AMD AM4/AM5 CPUs, twist cooler gently back and forth before pulling up so CPU does not get pulled out of socket."
                },
                {
                    "order": 2,
                    "title": "Peel off plastic sticker and clean surfaces with isopropyl alcohol",
                    "instruction": "Peel off the plastic film completely. Clean old thermal paste off both the CPU heat spreader and cooler copper base using 90%+ Isopropyl Alcohol (IPA) and a lint-free coffee filter or paper towel.",
                    "caution": "Ensure copper base is completely clean and dry before applying new paste."
                },
                {
                    "order": 3,
                    "title": "Apply fresh pea-sized drop of thermal paste and remount",
                    "instruction": "Place a pea-sized dot of quality thermal paste (Arctic MX-4/MX-6, Noctua NT-H1, Thermalright TF7) in the center of the CPU. Re-tighten cooler screws in a criss-cross X pattern until snug.",
                    "caution": "Do not over-tighten; stop when screws reach natural resistance."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        }
    ],
    "blue-screen": [
        {
            "id": "bsod-whea-uncorrectable-error-0x124",
            "slug": "whea-uncorrectable-error-0x00000124-cpu-hardware-crash",
            "title": "WHEA_UNCORRECTABLE_ERROR (0x00000124) hardware CPU or PCIe crash",
            "summary": "Hardware error detected by Windows Hardware Error Architecture (WHEA) caused by unstable CPU voltage, bad undervolt, or PCIe fault.",
            "severity": "critical",
            "category_slug": "blue-screen",
            "symptoms": [
                "Blue screen stop code: WHEA_UNCORRECTABLE_ERROR",
                "Bugcheck parameter 1 = 0x00000000 (Machine Check Exception)",
                "Crashes under gaming load or when idle after overclocking or undervolting"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Reset all CPU Curve Optimizer and undervolts to stock in BIOS",
                    "instruction": "Enter BIOS and reset CPU voltage settings to factory stock. If using AMD Curve Optimizer or Intel Voltage Offset, set to 0. A negative curve that is unstable at light loads causes immediate WHEA crashes.",
                    "caution": "Negative core offsets that pass 100% stress tests often crash when cores drop to low idle frequencies."
                },
                {
                    "order": 2,
                    "title": "Inspect WHEA record in Event Viewer (Event ID 18/19)",
                    "instruction": "Open Windows Event Viewer -> Windows Logs -> System. Filter by Event Source 'WHEA-Logger'. Look for Event ID 18 (Machine Check Exception) and note the 'APIC ID' to determine which specific CPU core failed.",
                    "caution": "APIC ID 0/1 = Core 0; APIC ID 2/3 = Core 1."
                },
                {
                    "order": 3,
                    "title": "Update motherboard BIOS for CPU microcode stability",
                    "instruction": "Ensure motherboard BIOS is updated. Both Intel 13th/14th Gen (0x129 microcode) and AMD Ryzen 7000/9000 series rely on critical AGESA BIOS microcode updates to prevent voltage degradation crashes.",
                    "caution": "Never interrupt power during a BIOS flash."
                }
            ],
            "related_error_codes": ["0x00000124"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "bsod-kernel-security-check-failure-0x139",
            "slug": "kernel-security-check-failure-0x00000139-driver-anticheat",
            "title": "KERNEL_SECURITY_CHECK_FAILURE (0x00000139) anti-cheat or memory crash",
            "summary": "Windows kernel integrity check failed, typically caused by kernel-level anti-cheat drivers (Vanguard, BattlEye, EAC) or faulty RAM.",
            "severity": "high",
            "category_slug": "blue-screen",
            "symptoms": [
                "Stop code KERNEL_SECURITY_CHECK_FAILURE",
                "Crashes while playing Valorant, Rainbow Six Siege, or Easy Anti-Cheat games",
                "Crash dump references vgk.sys, bedaisy.sys, or easyanticheat.sys"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Reinstall clean Anti-Cheat service",
                    "instruction": "Uninstall the offending anti-cheat (e.g. Riot Vanguard) from Windows Apps & Features. Delete its leftover program directory in 'C:\\Program Files\\Riot Vanguard'. Reboot PC, then launch game client to reinstall fresh service.",
                    "caution": "Ensure Windows Virtualization-Based Security (VBS) and Core Isolation are supported in Windows Security settings."
                },
                {
                    "order": 2,
                    "title": "Test memory integrity with Windows Memory Diagnostic",
                    "instruction": "Press Win+R, type 'mdsched.exe' and choose 'Restart now and check for problems'. If memory errors are reported, run MemTest86 on a bootable USB to pinpoint failing RAM modules.",
                    "caution": "Even 1 single memory error will corrupt kernel security checksums."
                },
                {
                    "order": 3,
                    "title": "Run DISM and SFC scans to verify kernel integrity",
                    "instruction": "Open Terminal as Administrator. Run 'DISM.exe /Online /Cleanup-image /Restorehealth' followed by 'sfc /scannow' to repair damaged system DLL files.",
                    "caution": "Reboot PC once repairs are reported."
                }
            ],
            "related_error_codes": ["0x00000139"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "bsod-critical-process-died-0xef",
            "slug": "critical-process-died-0x000000ef-nvme-ssd-failure",
            "title": "CRITICAL_PROCESS_DIED (0x000000EF) NVMe SSD dropping or Windows system crash",
            "summary": "Essential Windows background process terminated abruptly, often caused by an M.2 NVMe SSD suddenly dropping off the PCIe bus.",
            "severity": "critical",
            "category_slug": "blue-screen",
            "symptoms": [
                "Blue screen stop code: CRITICAL_PROCESS_DIED",
                "BSOD dump creation gets stuck at 0% and fails to write minidump",
                "After rebooting, PC enters BIOS directly because SSD is not detected until power cycle"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Reseat NVMe M.2 SSD in motherboard slot",
                    "instruction": "Shut down PC and unplug power cord. Unscrew M.2 heatsink, remove M.2 SSD, clean gold contacts gently with a dry lint-free cloth, and reinsert firmly into M.2 slot at a 30-degree angle. Screw down securely.",
                    "caution": "Thermal expansion and contraction can cause slight contact oxidation in M.2 slots over time."
                },
                {
                    "order": 2,
                    "title": "Update NVMe SSD firmware via vendor utility",
                    "instruction": "Download vendor SSD management software (Samsung Magician, WD Dashboard, Crucial Storage Executive, Kingston SSD Manager). Check for and apply SSD firmware updates.",
                    "caution": "Samsung 980/990 Pro and WD SN850X had known firmware bugs causing SSDs to lock into read-only mode or disconnect under PCIe 4.0 sleep states."
                },
                {
                    "order": 3,
                    "title": "Disable PCI Express Link State Power Management",
                    "instruction": "Open 'powercfg.cpl' -> Change plan settings -> Change advanced power settings. Expand 'PCI Express' -> 'Link State Power Management' -> set to 'Off'.",
                    "caution": "Prevents Windows from putting NVMe controller into ultra-low-power states that fail to wake up in time."
                }
            ],
            "related_error_codes": ["0x000000EF"],
            "source": "reddit_techsupport",
            "verified": True
        }
    ]
}

print("Injecting part 2 community issues...")
for cat, issues in NEW_ISSUES.items():
    path = f"data/research/{cat}.json"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        
        existing_slugs = {item["slug"] for item in existing}
        added = 0
        for issue in issues:
            if issue["slug"] not in existing_slugs:
                existing.append(issue)
                existing_slugs.add(issue["slug"])
                added += 1
        
        with open(path, "w", encoding="utf-8") as f:
            json.dump(existing, f, indent=2)
        print(f"Updated {path}: added {added} new issues. Total now: {len(existing)}")

print("Part 2 community issues successfully injected!")
