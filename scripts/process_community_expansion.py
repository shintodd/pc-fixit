import json
import os

# New curated community issues extracted directly from r/techsupport wiki & community troubleshooting archives
NEW_ISSUES = {
    "driver-issues": [
        {
            "id": "driver-audio-mic-discord-crosstalk",
            "slug": "audio-mic-discord-game-sound-leak",
            "title": "Microphone picking up PC game audio and desktop sounds in Discord",
            "summary": "Friends hear your game, YouTube, or music through your mic even when wearing headphones.",
            "severity": "medium",
            "category_slug": "driver-issues",
            "symptoms": [
                "Discord friends hear themselves or your game audio",
                "Microphone input volume bar moves when watching YouTube with headset on",
                "Stereo Mix or Realtek Audio crosstalk"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Disable Stereo Mix in Windows Sound Control Panel",
                    "instruction": "Press Win+R, type 'mmsys.cpl' and hit Enter. Go to the 'Recording' tab. If you see 'Stereo Mix' or 'Wave Out', right-click and select 'Disable'.",
                    "caution": "Do not disable your primary physical microphone device."
                },
                {
                    "order": 2,
                    "title": "Check 3.5mm combo jack splitter crosstalk",
                    "instruction": "If using a single 4-pole 3.5mm headset plugged into separate mic/audio PC ports, cheap splitters leak electrical audio signals between channels. Test with a dedicated USB audio dongle or Apple 3.5mm-to-USB-C DAC.",
                    "caution": "Ensure the 3.5mm jack is pushed completely into the socket until it clicks."
                },
                {
                    "order": 3,
                    "title": "Enable Discord Noise Suppression and Echo Cancellation",
                    "instruction": "In Discord Settings -> Voice & Video, set Noise Suppression to 'Krisp'. Turn on 'Echo Cancellation' and disable 'Listen to this Device' in Windows recording device properties.",
                    "caution": "Krisp requires slight CPU overhead; on very old 4-core CPUs use 'Standard' instead."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "driver-monitor-stuck-60hz",
            "slug": "monitor-stuck-60hz-high-refresh-rate",
            "title": "144Hz or 240Hz gaming monitor stuck running at 60Hz",
            "summary": "High refresh rate monitor is displaying only 60Hz in Windows display settings or feels choppy.",
            "severity": "medium",
            "category_slug": "driver-issues",
            "symptoms": [
                "144Hz, 165Hz or 240Hz monitor capped at 60Hz",
                "Windows Advanced Display settings only shows 59.94Hz or 60Hz dropdown",
                "Mouse cursor movement feels sluggish on gaming monitor"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Replace HDMI cable with DisplayPort cable",
                    "instruction": "Older HDMI 1.4 cables or budget motherboard/monitor HDMI ports cap output to 1080p 60Hz. Connect your GPU directly to the monitor using a DisplayPort 1.4 cable.",
                    "caution": "Connect cable to your dedicated graphics card ports (horizontal), NEVER to the motherboard ports (vertical)."
                },
                {
                    "order": 2,
                    "title": "Change refresh rate in Windows Advanced Display",
                    "instruction": "Right-click desktop -> Display settings -> Advanced display. Click the 'Choose a refresh rate' dropdown and select your monitor's native max Hz (144Hz / 165Hz / 240Hz).",
                    "caution": "If the screen goes black for 15 seconds, do not panic; Windows will automatically revert if unsupported."
                },
                {
                    "order": 3,
                    "title": "Configure Nvidia Control Panel / AMD Adrenalin resolution list",
                    "instruction": "In Nvidia Control Panel under 'Change resolution', scroll down past 'Ultra HD, HD, SD' to the 'PC' section. Select your resolution under 'PC' to unlock higher refresh rates.",
                    "caution": "Resolutions under 'TV' often restrict refresh rates to 60Hz."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "driver-bluetooth-missing-windows-11",
            "slug": "bluetooth-toggle-missing-disappeared-windows",
            "title": "Bluetooth toggle completely missing from Windows 11 Action Center",
            "summary": "Bluetooth switch disappeared from settings and Device Manager shows yellow triangle or code 43 on Intel Bluetooth.",
            "severity": "medium",
            "category_slug": "driver-issues",
            "symptoms": [
                "No Bluetooth toggle in Windows Settings or Action Center",
                "Device Manager shows 'Unknown USB Device (Device Descriptor Request Failed)'",
                "Intel Wireless Bluetooth device shows yellow exclamation mark"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Perform a complete motherboard capacitor drain (Cold Boot)",
                    "instruction": "Shut down PC. Turn off power supply switch and unplug power cord from wall. Hold PC power button down for 30 seconds to drain motherboard capacitors. Plug back in and boot up.",
                    "caution": "Most Intel/MediaTek Wi-Fi+BT cards share a PCIe USB bus that hangs and requires complete power cut to reset."
                },
                {
                    "order": 2,
                    "title": "Restart Bluetooth Support Service",
                    "instruction": "Press Win+R, type 'services.msc', find 'Bluetooth Support Service'. Right-click -> Properties -> set Startup type to 'Automatic'. Click 'Start', then click OK.",
                    "caution": "Also restart 'Bluetooth Audio Gateway Service' if using wireless headsets."
                },
                {
                    "order": 3,
                    "title": "Reinstall clean vendor Bluetooth driver",
                    "instruction": "Download latest Bluetooth driver from motherboard manufacturer site (or Intel Driver & Support Assistant). Uninstall current driver from Device Manager and install the downloaded package.",
                    "caution": "Do not use third-party automated driver finder apps."
                }
            ],
            "related_error_codes": ["0x0000002B"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "driver-usb-disconnect-sound-loop",
            "slug": "usb-disconnect-reconnect-sound-loop",
            "title": "Windows plays USB disconnect and connect chime sound repeatedly in a loop",
            "summary": "Constant Windows hardware disconnect and connect chimes playing every few seconds or minutes.",
            "severity": "low",
            "category_slug": "driver-issues",
            "symptoms": [
                "Windows plays USB disconnect sound every 5-30 seconds",
                "Device Manager constantly refreshes / blinks",
                "Mouse or keyboard randomly freezes for half a second"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Identify offending device using USBDeview",
                    "instruction": "Download free NirSoft USBDeview. Sort by 'Last Plug/Unplug Date'. Look at the top entry when the sound plays to identify the exact USB peripheral or internal hub disconnecting.",
                    "caution": "Run USBDeview as Administrator to see internal motherboard USB headers."
                },
                {
                    "order": 2,
                    "title": "Disable USB Selective Suspend in Power Options",
                    "instruction": "Press Win+R, type 'powercfg.cpl', click 'Change plan settings' -> 'Change advanced power settings'. Expand 'USB settings' -> 'USB selective suspend setting' -> set to 'Disabled'.",
                    "caution": "This prevents Windows from putting idle USB controllers into sleep mode."
                },
                {
                    "order": 3,
                    "title": "Uncheck 'Allow computer to turn off this device' in Device Manager",
                    "instruction": "Open Device Manager -> expand 'Universal Serial Bus controllers'. Right-click each 'USB Root Hub' and 'Generic USB Hub' -> Properties -> Power Management -> uncheck 'Allow the computer to turn off this device to save power'.",
                    "caution": "Repeat for USB Input Devices under 'Human Interface Devices' if mouse or keyboard disconnects."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "driver-audio-crackling-dpc-latency",
            "slug": "audio-crackling-popping-dpc-latency",
            "title": "Audio crackling, popping, and micro-stuttering in games and videos",
            "summary": "Sound pops, stutters, and glitches whenever moving the mouse, launching games, or watching videos.",
            "severity": "medium",
            "category_slug": "driver-issues",
            "symptoms": [
                "Audio pops or crackles during gaming or YouTube playback",
                "Micro-stutters coinciding with audio drops",
                "LatencyMon reports high DPC routine latency in ndis.sys or nvlddmkm.sys"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Run LatencyMon to identify the faulty driver",
                    "instruction": "Download and run LatencyMon. Click the green Play button and reproduce audio pops for 3 minutes. Check the 'Drivers' tab to see which driver has the highest execution time (e.g. Wi-Fi, GPU, or Audio).",
                    "caution": "ndis.sys points to Wi-Fi/Ethernet drivers; nvlddmkm.sys points to Nvidia GPU driver."
                },
                {
                    "order": 2,
                    "title": "Change Power Management mode in GPU control panel",
                    "instruction": "In Nvidia Control Panel -> Manage 3D Settings -> set 'Power management mode' to 'Prefer consistent performance' (or 'Prefer maximum performance'). Rapid GPU power state switching causes audio pops.",
                    "caution": "Increases idle GPU power draw by ~5 to 10 watts."
                },
                {
                    "order": 3,
                    "title": "Disable Wi-Fi Roaming Aggressiveness and Energy Efficient Ethernet",
                    "instruction": "In Device Manager -> Network adapters -> right-click your network card -> Properties -> Advanced. Set 'Energy Efficient Ethernet' to 'Disabled' and 'Roaming Aggressiveness' to 'Lowest'.",
                    "caution": "Network card power-saving interrupts are the #1 cause of DPC audio spikes."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "driver-gpu-ddu-clean-install",
            "slug": "ddu-clean-reinstall-graphics-drivers",
            "title": "Clean GPU driver reinstall using Display Driver Uninstaller (DDU)",
            "summary": "Purge corrupted graphics driver fragments and registry keys causing crashes, black screens, and stuttering.",
            "severity": "high",
            "category_slug": "driver-issues",
            "symptoms": [
                "Games crashing immediately on startup after driver update",
                "Display flickering or black screening when opening 3D applications",
                "Nvidia GeForce Experience or AMD Adrenalin installer fails with error"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Download DDU and standalone GPU driver installer",
                    "instruction": "Download latest DDU from Wagnardsoft. Download the official standalone driver installer for your GPU model from nvidia.com or amd.com. Disconnect internet (unplug ethernet or turn off Wi-Fi).",
                    "caution": "Disconnecting internet prevents Windows Update from automatically installing a generic driver during the process."
                },
                {
                    "order": 2,
                    "title": "Boot into Windows Safe Mode",
                    "instruction": "Hold Shift while clicking 'Restart' in the Windows Start menu. Go to Troubleshoot -> Advanced options -> Startup Settings -> click Restart -> press 4 or F4 for Safe Mode.",
                    "caution": "Always run DDU in Safe Mode to ensure no driver files are locked in memory."
                },
                {
                    "order": 3,
                    "title": "Run DDU and click 'Clean and restart'",
                    "instruction": "Open DDU in Safe Mode. Select device type 'GPU', select your vendor (Nvidia, AMD, Intel). Click 'Clean and restart'. Once booted back into normal Windows, run your downloaded driver installer.",
                    "caution": "Reconnect internet only after your new driver installation finishes."
                }
            ],
            "related_error_codes": ["0x00000116", "0x00000119"],
            "source": "reddit_techsupport",
            "verified": True
        }
    ],
    "running-slow": [
        {
            "id": "slow-game-shader-cache-stutter",
            "slug": "clearing-directx-shader-cache-game-stutter",
            "title": "Clearing corrupted DirectX shader cache causing micro-stuttering in games",
            "summary": "Stutters, hitching, and FPS drops whenever entering new areas in DirectX 12 and Unreal Engine games.",
            "severity": "medium",
            "category_slug": "running-slow",
            "symptoms": [
                "Game micro-freezes for half a second when turning camera or entering new areas",
                "FPS drops despite having a high-end GPU and CPU",
                "DirectX 12 games taking unusually long to compile shaders on startup"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Clear DirectX Shader Cache via Windows Disk Cleanup",
                    "instruction": "Press Win+R, type 'cleanmgr' and hit Enter. Select C: drive. Uncheck everything except 'DirectX Shader Cache'. Click OK -> Delete Files.",
                    "caution": "The next time you launch a game, it will take 1-2 minutes to recompile fresh clean shaders."
                },
                {
                    "order": 2,
                    "title": "Delete Nvidia / AMD driver shader cache folders",
                    "instruction": "Close all games. Press Win+R, type '%localappdata%' and press Enter. Open the 'NVIDIA' folder -> delete contents of 'DXCache' and 'GLCache'. For AMD, delete contents of '%localappdata%\\AMD\\DxCache'.",
                    "caution": "If files say 'in use', reboot PC and delete before opening any web browsers or launchers."
                },
                {
                    "order": 3,
                    "title": "Increase Shader Cache Size in GPU Control Panel",
                    "instruction": "In Nvidia Control Panel -> Manage 3D settings -> Global Settings -> scroll to 'Shader Cache Size'. Change from 'Driver Default' to '10 GB' or 'Unlimited'.",
                    "caution": "Prevents Windows from constantly evicting and recompiling shaders for modern 100GB+ games."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "slow-disk-100-percent-usage",
            "slug": "windows-100-percent-disk-usage-freeze",
            "title": "Windows task manager shows 100% disk usage and PC freezes",
            "summary": "Task Manager reports 100% active disk time on C: drive with 0.1 MB/s transfer rate, making PC unresponsive.",
            "severity": "high",
            "category_slug": "running-slow",
            "symptoms": [
                "Task Manager shows 100% Disk Usage on HDD or SATA SSD",
                "Response times in Disk tab spike above 3000ms",
                "Apps freeze and Windows takes 5 minutes to open Start Menu"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Disable Connected User Experiences and Telemetry",
                    "instruction": "Press Win+R, type 'services.msc'. Find 'Connected User Experiences and Telemetry' -> right-click Properties -> Startup type: 'Disabled' -> click 'Stop' -> OK.",
                    "caution": "This disables non-essential background Windows diagnostic telemetry reporting."
                },
                {
                    "order": 2,
                    "title": "Disable SysMain (Superfetch) on mechanical hard drives",
                    "instruction": "In 'services.msc', find 'SysMain'. Right-click Properties -> Startup type: 'Disabled' -> click 'Stop' -> OK. Reboot PC.",
                    "caution": "SysMain aggressively preloads apps into RAM, which completely saturates mechanical HDDs and budget DRAM-less SSDs."
                },
                {
                    "order": 3,
                    "title": "Check drive health with CrystalDiskInfo for bad sectors",
                    "instruction": "Download CrystalDiskInfo. Check the health status. If status is 'Caution' with 'Current Pending Sector Count' or 'Reallocated Sectors Count' above 0, the drive is failing physically.",
                    "caution": "If drive health is Caution, back up personal files immediately before running any disk benchmarks."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "slow-ram-xmp-expo-disabled",
            "slug": "ram-running-half-speed-xmp-expo-disabled",
            "title": "RAM running at slow base speed (2133MHz) because XMP/EXPO is disabled in BIOS",
            "summary": "Purchased 3200MHz, 3600MHz, or 6000MHz memory but Task Manager shows memory speed stuck at 2133MHz or 4800MHz.",
            "severity": "medium",
            "category_slug": "running-slow",
            "symptoms": [
                "Task Manager Performance -> Memory shows 2133MHz, 2400MHz or 4800MHz",
                "Lower 1% low FPS and micro-stuttering in CPU-heavy games",
                "Bought 3200MHz DDR4 or 6000MHz DDR5 but running at JEDEC default"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Verify RAM installed in optimal motherboard slots (Slots 2 and 4)",
                    "instruction": "For 2 sticks of RAM on a 4-slot motherboard, memory MUST be in slots A2 and B2 (the 2nd and 4th slots counting away from CPU). Daisy-chain motherboard traces fail signal integrity in slots 1 and 3.",
                    "caution": "Turn off PC and unplug power cable before opening case to reseat RAM."
                },
                {
                    "order": 2,
                    "title": "Enable XMP / DOCP / EXPO profile in motherboard BIOS",
                    "instruction": "Reboot PC and tap Delete (or F2) repeatedly to enter BIOS. Find 'XMP' (Intel/MSI/Gigabyte), 'DOCP' (ASUS AMD), or 'EXPO' (DDR5 AMD). Switch from 'Disabled' to 'Profile 1'. Press F10 to Save and Exit.",
                    "caution": "PC may power cycle 2-3 times on first boot while memory training completes; this is normal."
                },
                {
                    "order": 3,
                    "title": "Update motherboard BIOS if memory profile is unstable",
                    "instruction": "If enabling XMP causes crashes or fails to POST, download the latest BIOS version from your motherboard vendor's support page. Newer BIOS updates contain updated AGESA and memory compatibility microcode.",
                    "caution": "Never interrupt power or turn off PC while BIOS flash progress bar is running."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "slow-dism-sfc-system-repair",
            "slug": "repair-corrupted-windows-files-sfc-dism",
            "title": "Repair corrupted Windows system files using DISM and SFC tools",
            "summary": "Fix random crashes, broken Windows menus, and system errors caused by corrupted Windows component store files.",
            "severity": "medium",
            "category_slug": "running-slow",
            "symptoms": [
                "Windows features and built-in apps crashing randomly",
                "Windows Update error 0x800f081f or 0x80070002",
                "Command Prompt sfc /scannow says 'found corrupt files but was unable to fix some of them'"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Repair Windows Component Store with DISM online cleanup",
                    "instruction": "Press Win+X, select 'Terminal (Admin)' or 'Command Prompt (Admin)'. Type: 'DISM.exe /Online /Cleanup-image /Restorehealth' and press Enter. Wait 5-15 minutes until progress reaches 100%.",
                    "caution": "Keep internet connected; DISM pulls pristine replacement system files directly from Windows Update servers."
                },
                {
                    "order": 2,
                    "title": "Run System File Checker (SFC) scan",
                    "instruction": "In the same Administrator command prompt, type: 'sfc /scannow' and press Enter. Verify it finishes with 'Windows Resource Protection found corrupt files and successfully repaired them'.",
                    "caution": "Always run DISM BEFORE SFC so SFC has a healthy component store to pull files from."
                },
                {
                    "order": 3,
                    "title": "Reboot computer to finalize replaced system files",
                    "instruction": "Type 'shutdown /r /t 0' in the terminal or click Start -> Restart. Windows will finalize file replacements before loading desktop services.",
                    "caution": "Do not force power off during the restart phase."
                }
            ],
            "related_error_codes": ["0x800F081F", "0x80070002"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "slow-windows-clean-boot",
            "slug": "perform-clean-boot-find-software-conflict",
            "title": "Isolate freezing and high CPU usage with a Windows Clean Boot",
            "summary": "Disable all non-Microsoft background startup services to identify which software is freezing your computer.",
            "severity": "medium",
            "category_slug": "running-slow",
            "symptoms": [
                "PC freezes or lags in desktop but runs fine in Safe Mode",
                "High CPU or RAM usage immediately after logging into Windows",
                "Unknown background process causing game crashes"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Hide all Microsoft services in msconfig",
                    "instruction": "Press Win+R, type 'msconfig' and hit Enter. Go to the 'Services' tab. CRITICAL: Check the box 'Hide all Microsoft services' at the bottom left.",
                    "caution": "CRITICAL: You MUST check 'Hide all Microsoft services' first, otherwise disabling all services will break Windows login PIN."
                },
                {
                    "order": 2,
                    "title": "Disable remaining third-party services",
                    "instruction": "With Microsoft services hidden, click 'Disable all'. Then go to the 'Startup' tab -> click 'Open Task Manager' -> right-click and disable non-essential startup apps. Click OK and restart PC.",
                    "caution": "If the issue disappears after restart, re-enable services in halves to pinpoint the exact culprit app."
                },
                {
                    "order": 3,
                    "title": "Restore normal startup once testing is complete",
                    "instruction": "Once culprit software is uninstalled or identified, open 'msconfig' again, select 'Normal startup' on the General tab, click OK and reboot.",
                    "caution": "Do not leave PC permanently in selective startup if you rely on third-party security suites."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "slow-clean-windows-update-cache",
            "slug": "windows-update-stuck-clearing-cache",
            "title": "Windows Update stuck at 99%, 100%, or failing in a loop",
            "summary": "Clear corrupted Windows Update download cache in SoftwareDistribution folder to fix stuck update loops.",
            "severity": "medium",
            "category_slug": "running-slow",
            "symptoms": [
                "Windows Update stuck at downloading or installing (0%, 99% or 100%)",
                "Error 0x80248007, 0x80070003, or 'Undoing changes made to your computer'",
                "SoftwareDistribution folder taking 30GB+ of C: drive space"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Stop Windows Update and Background Transfer services",
                    "instruction": "Open Command Prompt as Administrator. Run these commands one by one: 'net stop wuauserv', 'net stop cryptSvc', 'net stop bits', 'net stop msiserver'.",
                    "caution": "Ensure all services confirm 'was stopped successfully' before proceeding."
                },
                {
                    "order": 2,
                    "title": "Rename or delete SoftwareDistribution and Catroot2 folders",
                    "instruction": "In the same command prompt, run: 'ren C:\\Windows\\SoftwareDistribution SoftwareDistribution.old' and 'ren C:\\Windows\\System32\\catroot2 catroot2.old'.",
                    "caution": "This wipes all corrupted pending update payloads without touching personal files."
                },
                {
                    "order": 3,
                    "title": "Restart update services and check for updates",
                    "instruction": "Run: 'net start wuauserv', 'net start cryptSvc', 'net start bits', 'net start msiserver'. Open Windows Settings -> Windows Update -> click 'Check for updates'.",
                    "caution": "First check may take 5 minutes while Windows rebuilds the fresh download manifest."
                }
            ],
            "related_error_codes": ["0x80248007", "0x80070003", "0x800705B4"],
            "source": "reddit_techsupport",
            "verified": True
        }
    ],
    "wont-boot": [
        {
            "id": "boot-psu-transient-spike-shutdown",
            "slug": "pc-reboots-gaming-no-bluescreen-psu-shutdown",
            "title": "PC randomly restarts or shuts down during heavy gaming with NO blue screen",
            "summary": "Computer instantly goes black and powers off or restarts under heavy graphics load without creating a BSOD minidump.",
            "severity": "critical",
            "category_slug": "wont-boot",
            "symptoms": [
                "PC instantly turns off as if power plug was pulled during heavy games",
                "No blue screen, no dump file in C:\\Windows\\Minidump",
                "Event Viewer shows Event ID 41 Kernel-Power (unexpected power loss)"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Use separate PCIe power cables instead of daisy-chained pigtail cables",
                    "instruction": "Check GPU power connectors. High-power graphics cards (RTX 3080/4080, RX 6800/7900) draw up to 350W+. Never use a single split 'pigtail' cable for two 8-pin ports. Run two or three separate individual cables directly from PSU.",
                    "caution": "A single PCIe cable is rated for 150W; pulling 300W over one cable trips PSU Over-Current Protection (OCP)."
                },
                {
                    "order": 2,
                    "title": "Test GPU power target or undervolt to tame transient spikes",
                    "instruction": "In MSI Afterburner, reduce 'Power Limit' slider to 85% or apply a gentle undervolt. If the PC stops crashing during benchmarks, your PSU is failing to handle microsecond GPU power spikes.",
                    "caution": "Temporary diagnostic workaround until a higher quality Tier-A/B power supply is installed."
                },
                {
                    "order": 3,
                    "title": "Verify PSU wattage and 12V rail health",
                    "instruction": "Check your PSU rated wattage against total system draw. Modern GPUs have transient spikes up to 2x TDP lasting 10 milliseconds. Older PSUs shut down immediately to protect components.",
                    "caution": "Avoid budget unrated power supplies; refer to the Cultists Network PSU Tier List."
                }
            ],
            "related_error_codes": ["Event ID 41"],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "boot-bitlocker-recovery-loop",
            "slug": "bitlocker-recovery-key-prompt-after-update",
            "title": "BitLocker blue screen asking for 48-digit recovery key on startup",
            "summary": "Computer boots directly to blue BitLocker Recovery screen asking for 48-digit numerical key after BIOS update or hardware change.",
            "severity": "critical",
            "category_slug": "wont-boot",
            "symptoms": [
                "Blue screen on boot: 'BitLocker - Enter the recovery key for this drive'",
                "Triggered after motherboard BIOS update, TPM toggle, or SSD swap",
                "Windows will not boot to desktop without entering 48-digit key"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Retrieve recovery key from your Microsoft Account portal",
                    "instruction": "On your phone or another device, go to 'account.microsoft.com/devices/recoverykey'. Sign in with every Microsoft account ever logged into the PC (including school/work accounts). Locate the matching Key ID.",
                    "caution": "Check the 'Key ID' displayed on the PC screen to ensure you match the correct recovery key."
                },
                {
                    "order": 2,
                    "title": "Revert BIOS TPM / Security settings if key is missing",
                    "instruction": "If you cannot find the key and this started immediately after a BIOS update: enter BIOS settings. Ensure 'fTPM' / 'Intel PTT' is enabled and 'Secure Boot' mode is set to 'Standard'. Do not clear TPM keys.",
                    "caution": "Never select 'Clear TPM' in BIOS unless you have your 48-digit key or intend to wipe the drive."
                },
                {
                    "order": 3,
                    "title": "Suspend BitLocker before performing future BIOS updates",
                    "instruction": "Once back in Windows, open Command Prompt (Admin) and run: 'manage-bde -protectors -disable C:'. Run your update, then run 'manage-bde -protectors -enable C:'.",
                    "caution": "Always back up your 48-digit key to a USB drive or printout."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "boot-blackscreen-after-secureboot",
            "slug": "black-screen-after-enabling-secure-boot",
            "title": "Black screen with no display signal after enabling Secure Boot in BIOS",
            "summary": "Motherboard fails to output display signal or POST after toggling Secure Boot for Valorant / Windows 11.",
            "severity": "critical",
            "category_slug": "wont-boot",
            "symptoms": [
                "No display signal immediately after enabling Secure Boot or changing PK keys in BIOS",
                "PC turns on, fans spin, but monitor says 'No Signal'",
                "GPU UEFI GOP driver incompatible with CSM disabled"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Clear CMOS to force motherboard back to default CSM settings",
                    "instruction": "Turn off power supply and unplug PC power cord. Locate the round silver CR2032 battery on motherboard. Use a flathead screwdriver or fingernail to pop battery out. Wait 5 minutes. Reinsert battery and turn PC on.",
                    "caution": "This resets all BIOS settings back to factory defaults with display output restored."
                },
                {
                    "order": 2,
                    "title": "Update GPU UEFI Firmware / GOP driver",
                    "instruction": "Older GPUs (Nvidia GTX 900/1000 series) lack modern UEFI GOP firmware and black-screen when CSM is disabled. Download the official 'NVIDIA Graphics Firmware Update Tool for DisplayPort 1.3 and 1.4 Displays' in Windows.",
                    "caution": "Run the firmware updater before attempting to enable Secure Boot again."
                },
                {
                    "order": 3,
                    "title": "Convert MBR drive to GPT before disabling CSM",
                    "instruction": "If your Windows drive is formatted as legacy MBR, disabling CSM makes the drive unbootable. In Windows Command Prompt (Admin), run 'mbr2gpt /validate /allowFullOS' then 'mbr2gpt /convert /allowFullOS'.",
                    "caution": "Do not convert if you are dual-booting with 32-bit legacy operating systems."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "boot-new-ssd-not-showing-windows",
            "slug": "new-ssd-hard-drive-not-showing-file-explorer",
            "title": "New NVMe M.2 SSD or SATA hard drive not showing up in File Explorer",
            "summary": "Installed a new solid-state drive or hard drive but it does not appear in 'This PC' or File Explorer.",
            "severity": "medium",
            "category_slug": "wont-boot",
            "symptoms": [
                "New SSD installed but missing in File Explorer / 'This PC'",
                "BIOS detects the SSD model name but Windows does not show the drive",
                "Drive is unallocated or missing drive letter"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Initialize and format disk in Disk Management (diskmgmt.msc)",
                    "instruction": "Press Win+X, select 'Disk Management' (or press Win+R and type 'diskmgmt.msc'). Look at the bottom list for a disk marked 'Unknown / Not Initialized' or 'Unallocated'.",
                    "caution": "Make sure you select the brand new unallocated disk, not your existing OS drive."
                },
                {
                    "order": 2,
                    "title": "Initialize disk as GPT partition style",
                    "instruction": "Right-click the disk number (e.g. 'Disk 1') -> select 'Initialize Disk'. Choose 'GPT (GUID Partition Table)' -> click OK.",
                    "caution": "Always choose GPT for modern drives and NVMe SSDs; MBR is legacy only."
                },
                {
                    "order": 3,
                    "title": "Create Simple Volume and assign drive letter",
                    "instruction": "Right-click the black 'Unallocated' space -> select 'New Simple Volume'. Follow the wizard: assign maximum size, choose a drive letter (e.g. D: or E:), format as NTFS with 'Perform a quick format'. Click Finish.",
                    "caution": "Your new SSD will now immediately appear in File Explorer ready for use."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "boot-laptop-furnace-sleep-modern-standby",
            "slug": "laptop-hot-battery-drain-closed-bag-modern-standby",
            "title": "Laptop burning hot and battery drains while closed inside backpack (Modern Standby)",
            "summary": "Laptop wakes up inside laptop sleeve or backpack, fans scream at 100%, and battery is completely drained.",
            "severity": "high",
            "category_slug": "wont-boot",
            "symptoms": [
                "Laptop burning hot to the touch when pulled out of bag",
                "Battery drained from 100% to 0% while lid was closed",
                "Windows 11 Modern Standby (S0 low power idle) staying active"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Switch Windows lid close action to 'Hibernate' instead of 'Sleep'",
                    "instruction": "Press Win+R, type 'powercfg.cpl' and press Enter. Click 'Choose what closing the lid does' on the left sidebar. Set 'When I close the lid:' to 'Hibernate' for both On Battery and Plugged In.",
                    "caution": "Hibernate saves complete RAM state to disk and powers off the motherboard 100% with zero heat and zero battery drain."
                },
                {
                    "order": 2,
                    "title": "Disable Network Connectivity in Standby",
                    "instruction": "Open Windows Settings -> System -> Power & battery. Under 'Network connectivity in standby', set to 'Never' (or run in Admin terminal: 'powercfg /setdcvalueindex scheme_current sub_none F15ADD7D-0D7D-4863-A7D0-84E73B719971 0').",
                    "caution": "Prevents Windows from waking up in your bag to download telemetry or email updates."
                },
                {
                    "order": 3,
                    "title": "Check sleep study logs for wake culprits",
                    "instruction": "Open Command Prompt as Administrator and run: 'powercfg /sleepstudy'. Open the generated HTML file in your browser to inspect which USB device, Bluetooth radio, or background app triggered the wake event.",
                    "caution": "Look for entries with 'Low Power State Time' below 90%."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        },
        {
            "id": "boot-breadboarding-bench-test",
            "slug": "breadboarding-pc-outside-case-bench-test",
            "title": "Breadboarding a PC: Testing core components outside the case on cardboard",
            "summary": "Isolate persistent short circuits, motherboard stand-off shorts, and non-POST issues by assembling bare minimum components outside case.",
            "severity": "critical",
            "category_slug": "wont-boot",
            "symptoms": [
                "PC fails to turn on or clicks off immediately inside case",
                "Motherboard suspected of shorting against metal chassis or standoff",
                "Fans twitch for 1 millisecond and shut down"
            ],
            "fix_steps": [
                {
                    "order": 1,
                    "title": "Disassemble motherboard and place on non-conductive cardboard box",
                    "instruction": "Remove motherboard from PC case. Place it on the flat cardboard motherboard box. CRITICAL: Never place it on an anti-static bag (the outer surface of anti-static bags is electrically conductive).",
                    "caution": "CRITICAL: Anti-static bags are conductive on the outside; only use plain dry cardboard or wood."
                },
                {
                    "order": 2,
                    "title": "Install only the absolute bare minimum components",
                    "instruction": "Install ONLY: CPU + CPU cooler, 1 stick of RAM in slot 2, 24-pin ATX power cable, and 8-pin EPS CPU power cable. Disconnect all SATA cables, front panel wires, case fans, and RGB headers.",
                    "caution": "If CPU lacks integrated graphics, install your GPU and connect its PCIe power cables."
                },
                {
                    "order": 3,
                    "title": "Bridge the two Power Switch pins with a flathead screwdriver",
                    "instruction": "Locate the front panel header (JFP1 / PANEL). Momentarily touch the tip of a metal screwdriver across the two 'PWR_SW' (Power Switch) pins for 1 second to turn on the board.",
                    "caution": "If the system POSTs cleanly on cardboard, your PC case has an extra standoff shorting the back of the motherboard."
                }
            ],
            "related_error_codes": [],
            "source": "reddit_techsupport",
            "verified": True
        }
    ]
}

print("Loading existing research files...")
for cat, issues in NEW_ISSUES.items():
    path = f"data/research/{cat}.json"
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as f:
            existing = json.load(f)
        
        # Deduplicate by slug
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

print("All community issues injected successfully!")
