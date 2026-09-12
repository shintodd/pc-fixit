import fs from "fs";
import path from "path";

const NEW_WONT_BOOT = [
  {
    slug: "cmos-battery-dead-date-reset",
    title: "CMOS battery dead (BIOS clock and settings reset on every boot)",
    summary: "The CR2032 motherboard coin cell battery is depleted, causing the BIOS to lose time, date, and custom memory XMP/EXPO settings whenever mains AC power is switched off.",
    severity: "warn",
    category_slug: "wont-boot",
    symptoms: [
      "Windows clock shows 00:00 or incorrect year after turning PC on",
      "Motherboard prompts with 'CMOS Date/Time Not Set' or 'Press F1 to Run Setup'",
      "XMP or EXPO RAM profiles keep disabling themselves",
      "PC requires F1 or F2 keystroke every time power cord is reconnected"
    ],
    fix_steps: [
      {
        title: "Replace the CR2032 coin cell battery",
        detail: "Power off the PC and unplug the power supply. Locate the silver circular battery on the motherboard, gently push the metal retention clip to eject it, and insert a fresh 3V CR2032 lithium battery with the positive (+) side facing up."
      },
      {
        title: "Enter BIOS and restore correct system time",
        detail: "Boot into BIOS setup by tapping Del or F2. Navigate to System Information or Main, set current date and UTC time, and enable your RAM XMP or EXPO profile."
      },
      {
        title: "Verify CMOS clear jumper position",
        detail: "Check the CLRTC / CLR_CMOS header on the motherboard. Ensure no jumper cap is bridging the pins; keeping it shorted will continually wipe BIOS NVRAM on every boot."
      },
      {
        title: "Save settings and test cold boot",
        detail: "Press F10 to save and exit. Shut down Windows, switch off the power supply rocker switch for 60 seconds, turn it back on, and verify the PC boots straight into Windows without resetting."
      }
    ],
    related_error_codes: [12],
    source: "researched",
    verified: false
  },
  {
    slug: "secure-boot-violation-invalid-signature",
    title: "Secure Boot Violation: Invalid signature detected",
    summary: "The UEFI firmware blocks the operating system bootloader because its digital signature has expired, been revoked in the Secure Boot DBX database, or belongs to an unauthenticated secondary OS.",
    severity: "critical",
    category_slug: "wont-boot",
    symptoms: [
      "Red or blue banner reading 'Secure Boot Violation: Invalid signature detected'",
      "PC boots straight into BIOS setup instead of Windows",
      "Occurs after installing a Windows update or swapping graphics cards"
    ],
    fix_steps: [
      {
        title: "Enter UEFI BIOS and inspect Secure Boot state",
        detail: "Restart and tap Del or F2. Navigate to the Security or Boot tab, open Secure Boot Configuration, and confirm whether OS Type is set to 'Windows UEFI mode' rather than 'Other OS'."
      },
      {
        title: "Restore factory Secure Boot keys",
        detail: "Select 'Key Management' in the Secure Boot menu and click 'Restore Factory Default Keys' or 'Install Default Secure Boot Keys'. This refreshes the PK, KEK, and DB databases."
      },
      {
        title: "Temporarily switch Secure Boot to Disabled",
        detail: "If boot continues to fail, change Secure Boot from Enabled to Disabled. Save and restart to verify Windows boots normally. Once in Windows, run Windows Update to download the latest signed bootloader."
      },
      {
        title: "Update motherboard BIOS firmware",
        detail: "Download the latest BIOS from your motherboard manufacturer website onto a FAT32 USB flash drive. Flash the update to receive updated Microsoft revocation lists and re-enable Secure Boot."
      }
    ],
    related_error_codes: [193],
    source: "researched",
    verified: false
  },
  {
    slug: "nvme-ssd-missing-from-bios-boot-priority",
    title: "NVMe boot drive missing from BIOS priority list after sudden power cut",
    summary: "An abrupt power outage or hard reset causes the NVMe SSD controller to enter a lockup or low-power recovery state, making the drive temporarily vanish from the motherboard UEFI boot menu.",
    severity: "critical",
    category_slug: "wont-boot",
    symptoms: [
      "PC boots straight into BIOS setup utility",
      "M.2 slot shows 'Not Present' or 'Empty' in storage overview",
      "Error: 'Reboot and Select proper Boot device' appears on screen"
    ],
    fix_steps: [
      {
        title: "Perform a full motherboard power drain (capacitive discharge)",
        detail: "Shut down the PC, unplug the AC power cord from the wall, and hold down the front chassis power button for 30 full seconds. Reconnect AC power and turn on the PC."
      },
      {
        title: "Reseat the M.2 NVMe SSD in its slot",
        detail: "Unscrew the M.2 thermal heatsink, remove the NVMe drive, inspect the gold edge contacts for dust, and firmly insert it at a 30-degree angle before fastening the retention standoff."
      },
      {
        title: "Check CSM / UEFI boot mode compatibility",
        detail: "In BIOS settings, navigate to Boot > CSM (Compatibility Support Module). If your Windows was installed in pure UEFI mode, ensure CSM is Disabled and Windows Boot Manager is selected as Priority 1."
      },
      {
        title: "Test NVMe in secondary M.2 slot",
        detail: "If the primary CPU-connected M.2 slot does not register the drive, move the SSD to a chipset-connected M.2 slot on the lower half of the motherboard to isolate a dead lane or controller fault."
      }
    ],
    related_error_codes: [18, 19],
    source: "researched",
    verified: false
  },
  {
    slug: "power-supply-surge-protection-lockout",
    title: "Power supply surge lockout (clicks once and requires AC unplug to reset)",
    summary: "The power supply internal supervisor IC triggers Over-Current Protection (OCP) or Short-Circuit Protection (SCP) due to an electrical surge or transient spike, latching into a protective shutdown.",
    severity: "critical",
    category_slug: "wont-boot",
    symptoms: [
      "Audible 'click' sound from the PSU when pressing power button, then silence",
      "Power button does nothing on second press until power cord is disconnected",
      "Occurred following a wall socket surge or nearby lightning strike"
    ],
    fix_steps: [
      {
        title: "Discharge power supply internal capacitors",
        detail: "Unplug the AC power cord from the back of the PSU. Switch the rocker to 'I', hold the case power button for 20 seconds, plug directly into an isolated wall socket (bypassing old surge strips), and test."
      },
      {
        title: "Disconnect all internal power cables except 24-pin and 8-pin EPS",
        detail: "Unplug PCIe power cables from the graphics card and all SATA power cables from hard drives and RGB hubs. If the PC now powers on, one of the disconnected accessories has an electrical dead short."
      },
      {
        title: "Inspect USB ports for bent metal pins touching ground",
        detail: "Examine every front and rear USB Type-A port with a flashlight. If a metal shield pin is bent inward and touching the center plastic tab, it grounds the 5V rail and trips instant PSU latch-off."
      },
      {
        title: "Test with known-good power supply unit",
        detail: "If the PSU continues clicking off under zero load, the internal primary capacitor or MOSFET has suffered an electrical breakdown and the power supply must be replaced under warranty."
      }
    ],
    related_error_codes: [29],
    source: "researched",
    verified: false
  },
  {
    slug: "usb-bios-flashback-black-screen-recovery",
    title: "Corrupted BIOS black screen recovery via USB Flashback",
    summary: "A failed BIOS update, interrupted flashing process, or incompatible firmware version has corrupted the motherboard SPI flash memory, leaving the computer unable to execute initial boot code.",
    severity: "critical",
    category_slug: "wont-boot",
    symptoms: [
      "Black screen with fans spinning indefinitely after flashing BIOS",
      "No display signal, no keyboard capslock LED response",
      "Motherboard debug LED stuck on CPU or BIOS code"
    ],
    fix_steps: [
      {
        title: "Format a USB flash drive as MBR FAT32",
        detail: "On a working computer, format a USB 2.0 or 3.0 flash drive (32GB or smaller) using FAT32 with Master Boot Record (MBR) partition scheme."
      },
      {
        title: "Download firmware and rename file with official renamer",
        detail: "Download the correct motherboard BIOS file from the official manufacturer support page. Run the included renamer tool (e.g. ASUS: 'creative.CAP', MSI: 'MSI.ROM', Gigabyte: 'GIGABYTE.bin') and copy the renamed file to the root of the USB drive."
      },
      {
        title: "Insert drive into designated BIOS Flashback USB port",
        detail: "Locate the specific rear I/O USB port bordered by a white or grey outline labeled 'BIOS Flashback' or 'Q-Flash Plus'. Insert the USB flash drive."
      },
      {
        title: "Hold Flashback button until LED starts blinking",
        detail: "With the PSU connected and switched on (PC powered off), hold the Flashback button for 3 seconds until the indicator LED starts flashing. Wait 5-8 minutes until the blinking stops completely before powering on."
      }
    ],
    related_error_codes: [12],
    source: "researched",
    verified: false
  },
  {
    slug: "tpm-clear-configuration-change-boot-prompt",
    title: "TPM configuration change prompt loop at startup",
    summary: "The motherboard firmware detects a new CPU or clear CMOS state, triggering a mandatory security confirmation screen to reset the Trusted Platform Module (fTPM / dTPM).",
    severity: "warn",
    category_slug: "wont-boot",
    symptoms: [
      "Screen displays 'A configuration change was requested to clear this computer TPM'",
      "Prompts 'Press Y to reset fTPM or Press N to keep previous records'",
      "Keyboard keystroke does not register or screen loops on every reboot"
    ],
    fix_steps: [
      {
        title: "Ensure BitLocker recovery key is saved before pressing Y",
        detail: "If Windows BitLocker drive encryption is enabled, clearing TPM will require entering your 48-digit BitLocker recovery key from your Microsoft Account (account.microsoft.com/devices/recoverykey)."
      },
      {
        title: "Connect a basic wired USB keyboard directly to rear I/O",
        detail: "Wireless, Bluetooth, or front-panel USB keyboards frequently fail to initialize at this pre-boot prompt. Plug a standard wired USB keyboard into a top rear USB 2.0 port."
      },
      {
        title: "Press Y to confirm fTPM reset",
        detail: "Press 'Y' (or 'Z' on German QWERTZ keyboards) to confirm the TPM reset. The motherboard will reboot automatically and initialize the new CPU security state."
      },
      {
        title: "Update BIOS to resolve AMD fTPM stutter fix",
        detail: "If TPM prompts continue appearing after every reboot, update the motherboard BIOS to AGESA 1.2.0.7 or newer to eliminate the known AMD fTPM NVRAM retention bug."
      }
    ],
    related_error_codes: [6],
    source: "researched",
    verified: false
  },
  {
    slug: "cpu-uneven-mounting-pressure-channel-loss",
    title: "Uneven CPU cooler mounting pressure causing memory channel loss",
    summary: "Overtightening or unevenly torquing CPU cooler screws bends the LGA socket substrate, causing pin contact loss on delicate DDR5/DDR4 memory controller traces and preventing POST.",
    severity: "critical",
    category_slug: "wont-boot",
    symptoms: [
      "PC boots with 1 RAM stick in slot B2, but fails to POST with 2 sticks in A2/B2",
      "Motherboard DRAM debug LED illuminates solid amber or red",
      "Occurs immediately after installing a new CPU cooler, AIO pump, or contact frame"
    ],
    fix_steps: [
      {
        title: "Loosen cooler screws by half a turn",
        detail: "Turn each cooler mount screw counterclockwise by half a turn in a cross pattern (top-left, bottom-right, top-right, bottom-left) to relieve asymmetric PCB flexing."
      },
      {
        title: "Remove cooler and inspect CPU socket pins",
        detail: "Remove the cooler, lift the socket retention lever, and inspect the motherboard LGA socket (Intel LGA 1700 or AMD AM5) with bright light for any bent or flattened gold pins."
      },
      {
        title: "Clean CPU contact pads with isopropyl alcohol",
        detail: "Wipe the gold pads on the underside of the processor with 99% isopropyl alcohol and a lint-free wipe to remove thermal paste residue or finger oils."
      },
      {
        title: "Reinstall cooler using alternating diagonal torque",
        detail: "Place the cooler flat on the IHS and turn each screw only 2 turns at a time in an X-pattern until hand-tight stops naturally without forcing."
      }
    ],
    related_error_codes: [8, 9],
    source: "researched",
    verified: false
  },
  {
    slug: "displayport-deep-sleep-no-signal-wake",
    title: "DisplayPort monitor deep sleep no signal on boot",
    summary: "Modern high-refresh gaming monitors fail to wake from DisplayPort deep sleep power states during PC boot, causing the graphics card to report a VGA error LED due to absent EDID handshake.",
    severity: "warn",
    category_slug: "wont-boot",
    symptoms: [
      "Motherboard white VGA debug LED stays on",
      "Monitor reports 'No DisplayPort Signal' and enters sleep mode",
      "Signal appears immediately if cable is unplugged and plugged back in"
    ],
    fix_steps: [
      {
        title: "Disable Deep Sleep in monitor On-Screen Display (OSD)",
        detail: "Press the physical menu joystick on the back of your monitor, open System or Setup settings, locate 'DisplayPort Deep Sleep' or 'Auto Input Sensing', and toggle it to Disabled / Off."
      },
      {
        title: "Turn monitor on 5 seconds before powering on PC",
        detail: "Turn on the monitor so its internal scaler is active and broadcasting EDID timing information before the graphics card initializes PCIe video output."
      },
      {
        title: "Install NVIDIA DisplayPort 1.4 / 1.3 Firmware Update",
        detail: "If using a GeForce GTX 900, 1000, or RTX 2000 series GPU, download the official 'NVIDIA Graphics Firmware Update Tool for DisplayPort 1.3 and 1.4 Displays' to fix UEFI blank screen handshakes."
      },
      {
        title: "Replace budget cable with VESA-Certified DP 1.4 cable",
        detail: "Non-certified DisplayPort cables frequently have Pin 20 connected, sending back-power into the GPU 3.3V rail. Swap with a VESA-certified cable with Pin 20 disconnected."
      }
    ],
    related_error_codes: [28],
    source: "researched",
    verified: false
  }
];

const NEW_BLUE_SCREEN = [
  {
    slug: "bsod-dxgkrnl-fatal-error",
    title: "BSOD: DXGKRNL_FATAL_ERROR (0x00000113)",
    summary: "The DirectX Graphics Kernel subsystem detects a fatal violation, typically triggered by an unstable GPU memory overclock, corrupt display driver, or failing PCIe power delivery.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Blue screen displaying stop code: DXGKRNL_FATAL_ERROR",
      "Screen freezes or turns black for 3 seconds before blue screen",
      "Occurs while playing 3D DirectX 12 games or rendering in Premiere"
    ],
    fix_steps: [
      {
        title: "Clean reinstall GPU driver with Display Driver Uninstaller (DDU)",
        detail: "Download DDU and the latest driver package from NVIDIA or AMD. Boot Windows into Safe Mode, run DDU to completely strip graphics drivers, restart, and perform a clean install."
      },
      {
        title: "Disable GPU VRAM and Core Overclock in MSI Afterburner",
        detail: "Open MSI Afterburner or AMD Adrenalin. Reset Core Clock and Memory Clock offsets to factory +0 MHz and disable any custom undervolting profiles."
      },
      {
        title: "Verify PCIe power cables are dedicated (not daisy-chained)",
        detail: "Ensure each 8-pin PCIe power connector on your graphics card runs a separate, dedicated cable directly from the power supply unit rather than sharing a pigtail splitter."
      },
      {
        title: "Run DirectX End-User Runtime installer",
        detail: "Download and run the Microsoft DirectX End-User Runtime installer to repair missing or corrupted legacy DirectX binaries in C:\\Windows\\System32."
      }
    ],
    related_error_codes: [13],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-video-scheduler-internal-error",
    title: "BSOD: VIDEO_SCHEDULER_INTERNAL_ERROR (0x00000119)",
    summary: "The Windows GPU video scheduler detects that a display driver timed out while executing a graphics command and could not be recovered via Timeout Detection and Recovery (TDR).",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code 0x00000119: VIDEO_SCHEDULER_INTERNAL_ERROR",
      "Frequent display driver crashes when watching YouTube or hardware-accelerated video",
      "Audio loops in a buzzing sound right before the crash"
    ],
    fix_steps: [
      {
        title: "Turn off Hardware Accelerated GPU Scheduling (HAGS)",
        detail: "Go to Windows Settings > System > Display > Graphics > Change default graphics settings. Toggle 'Hardware-accelerated GPU scheduling' to Off and reboot your PC."
      },
      {
        title: "Disable browser hardware acceleration as a test",
        detail: "In Chrome, Edge, or Discord, open Settings > System and turn off 'Use graphics acceleration when available'. If crashes halt, the graphics driver video decode engine is unstable."
      },
      {
        title: "Roll back to previous WHQL Studio or Game Ready driver",
        detail: "Open Device Manager > Display adapters > Right-click your GPU > Properties > Driver tab > Click 'Roll Back Driver' if the issue began immediately after a recent driver update."
      },
      {
        title: "Repair corrupted Windows system files with SFC and DISM",
        detail: "Open Terminal as Administrator and execute: DISM /Online /Cleanup-Image /RestoreHealth followed by sfc /scannow to fix damaged graphics subsystem components."
      }
    ],
    related_error_codes: [13, 29],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-pfn-list-corrupt",
    title: "BSOD: PFN_LIST_CORRUPT (0x0000004E)",
    summary: "The Page Frame Number (PFN) list, an internal operating system structure used to map physical memory addresses, became corrupted due to faulty RAM chips or disk I/O driver errors.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code: PFN_LIST_CORRUPT (0x0000004E)",
      "Crash occurs randomly during web browsing, file copying, or gaming",
      "Chkdsk finds indexing discrepancies on the system drive"
    ],
    fix_steps: [
      {
        title: "Run Windows Memory Diagnostic tool",
        detail: "Press Win + R, type 'mdsched.exe', and select 'Restart now and check for problems'. Allow the standard test pass to complete; if any hardware errors are found, RAM is defective."
      },
      {
        title: "Test memory sticks individually in slot A2",
        detail: "Power off the PC. Remove all RAM modules except one in the primary slot (usually A2). Test each stick one at a time to identify the specific failing physical module."
      },
      {
        title: "Disable aggressive RAM XMP / EXPO / DOCP profile",
        detail: "Reboot into BIOS and disable memory overclocking, letting RAM operate at base JEDEC speed (e.g. 4800 MHz DDR5 or 2133/2400 MHz DDR4) to test controller stability."
      },
      {
        title: "Run CHKDSK to repair bad filesystem sectors",
        detail: "Open Command Prompt as Admin and execute: chkdsk C: /f /r. Type Y to schedule at next boot, restart the PC, and allow Windows to relocate data away from damaged storage clusters."
      }
    ],
    related_error_codes: [8, 9],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-bad-object-header",
    title: "BSOD: BAD_OBJECT_HEADER (0x00000189)",
    summary: "The Windows kernel executive found that an internal object header was corrupted, almost always caused by a misbehaved third-party driver overwriting kernel memory pools.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code 0x00000189: BAD_OBJECT_HEADER",
      "Bugcheck occurs during shutdown, sleep, or wake transition",
      "Minidump points to ntoskrnl.exe or a third-party .sys driver"
    ],
    fix_steps: [
      {
        title: "Analyze minidump with BlueScreenView or WinDbg",
        detail: "Download free BlueScreenView or Microsoft WinDbg from Microsoft Store. Open the crash dump in C:\\Windows\\Minidump to identify the exact third-party driver filename (e.g. AsIO.sys, CorsairVBus.sys)."
      },
      {
        title: "Uninstall conflicting RGB, tuning, or anti-virus utilities",
        detail: "Software like ASUS Armoury Crate, Corsair iCUE, Razer Synapse, or third-party firewalls install deep kernel drivers that frequently corrupt object memory. Uninstall them to test stability."
      },
      {
        title: "Update all motherboard chipset and serial IO drivers",
        detail: "Download the latest AMD Chipset Drivers or Intel Management Engine (ME) and Serial IO drivers from your motherboard support page."
      },
      {
        title: "Run Driver Verifier to isolate the offending driver",
        detail: "Press Win + R, type 'verifier', choose 'Create standard settings' > 'Select driver names from a list', check all non-Microsoft drivers, reboot, and observe which driver triggers an immediate pinpoint BSOD."
      }
    ],
    related_error_codes: [9, 14],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-kernel-mode-heap-corruption",
    title: "BSOD: KERNEL_MODE_HEAP_CORRUPTION (0x0000013A)",
    summary: "A kernel-mode driver corrupted the operating system kernel heap memory manager, commonly triggered by kernel-level gaming anti-cheat engines or outdated network filter drivers.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code 0x0000013A: KERNEL_MODE_HEAP_CORRUPTION",
      "Crash happens upon launching Valorant (Vanguard), Fortnite (Easy Anti-Cheat), or Call of Duty (Ricochet)",
      "Minidump blames vgk.sys, easyanticheat.sys, or e1d.sys"
    ],
    fix_steps: [
      {
        title: "Reinstall game anti-cheat service",
        detail: "Uninstall the game anti-cheat from Control Panel (e.g. Riot Vanguard or EasyAntiCheat). Launch the game launcher as Administrator to trigger a fresh, clean anti-cheat installation."
      },
      {
        title: "Update Wi-Fi and Ethernet network adapter drivers",
        detail: "Packet filtering drivers installed by network cards (like Intel Killer Suite or Realtek Dragon) frequently corrupt kernel memory. Download pure bare-metal INF drivers and uninstall the bloatware control center."
      },
      {
        title: "Enable Core Isolation / Memory Integrity in Windows Security",
        detail: "Open Windows Security > Device Security > Core isolation details > Turn on 'Memory Integrity' (HVCI). This forces Windows to isolate kernel processes and block insecure drivers."
      },
      {
        title: "Repair corrupt Windows system files with DISM",
        detail: "Run: DISM /Online /Cleanup-Image /RestoreHealth in PowerShell as Administrator to replace corrupted kernel memory libraries."
      }
    ],
    related_error_codes: [8, 9],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-hypervisor-error",
    title: "BSOD: HYPERVISOR_ERROR (0x00020001)",
    summary: "The Windows Hyper-V hypervisor encountered an unrecoverable exception, typically caused by conflicting third-party virtualization software (VirtualBox, VMware) or unstable CPU voltage.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code: HYPERVISOR_ERROR (0x00020001)",
      "Occurs when launching WSL2, Windows Sandbox, or Docker Desktop",
      "System hangs or reboots during virtualization workloads"
    ],
    fix_steps: [
      {
        title: "Verify CPU Virtualization (SVM / Intel VT-x) is enabled in BIOS",
        detail: "Enter BIOS setup, open Advanced CPU Configuration, and confirm that 'Intel Virtualization Technology' (VT-x) or AMD 'SVM Mode' is set to Enabled."
      },
      {
        title: "Disable conflicting third-party virtualization hypervisors",
        detail: "If VMware Workstation or Oracle VirtualBox is installed, update them to versions that support the Windows Hypervisor Platform (WHPX) API, or uninstall them temporarily."
      },
      {
        title: "Update WSL2 Linux kernel package",
        detail: "Open Command Prompt as Administrator and run: wsl --update followed by wsl --shutdown to refresh the Hyper-V microcode container."
      },
      {
        title: "Reset CPU curve optimizer / undervolt settings",
        detail: "Aggressive negative CPU Curve Optimizer (PBO) offsets frequently pass standard stress tests but fail under the nested virtualization context switching of Hyper-V. Reset offset to 0."
      }
    ],
    related_error_codes: [13],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-driver-verifier-detected-violation",
    title: "BSOD: DRIVER_VERIFIER_DETECTED_VIOLATION (0x000000C4)",
    summary: "Windows Driver Verifier caught an active device driver performing an illegal operation, such as accessing paged memory at elevated IRQL or freeing already-released memory.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code: DRIVER_VERIFIER_DETECTED_VIOLATION (0x000000C4)",
      "Names the failing driver file directly on the blue screen (e.g., driver.sys)",
      "PC gets stuck in a blue screen boot loop until Safe Mode is accessed"
    ],
    fix_steps: [
      {
        title: "Boot into Safe Mode and turn off Driver Verifier",
        detail: "When Windows fails to boot twice, enter the Automatic Repair screen > Troubleshoot > Advanced Options > Startup Settings > Restart > Press 4 for Safe Mode. Open Command Prompt as Admin and execute: verifier /reset."
      },
      {
        title: "Identify the driver filename shown on the crash screen",
        detail: "Note the .sys file referenced on the blue screen (or inspect C:\\Windows\\MEMORY.DMP with BlueScreenView). Search the filename online to identify the associated hardware or software."
      },
      {
        title: "Update or uninstall the identified software or driver",
        detail: "In Safe Mode, open Device Manager or Control Panel and update the hardware driver or uninstall the utility responsible for the flagged .sys file."
      },
      {
        title: "Restart PC in normal mode",
        detail: "Reboot the PC normally. Verifier is now disabled, and the offending driver is either updated or removed."
      }
    ],
    related_error_codes: [9, 14],
    source: "researched",
    verified: false
  },
  {
    slug: "bsod-system-pte-misuse",
    title: "BSOD: SYSTEM_PTE_MISUSE (0x000000DA)",
    summary: "A driver attempted an illegal operation against Page Table Entries (PTEs) or conflicting memory protection flags, often triggered by outdated security software or firmware bugs.",
    severity: "critical",
    category_slug: "blue-screen",
    symptoms: [
      "Stop code 0x000000DA: SYSTEM_PTE_MISUSE",
      "Occurs during high memory pressure or intensive data streaming",
      "System logs event ID 1001 in Windows Event Viewer"
    ],
    fix_steps: [
      {
        title: "Update motherboard BIOS firmware",
        detail: "System PTE tracking is heavily tied to motherboard ACPI tables and memory mapping registers. Download and flash the latest UEFI release from the manufacturer."
      },
      {
        title: "Check for incompatible third-party antivirus filters",
        detail: "Uninstall legacy antivirus or security tools (such as older Avast, AVG, or McAfee suites) using their official cleanup removal utilities."
      },
      {
        title: "Verify Windows system files with System File Checker",
        detail: "Run: sfc /scannow in an elevated Command Prompt to restore damaged memory management system binaries."
      },
      {
        title: "Reset Windows Virtual Memory paging file configuration",
        detail: "Open SystemPropertiesPerformance.exe > Advanced tab > Virtual Memory Change > Check 'Automatically manage paging file size for all drives' > Click OK and restart."
      }
    ],
    related_error_codes: [8, 9],
    source: "researched",
    verified: false
  }
];

const NEW_RUNNING_SLOW = [
  {
    slug: "tiworker-trustedinstaller-high-cpu",
    title: "TiWorker.exe (Windows Modules Installer) causing 100% CPU usage",
    summary: "The Windows Update background servicing engine (TiWorker.exe and TrustedInstaller.exe) gets stuck in an infinite scan or compilation loop while processing update components.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "Task Manager shows Windows Modules Installer Worker using 70-100% CPU",
      "Fans spin up loudly while the computer is idle",
      "Windows Update history shows pending or failed update installations"
    ],
    fix_steps: [
      {
        title: "Run the Windows Update Troubleshooter",
        detail: "Go to Settings > System > Troubleshoot > Other troubleshooters > Click 'Run' next to Windows Update to reset corrupted background service states."
      },
      {
        title: "Clear SoftwareDistribution download cache",
        detail: "Open Command Prompt as Admin and run: net stop wuauserv && net stop cryptSvc && net stop bits. Delete all files inside C:\\Windows\\SoftwareDistribution\\Download, then run: net start wuauserv."
      },
      {
        title: "Run DISM Component Store cleanup",
        detail: "Execute in Admin Command Prompt: DISM.exe /Online /Cleanup-image /StartComponentCleanup to prune superseding update packages that cause TiWorker to loop."
      },
      {
        title: "Install pending Windows cumulative updates manually",
        detail: "Check Windows Update and let pending updates finish installing. Once all updates and reboots complete, TiWorker automatically drops back to 0% CPU."
      }
    ],
    related_error_codes: [8, 14],
    source: "researched",
    verified: false
  },
  {
    slug: "sysmain-superfetch-high-disk-usage",
    title: "SysMain (Superfetch) causing constant 100% disk usage on HDD / SATA SSD",
    summary: "The Windows SysMain caching service continuously pre-reads application data into memory, overwhelming the I/O queue on mechanical hard drives and budget SATA SSDs.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "Task Manager reports Disk Usage pinned at 100% with response times over 1000ms",
      "PC takes 5-10 minutes to become usable after logging into Windows",
      "Service 'SysMain' or 'Service Host: SysMain' is the top disk consumer"
    ],
    fix_steps: [
      {
        title: "Disable SysMain service via Services console",
        detail: "Press Win + R, type 'services.msc', scroll down to find 'SysMain', right-click and choose Properties, set Startup type to 'Disabled', click 'Stop', and click OK."
      },
      {
        title: "Disable SysMain using Command Prompt",
        detail: "Open Command Prompt as Administrator and run: sc stop SysMain followed by sc config SysMain start=disabled to immediately halt the disk thrashing."
      },
      {
        title: "Check drive health with CrystalDiskInfo",
        detail: "Download free CrystalDiskInfo to verify the disk SMART health status. Excessive 100% disk usage frequently masks failing sectors or reallocated sector counts."
      },
      {
        title: "Upgrade Windows boot drive to an NVMe SSD",
        detail: "Windows 10 and 11 are heavily engineered for solid-state storage. Cloning your boot installation from a mechanical HDD to a budget NVMe SSD eliminates I/O bottlenecks permanently."
      }
    ],
    related_error_codes: [21, 23],
    source: "researched",
    verified: false
  },
  {
    slug: "com-surrogate-dllhost-ram-leak",
    title: "COM Surrogate (dllhost.exe) memory leak and high CPU during video browsing",
    summary: "The Windows COM Surrogate process crashes or leaks gigabytes of RAM when attempting to generate thumbnails for corrupt video files, MKV codecs, or damaged image directories.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "dllhost.exe accumulates several gigabytes of RAM in Task Manager",
      "File Explorer freezes when opening the Downloads or Videos folder",
      "Video thumbnails show blank white icons or freeze the green loading bar"
    ],
    fix_steps: [
      {
        title: "Clear and rebuild the Windows thumbnail cache",
        detail: "Press Win + R, type 'cleanmgr', select drive C:, check only 'Thumbnails', and click OK to purge the corrupted thumbnail database."
      },
      {
        title: "Update or install the K-Lite Codec Pack",
        detail: "Corrupted MKV or MP4 thumbnail handlers leak memory in dllhost.exe. Installing the standard K-Lite Codec Pack or Icaros Thumbnailer replaces faulty shell extension decoders."
      },
      {
        title: "Toggle File Explorer to show icons instead of thumbnails",
        detail: "In File Explorer, click the 3 dots (...) > Options > View tab > Check 'Always show icons, never thumbnails' > Click Apply to isolate thumbnail extraction as the root cause."
      },
      {
        title: "Scan storage for corrupt media files",
        detail: "Locate newly downloaded video files in the affected directory and move them to an isolated folder to determine which specific corrupt file triggers the COM Surrogate crash."
      }
    ],
    related_error_codes: [8, 14],
    source: "researched",
    verified: false
  },
  {
    slug: "prochot-vrm-throttling-0-79ghz",
    title: "CPU locked at 0.79 GHz from motherboard VRM PROCHOT throttling",
    summary: "A malfunctioning motherboard temperature sensor or overheating voltage regulator module (VRM) signals an artificial BD PROCHOT alarm, forcing the processor multiplier down to 8x (0.79 GHz).",
    severity: "critical",
    category_slug: "running-slow",
    symptoms: [
      "Task Manager shows CPU Speed permanently pinned at 0.79 GHz or 0.39 GHz",
      "Computer feels excruciatingly sluggish even when completely idle",
      "CPU temperature in HWInfo is low (35C) but processor will not clock up under load"
    ],
    fix_steps: [
      {
        title: "Inspect motherboard VRM temperatures in HWInfo64",
        detail: "Download HWInfo64 (Sensors mode) and check 'Motherboard / VRM' temperatures. If VRM exceeds 105C, improve chassis intake airflow across the CPU socket area."
      },
      {
        title: "Perform a full power drain to reset sensor latch",
        detail: "Shut down the PC, disconnect AC power, and hold the power button for 30 seconds. On laptops, disconnect the main battery and hold power for 30 seconds to clear stuck EC sensor flags."
      },
      {
        title: "Disable BD PROCHOT with ThrottleStop (diagnostic verification)",
        detail: "Download ThrottleStop, uncheck 'BD PROCHOT' (Bi-Directional Processor Hot), and click 'Save'. If CPU frequency immediately shoots back up to 4.0+ GHz, a faulty motherboard sensor is triggering false alarms."
      },
      {
        title: "Update motherboard BIOS or RMA defective motherboard",
        detail: "Flash the newest motherboard BIOS to patch EC sensor bugs. If throttling persists on a desktop with normal temperatures, the motherboard VRM sensor has suffered hardware failure."
      }
    ],
    related_error_codes: [29],
    source: "researched",
    verified: false
  },
  {
    slug: "file-explorer-slow-loading-green-bar",
    title: "File Explorer extremely slow with 'Working on it' green loading bar",
    summary: "Windows File Explorer hangs for 15 to 45 seconds when opening directories due to disconnected network mapped drives, a bloated Quick Access cache, or corrupted shell extensions.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "Green progress address bar crawls across the top of File Explorer window",
      "'Working on it...' message displayed for 20-30 seconds",
      "Right-clicking any file causes the cursor to spin indefinitely"
    ],
    fix_steps: [
      {
        title: "Clear File Explorer Quick Access history",
        detail: "Open File Explorer, click the 3 dots (...) > Options > In the General tab under Privacy, click 'Clear' next to Clear File Explorer history."
      },
      {
        title: "Change 'Open File Explorer to' This PC instead of Home",
        detail: "In the same Folder Options General tab, change the top dropdown 'Open File Explorer to:' from 'Home' to 'This PC', then click Apply."
      },
      {
        title: "Disconnect offline or inaccessible network mapped drives",
        detail: "Open This PC. If any network drives (Z:, Y:) display a red X because the remote NAS or server is turned off, right-click and select 'Disconnect'."
      },
      {
        title: "Disable third-party context menu shell extensions with ShellExView",
        detail: "Download NirSoft ShellExView, filter by non-Microsoft extensions, and disable newly installed context menu handlers (WinRAR, 7-Zip, cloud storage hooks) that stall right-clicks."
      }
    ],
    related_error_codes: [37, 53],
    source: "researched",
    verified: false
  },
  {
    slug: "onedrive-sync-constant-cpu-disk-lockup",
    title: "OneDrive continuous file scanning and background CPU / disk lockup",
    summary: "Microsoft OneDrive encounters a sync conflict or permission loop across thousands of small files (like node_modules or game saves), keeping CPU and disk usage elevated at 50-80%.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "OneDrive.exe constantly uses 20-40% CPU in Task Manager",
      "Taskbar OneDrive cloud icon shows 'Processing changes' indefinitely",
      "Files in Documents or Desktop display permanent blue sync arrows"
    ],
    fix_steps: [
      {
        title: "Reset the Microsoft OneDrive sync client",
        detail: "Press Win + R and enter: %localappdata%\\Microsoft\\OneDrive\\onedrive.exe /reset. Wait 2 minutes for the icon to reappear (or manually restart OneDrive from the Start Menu)."
      },
      {
        title: "Pause syncing and verify system responsiveness",
        detail: "Click the OneDrive icon in the system tray > Settings gear > 'Pause syncing' > Select '2 hours'. If CPU and disk usage immediately normalize, a specific sync folder is looping."
      },
      {
        title: "Exclude developer folders and node_modules from backup",
        detail: "Move coding workspaces, virtual machine disks, and Git repositories outside of OneDrive-synced folders (e.g. store them in C:\\Dev\\ rather than C:\\Users\\Name\\Documents\\)."
      },
      {
        title: "Unlink and re-link your Microsoft Account",
        detail: "Open OneDrive Settings > Account tab > Click 'Unlink this PC'. Restart your computer and sign back in, choosing your existing OneDrive folder location."
      }
    ],
    related_error_codes: [5, 30],
    source: "researched",
    verified: false
  },
  {
    slug: "antivirus-defender-msmpeng-high-cpu",
    title: "Windows Defender (MsMpEng.exe) high CPU usage scanning large folders",
    summary: "The Antimalware Service Executable continuously scans developer source code, virtual machine disks, or its own installation directory, consuming significant processor capacity.",
    severity: "warn",
    category_slug: "running-slow",
    symptoms: [
      "Task Manager shows 'Antimalware Service Executable' using 15-50% CPU constantly",
      "Code compiling (npm install, cargo build, Visual Studio) takes 3x longer than expected",
      "System becomes unresponsive during file downloads or extractions"
    ],
    fix_steps: [
      {
        title: "Add process exclusion for MsMpEng.exe",
        detail: "Open Windows Security > Virus & threat protection > Manage settings > Scroll to Exclusions > Add an exclusion > Select 'Process' > Type: MsMpEng.exe > Click Add."
      },
      {
        title: "Exclude developer project folders from real-time scanning",
        detail: "Under the same Exclusions menu, select 'Folder' and add your main coding directories (such as C:\\Users\\Name\\Desktop\\projects or C:\\src\\)."
      },
      {
        title: "Adjust Windows Defender Scheduled Scan task triggers",
        detail: "Open Task Scheduler > Navigate to Microsoft > Windows > Windows Defender > Right-click 'Windows Defender Scheduled Scan' > Properties > Conditions tab > Check 'Start the task only if the computer is idle'."
      },
      {
        title: "Run an offline scan to check for active threats",
        detail: "In Windows Security, click 'Scan options' > select 'Microsoft Defender Antivirus (offline scan)' > click 'Scan now'. The PC will reboot into a clean offline environment to remove deeply hidden malware."
      }
    ],
    related_error_codes: [6, 30],
    source: "researched",
    verified: false
  },
  {
    slug: "out-of-virtual-memory-pagefile-exhaustion",
    title: "Out of Virtual Memory warning despite free physical RAM available",
    summary: "Windows exhausts commit charge because the virtual memory paging file (pagefile.sys) is manually disabled, set too small, or residing on a storage drive with zero free space.",
    severity: "critical",
    category_slug: "running-slow",
    symptoms: [
      "Dialog box: 'Your computer is low on memory. Save your files and close these programs'",
      "Games crash abruptly to desktop without any error message or crash log",
      "Task Manager shows 'Committed' memory at 100% while 'In use' physical RAM is only 60%"
    ],
    fix_steps: [
      {
        title: "Enable 'Automatically manage paging file size' in Windows",
        detail: "Press Win + R, type 'sysdm.cpl', go to Advanced tab > Performance 'Settings' > Advanced tab > Virtual memory 'Change' > Check 'Automatically manage paging file size for all drives' > Click OK and reboot."
      },
      {
        title: "Free up at least 20GB of disk space on drive C:",
        detail: "The Windows paging file dynamically expands when heavy applications launch. If drive C: has less than 5GB free, the pagefile cannot grow, causing instant out-of-memory crashes."
      },
      {
        title: "Set custom initial and maximum paging file limits",
        detail: "If setting custom sizes manually on an NVMe SSD, configure 'Initial size' to 8192 MB (8GB) and 'Maximum size' to 24576 MB (24GB) to avoid commit limit truncation."
      },
      {
        title: "Identify memory-leaking background processes",
        detail: "Open Task Manager, go to Details tab, right-click column headers, click 'Select columns', check 'Commit size', and sort descending to identify programs consuming abnormal virtual allocation."
      }
    ],
    related_error_codes: [8, 35],
    source: "researched",
    verified: false
  }
];

const NEW_NO_INTERNET = [
  {
    slug: "default-gateway-not-available",
    title: "The default gateway is not available (yellow exclamation mark)",
    summary: "The network adapter loses route connectivity to the local router or access point, causing Windows network diagnostics to continually reset the gateway adapter.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Windows Troubleshooter reports: 'The default gateway is not available - Fixed', but it breaks again 10 minutes later",
      "Yellow warning triangle on taskbar network icon",
      "Cannot access local router web interface at 192.168.1.1 or 192.168.0.1"
    ],
    fix_steps: [
      {
        title: "Disable network adapter power management sleep",
        detail: "Open Device Manager > Network adapters > Right-click your Wi-Fi or Ethernet adapter > Properties > Power Management tab > Uncheck 'Allow the computer to turn off this device to save power' > Click OK."
      },
      {
        title: "Assign a static Default Gateway and IP address",
        detail: "Open ncpa.cpl > Right-click network adapter > Properties > Double-click Internet Protocol Version 4 (TCP/IPv4) > Set manual IP: 192.168.1.150, Subnet: 255.255.255.0, Gateway: 192.168.1.1, DNS: 1.1.1.1."
      },
      {
        title: "Perform full network stack reset in CMD",
        detail: "Run in Administrator Command Prompt: netsh int ip reset && netsh winsock reset && ipconfig /flushdns, then restart the computer."
      },
      {
        title: "Update router firmware and check for IP lease exhaustion",
        detail: "Log in to your router admin panel. Increase the DHCP IP pool range or update the router firmware to resolve ARP table dropouts."
      }
    ],
    related_error_codes: [37, 51],
    source: "researched",
    verified: false
  },
  {
    slug: "wifi-6e-6ghz-band-missing-intel",
    title: "Wi-Fi 6E / 7 (6 GHz band) SSID not showing in Windows 11",
    summary: "Intel AX210/AX211 or Qualcomm Wi-Fi 6E adapters fail to broadcast or detect 6 GHz SSIDs due to outdated drivers, regional regulatory domain locks, or WPA3 requirement mismatches.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Router broadcasts 2.4 GHz, 5 GHz, and 6 GHz, but 6 GHz network is completely invisible in Windows",
      "Smartphones connect to the 6 GHz Wi-Fi 6E network without issues in the same room",
      "Wi-Fi adapter is verified as Wi-Fi 6E capable in Device Manager"
    ],
    fix_steps: [
      {
        title: "Update to the latest Intel PROSet / Wireless Wi-Fi driver",
        detail: "Download the latest Wi-Fi driver directly from Intel Driver & Support Assistant. Driver versions older than 22.190 frequently disable 6 GHz discovery in Windows 11."
      },
      {
        title: "Ensure router security is set strictly to WPA3-Personal",
        detail: "The Wi-Fi 6E specification requires WPA3 encryption. In router wireless settings, change the 6 GHz security mode from 'WPA2/WPA3 Mixed' to pure 'WPA3-Personal (AES)'."
      },
      {
        title: "Enable 802.11ax / WiFi 6E Mode in Device Manager",
        detail: "Open Device Manager > Network adapters > Intel Wi-Fi 6E adapter > Properties > Advanced tab > Ensure '802.11ax / 6GHz Band' is set to Enabled."
      },
      {
        title: "Upgrade Windows 10 to Windows 11",
        detail: "Microsoft and Intel restrict native 6 GHz Wi-Fi 6E and Wi-Fi 7 band access to Windows 11 Build 22000 and newer. Windows 10 lacks official 6 GHz regulatory support."
      }
    ],
    related_error_codes: [13, 28],
    source: "researched",
    verified: false
  },
  {
    slug: "ethernet-drops-intel-i225v-i226v",
    title: "Intel I225-V and I226-V Ethernet micro-drops connection while gaming",
    summary: "The 2.5 GbE Intel I225-V and I226-V onboard Ethernet controllers suffer from hardware packet buffer drops when Energy Efficient Ethernet (EEE) powers down the PHY transceiver.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Ethernet connection drops for 2-3 seconds and reconnects during multiplayer games or Discord calls",
      "Event Viewer shows e2fnexpress Event ID 27: 'Intel Ethernet Controller network link is disconnected'",
      "Affects Intel Z690, Z790, and B650 / X670 motherboards with 2.5G ports"
    ],
    fix_steps: [
      {
        title: "Disable Energy Efficient Ethernet (EEE) in adapter settings",
        detail: "Open Device Manager > Network adapters > Intel Ethernet Controller > Properties > Advanced tab > Scroll to 'Energy Efficient Ethernet' and set to Disabled."
      },
      {
        title: "Disable Ultra Low Power Mode and Green Ethernet",
        detail: "In the same Advanced tab, set 'Ultra Low Power Mode' to Disabled, and set 'Green Ethernet' to Disabled."
      },
      {
        title: "Force Link Speed to 1.0 Gbps Full Duplex",
        detail: "If connecting to a 1 Gbps Gigabit home router, change 'Speed & Duplex' from 'Auto Negotiation' to '1.0 Gbps Full Duplex' to prevent continuous negotiation renegotiation."
      },
      {
        title: "Install Intel NVM Firmware Update from motherboard support",
        detail: "Visit your motherboard support page and download the 'Intel I225/I226 NVM Firmware Update tool' to flash the onboard network controller microcode."
      }
    ],
    related_error_codes: [29, 37],
    source: "researched",
    verified: false
  },
  {
    slug: "wifi-invalid-ip-configuration-169-254",
    title: "Wi-Fi does not have a valid IP configuration (169.254.x.x APIPA)",
    summary: "The computer connects to the wireless router radio but fails to receive a DHCP IP address lease, defaulting to an unroutable 169.254.x.x Automatic Private IP Addressing (APIPA) address.",
    severity: "critical",
    category_slug: "no-internet",
    symptoms: [
      "Windows network troubleshooter reports 'Wi-Fi does not have a valid IP configuration'",
      "Running ipconfig shows IPv4 Address: 169.254.x.x and empty Default Gateway",
      "Wi-Fi status reports 'No Internet, secured'"
    ],
    fix_steps: [
      {
        title: "Release and renew IP address lease in Command Prompt",
        detail: "Open Command Prompt as Administrator and execute: ipconfig /release followed by ipconfig /renew. If it reports 'unable to contact DHCP server', proceed to reset services."
      },
      {
        title: "Restart the DHCP Client service",
        detail: "Press Win + R, type 'services.msc', find 'DHCP Client', confirm its status is 'Running', and ensure its Startup Type is set to Automatic."
      },
      {
        title: "Reboot home router to clear full DHCP table",
        detail: "Unplug your internet modem and Wi-Fi router from the wall outlet for 30 seconds, plug them back in, and wait 2 minutes for the router DHCP pool to reinitialize."
      },
      {
        title: "Forget and reconnect to the Wi-Fi network",
        detail: "Go to Settings > Network & internet > Wi-Fi > Manage known networks > Click 'Forget' next to your network name > Reconnect and enter the Wi-Fi password freshly."
      }
    ],
    related_error_codes: [37, 51],
    source: "researched",
    verified: false
  },
  {
    slug: "slow-wifi-bluetooth-coexistence-interference",
    title: "2.4 GHz Wi-Fi speed drops drastically when Bluetooth is turned on",
    summary: "The single Wi-Fi/Bluetooth combo card shares one internal antenna, causing packet collisions between Bluetooth audio/peripherals and 2.4 GHz Wi-Fi bands.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Wi-Fi speed drops from 50 Mbps down to 2 Mbps whenever Bluetooth headphones or mouse are connected",
      "Audio cuts out or crackles when downloading files over Wi-Fi",
      "Turning off Bluetooth in Windows settings immediately restores normal Wi-Fi speeds"
    ],
    fix_steps: [
      {
        title: "Connect to your router 5 GHz or 6 GHz Wi-Fi band",
        detail: "Open Wi-Fi settings and connect to your router 5 GHz network (often named NetworkName_5G). 5 GHz is completely immune to 2.4 GHz Bluetooth radio interference."
      },
      {
        title: "Enable Bluetooth AMP / Coexistence in Advanced adapter settings",
        detail: "Open Device Manager > Network adapters > Right-click Wi-Fi card > Properties > Advanced > Set 'Bluetooth AMP' or 'Coexistence Support' to Enabled."
      },
      {
        title: "Change 2.4 GHz channel width in router settings to 20 MHz",
        detail: "Log in to your router settings, navigate to 2.4 GHz wireless, and change Channel Bandwidth from '40 MHz' to '20 MHz' to reduce spectral overlap with Bluetooth frequency hopping."
      },
      {
        title: "Screw in external motherboard magnetic shark-fin antenna",
        detail: "If using a desktop PC, ensure the dual-wire antenna included with the motherboard is screwed securely into the rear golden coaxial RP-SMA connectors."
      }
    ],
    related_error_codes: [28],
    source: "researched",
    verified: false
  },
  {
    slug: "network-profile-stuck-public-printer-sharing",
    title: "Network profile stuck on Public blocking network printer and file sharing",
    summary: "Windows sets the network profile type to Public by default, activating strict Windows Defender Firewall rules that block local printer discovery, SMB shares, and ping requests.",
    severity: "info",
    category_slug: "no-internet",
    symptoms: [
      "Network printer shows 'Offline' even though other devices can print",
      "Cannot access shared folders (\\\\PCNAME) across the home network",
      "Network profile toggle missing or greyed out in Windows Settings"
    ],
    fix_steps: [
      {
        title: "Change network profile to Private in Windows Settings",
        detail: "Go to Settings > Network & internet > Click 'Wi-Fi' or 'Ethernet' > Click your connected network name > Under Network profile type, select 'Private network'."
      },
      {
        title: "Change profile to Private using PowerShell",
        detail: "Open PowerShell as Administrator and run: Get-NetConnectionProfile. Note the InterfaceAlias name and execute: Set-NetConnectionProfile -Name 'YourNetworkName' -NetworkCategory Private."
      },
      {
        title: "Enable Network Discovery and File Sharing",
        detail: "Go to Settings > Network & internet > Advanced network settings > Advanced sharing settings > Under Private networks, toggle 'Network discovery' and 'File and printer sharing' to ON."
      },
      {
        title: "Restart Function Discovery services in services.msc",
        detail: "Open services.msc and set 'Function Discovery Provider Host' and 'Function Discovery Resource Publication' Startup Types to Automatic and start both."
      }
    ],
    related_error_codes: [6, 37],
    source: "researched",
    verified: false
  },
  {
    slug: "captive-portal-hotel-wifi-login-not-opening",
    title: "Captive portal hotel / airport Wi-Fi login splash page not loading",
    summary: "The browser fails to open the hotel, café, or airport authentication redirect page because third-party DNS-over-HTTPS (DoH), VPNs, or HSTS security headers block cleartext HTTP interception.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Connected to public Wi-Fi with 'No internet, open' status",
      "Opening browser shows 'DNS_PROBE_FINISHED_NO_INTERNET' instead of hotel login page",
      "Network prompt 'Action needed' fails to load login screen"
    ],
    fix_steps: [
      {
        title: "Navigate to cleartext neverssl.com in browser",
        detail: "Open your web browser and type: http://neverssl.com into the address bar. Because this site uses unencrypted HTTP without HSTS, the captive portal router will easily intercept and display the login screen."
      },
      {
        title: "Temporarily turn off VPN software",
        detail: "Disconnect and fully exit VPN applications (NordVPN, ExpressVPN, Tailscale, Cloudflare WARP). VPN kill-switches block all unencrypted portal redirect gateways."
      },
      {
        title: "Disable DNS-over-HTTPS (Secure DNS) in browser",
        detail: "In Chrome/Edge settings, search for 'Secure DNS' or 'Use secure DNS' and toggle it off temporarily so local hotel DNS servers can intercept domain requests."
      },
      {
        title: "Type default gateway router IP directly into address bar",
        detail: "Open Command Prompt, run ipconfig, note the Default Gateway (e.g. 192.168.0.1 or 10.0.0.1), and type http://[Default_Gateway_IP] directly into your browser address bar."
      }
    ],
    related_error_codes: [37, 51],
    source: "researched",
    verified: false
  },
  {
    slug: "wake-on-lan-nic-power-state-sleep-hang",
    title: "Network card remains asleep and disconnected after computer wakes",
    summary: "Windows Power Management puts the PCIe network interface card (NIC) into D3hot power state during sleep, but the device driver fails to restore D0 operating state upon wake.",
    severity: "warn",
    category_slug: "no-internet",
    symptoms: [
      "Internet works perfectly on cold boot, but stays disconnected every time the PC wakes from sleep",
      "Network icon shows a red X or globe for 60 seconds after waking",
      "Requires disabling and re-enabling the network adapter in Control Panel to restore connection"
    ],
    fix_steps: [
      {
        title: "Disable Fast Startup in Windows Control Panel",
        detail: "Press Win + R, type 'powercfg.cpl', click 'Choose what the power buttons do', click 'Change settings that are currently unavailable', uncheck 'Turn on fast startup', and click Save changes."
      },
      {
        title: "Disable selective suspend and adapter sleep settings",
        detail: "In Device Manager, open Network adapters > Right-click NIC > Properties > Advanced tab > Disable 'Energy Efficient Ethernet', 'Green Ethernet', and 'System Idle Power Saver'."
      },
      {
        title: "Turn off Energy-Saving Ethernet in Device Power Management",
        detail: "In the same Properties window, open the 'Power Management' tab and uncheck 'Allow the computer to turn off this device to save power'."
      },
      {
        title: "Install OEM driver package over generic Windows Update driver",
        detail: "Windows Update provides basic generic Microsoft-packaged drivers that lack proper PCIe D-state power transition firmware. Download the full driver installer from Realtek or Intel."
      }
    ],
    related_error_codes: [28, 29],
    source: "researched",
    verified: false
  }
];

const NEW_OVERHEATING = [
  {
    slug: "gpu-vram-memory-junction-thermal-throttle",
    title: "GDDR6X VRAM memory junction overheating (105C - 110C thermal throttle)",
    summary: "Micron GDDR6X memory modules on high-end graphics cards (RTX 3080/3090/4080/4090) reach critical junction limits due to deteriorated, oily, or poorly compressed factory thermal pads.",
    severity: "critical",
    category_slug: "overheating",
    symptoms: [
      "HWInfo64 reports 'Memory Temperature' or 'GPU Memory Junction' pegged at 106C - 110C",
      "Games stutter violently after 10 minutes as GPU core clocks down to protect memory",
      "GPU core temp is cool (65C) but GPU fans spin at 100% emergency speed"
    ],
    fix_steps: [
      {
        title: "Monitor GPU Memory Junction Temperature in HWInfo64",
        detail: "Download HWInfo64, launch in Sensors-only mode, launch a demanding game, and observe 'GPU Memory Junction Temperature'. Maximum operating limit before thermal throttling is 105C."
      },
      {
        title: "Cap in-game framerates and lower memory intensive settings",
        detail: "Cap your framerate to your monitor refresh rate (e.g. 144 FPS) using NVIDIA Control Panel Max Frame Rate, and lower Ray Tracing and texture resolution to reduce VRAM bus utilization."
      },
      {
        title: "Add an intake fan blowing directly across GPU backplate",
        detail: "Position a 120mm bottom or side chassis fan pushing fresh cool air directly across the graphics card rear backplate to pull heat away from rear-mounted VRAM packages."
      },
      {
        title: "Replace factory VRAM thermal pads with high-performance pads",
        detail: "Disassemble the GPU heatsink and replace oily stock thermal pads with high-conductivity pads (like Gelid GP-Ultimate or Thermalright Odyssey) with the exact millimeter thickness specified for your GPU model."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "aio-cooler-pump-air-bubble-orientation",
    title: "AIO liquid cooler gurgling noise and high CPU temps from pump orientation",
    summary: "Air bubbles migrate into the AIO CPU water block pump impeller because the radiator is mounted with the pump at the highest physical point in the liquid loop.",
    severity: "warn",
    category_slug: "overheating",
    symptoms: [
      "Audible bubbling, clicking, or rattling noise originating from the CPU pump block",
      "CPU idle temperatures jump from 40C up to 75C without running any software",
      "Radiator tubes are mounted below the CPU block level"
    ],
    fix_steps: [
      {
        title: "Ensure top of radiator is higher than the CPU pump block",
        detail: "Inspect your case layout. The top of the radiator (or radiator tank) MUST sit physically higher than the CPU water block so air bubbles naturally pool in the top of the radiator away from the pump."
      },
      {
        title: "Tilt PC chassis while pump is running to dislodge air",
        detail: "Power on the PC, set pump speed to 100% in BIOS, and gently tilt the computer chassis backward and forward by 45 degrees to force trapped air bubbles up the tubing and into the radiator."
      },
      {
        title: "Remount radiator to the top chassis exhaust position",
        detail: "If the radiator is currently mounted at the bottom of the case, move it to the top roof panel as exhaust. Top mounting is the gold standard for zero air ingestion."
      },
      {
        title: "Set AIO pump header speed to constant 100% / Full Speed in BIOS",
        detail: "In BIOS hardware monitor, select the pump header (AIO_PUMP or W_PUMP) and set it to a constant 100% DC/PWM duty cycle. Liquid pumps are engineered to run at constant RPM, not variable fan curves."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "gaming-laptop-suffocating-soft-surface",
    title: "Gaming laptop thermal throttling on bed, couch, or soft blanket",
    summary: "Soft fabrics compress against bottom chassis intake grilles, completely choking fan airflow and causing the CPU and GPU to thermal throttle down to minimum frequencies.",
    severity: "warn",
    category_slug: "overheating",
    symptoms: [
      "Laptop chassis feels burning hot to touch above the keyboard deck",
      "Massive FPS drops and stuttering when gaming from bed or sofa",
      "Fans scream at maximum RPM but exhaust vents push out minimal airflow"
    ],
    fix_steps: [
      {
        title: "Place laptop on a hard, flat, rigid surface",
        detail: "Always operate gaming laptops on a desk, wooden lap desk, or hard tray. Soft bedding compresses under the rubber feet and blocks the bottom intake vents completely."
      },
      {
        title: "Elevate the rear laptop feet by 1-2 inches",
        detail: "Prop the rear rubber feet of the laptop up by one inch using small rubber stands, bottle caps, or an angled stand. This lowers CPU and GPU temperatures by 5C to 8C by doubling intake air volume."
      },
      {
        title: "Clean lint and pet hair from internal heatsink fins",
        detail: "Laptops used on beds ingest high volumes of blanket fibers and dust. Remove the bottom chassis cover and use compressed air to blast lint out through the copper exhaust fins."
      },
      {
        title: "Invest in a pressurized laptop cooling pad (IETS / Llano)",
        detail: "High-performance sealed-foam cooling pads force filtered air into the laptop chassis under positive pressure, dramatically reducing temperatures in thin chassis."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "motherboard-fan-speed-stuck-100-percent",
    title: "Motherboard case fans stuck at 100% speed (jet engine noise)",
    summary: "PWM 4-pin fans are configured in legacy DC Voltage mode in the BIOS, feeding a constant 12V rail that forces the fan motors to run at maximum RPM non-stop.",
    severity: "info",
    category_slug: "overheating",
    symptoms: [
      "Case fans scream at maximum RPM immediately upon booting into Windows",
      "Adjusting fan curves in Windows software has zero effect on fan noise",
      "Fan noise is deafening even when CPU temperature is at cool 30C idle"
    ],
    fix_steps: [
      {
        title: "Switch fan header mode from DC to PWM in BIOS",
        detail: "Restart PC and tap Del to enter BIOS. Open Q-Fan / Smart Fan / Hardware Monitor. Locate each fan header (CHA_FAN, SYS_FAN) and change control mode from 'DC' to 'PWM'."
      },
      {
        title: "Verify 4-pin PWM fan header connection",
        detail: "Check the fan cable header on the motherboard. Ensure 4-pin PWM fans are plugged into all 4 pins and not misaligned across 3 pins on the connector."
      },
      {
        title: "Install Fan Control open-source software",
        detail: "Download free open-source 'Fan Control' by Rem0o. Run the setup wizard to detect all motherboard and GPU sensors and create quiet custom stepped fan curves."
      },
      {
        title: "Check CPU temperature sensor readout in BIOS",
        detail: "If BIOS reads CPU temp as 99C while the heatsink is cold, the temperature probe is uncalibrated or disconnected, forcing safety failsafe 100% fan speed."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "damaged-heatpipe-loss-of-vacuum",
    title: "Damaged CPU heatsink heatpipe loss of vacuum causing instant 100C spike",
    summary: "A punctured, cracked, or severely bent sintered copper heatpipe loses its internal partial vacuum, terminating the liquid phase-change cycle and dropping thermal conductivity to near zero.",
    severity: "critical",
    category_slug: "overheating",
    symptoms: [
      "CPU spikes to 100C within 3 seconds of launching any game or benchmark",
      "CPU cooler aluminum fins remain cold to the touch while CPU core is thermal throttling",
      "Heatsink was dropped, bent, or damaged during shipping or moving"
    ],
    fix_steps: [
      {
        title: "Perform touch test on cooler heatpipes and fin stack",
        detail: "When the CPU reports 95C-100C under load, touch the top of the aluminum cooling fins. If the heatpipes and fins feel room temperature while the CPU throttles, heat is not transferring through the pipes."
      },
      {
        title: "Inspect copper heatpipe tips for cracks or punctures",
        detail: "Examine the sealed ends of the copper heatpipes at the top of the cooler tower. If a seal is crimped open or punctured, the internal distilled water vapor has escaped."
      },
      {
        title: "Verify thermal paste footprint and mounting pressure first",
        detail: "Remove the cooler and verify the thermal paste was evenly squished into a paper-thin layer. Rule out a missed plastic peel sticker before condemning the heatsink."
      },
      {
        title: "Replace the damaged CPU cooler tower",
        detail: "A heatpipe with loss of vacuum cannot be repaired or refilled. Replace the cooler with a budget modern dual-tower air cooler (like Thermalright Peerless Assassin 120)."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "psu-eco-mode-shroud-overheating",
    title: "Power supply hybrid eco mode overheating inside enclosed PSU shroud",
    summary: "The power supply zero-RPM fan mode keeps the internal fan motionless until 50% power load, allowing heat to soak into internal capacitors inside cases with solid unventilated PSU shrouds.",
    severity: "warn",
    category_slug: "overheating",
    symptoms: [
      "Case basement / PSU shroud feels extremely hot to the touch during gaming",
      "PC shuts down abruptly without blue screen after 30-45 minutes of heavy load",
      "Power supply fan only spins for 10 seconds right before the emergency thermal trip"
    ],
    fix_steps: [
      {
        title: "Toggle off the ECO / Semi-Passive / Hybrid switch on the PSU",
        detail: "Locate the small push-button or rocker switch on the back of the PSU labeled 'Eco Mode', 'Hybrid', or 'Smart Fan'. Switch it to OFF so the cooling fan runs continuously at quiet low RPM."
      },
      {
        title: "Verify PSU fan intake orientation (pointing downward)",
        detail: "Check the power supply installation orientation. The large fan grille should face DOWNWARD toward the bottom case dust filter to draw fresh ambient air from under the chassis."
      },
      {
        title: "Clean bottom chassis power supply dust filter",
        detail: "Slide out the mesh dust filter from under the rear bottom of your PC case. Wash out accumulated carpet lint and dust with warm water, dry thoroughly, and reinsert."
      },
      {
        title: "Never place PC tower directly on plush carpet",
        detail: "Plush carpets sink under case feet, completely sealing off the bottom power supply air intake. Place a flat wooden board, acrylic sheet, or PC stand under the tower."
      }
    ],
    related_error_codes: [29],
    source: "researched",
    verified: false
  },
  {
    slug: "pcie-gen4-gen5-ssd-thermal-throttle",
    title: "PCIe 4.0 / 5.0 NVMe SSD thermal throttling without motherboard heatsink",
    summary: "High-speed PCIe Gen 4 and Gen 5 NVMe SSD controllers draw up to 8-11W under continuous write operations, overheating to 85C and throttling read/write speeds from 7,000 MB/s down to 250 MB/s.",
    severity: "warn",
    category_slug: "overheating",
    symptoms: [
      "Steam or Epic Games download freezes and disk usage drops to 0 MB/s periodically",
      "HWInfo64 or CrystalDiskInfo shows Drive Temperature 2 (Controller) exceeding 85C - 90C",
      "Large file transfers start at 5 GB/s and drop to a crawl within 15 seconds"
    ],
    fix_steps: [
      {
        title: "Install motherboard metal M.2 thermal armor heatsink",
        detail: "Never run high-speed PCIe Gen 4/5 SSDs bare. Install the thick aluminum heatsink shield that came with your motherboard, ensuring the blue protective plastic film is peeled from the thermal pad."
      },
      {
        title: "Monitor Drive Temperature 2 (ASIC Controller) in HWInfo64",
        detail: "Drive Temp 1 reports NAND flash memory (which likes running warm around 40-60C), while Drive Temp 2 reports the controller. The controller must stay below 80C to prevent thermal throttling."
      },
      {
        title: "Add third-party M.2 copper fin heatsink",
        detail: "If your motherboard lacks integrated M.2 heatsinks, install an aftermarket $10 copper fin heatsink (like Thermalright HR-09 or be quiet! MC1) with dual-sided thermal pads."
      },
      {
        title: "Move M.2 SSD away from directly under hot GPU exhaust",
        detail: "If using secondary slots, avoid placing bare M.2 drives directly underneath a 300W graphics card exhaust port where heat soak drives SSD temperatures past safety thresholds."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "laptop-thermal-paste-pump-out-direct-die",
    title: "Laptop thermal paste pump-out degradation (degraded cooling after 2 months)",
    summary: "Traditional silicone-based thermal paste on bare-die laptop processors squishes out from thermal expansion and contraction cycles (the pump-out effect), leading to dry-out and thermal throttling.",
    severity: "warn",
    category_slug: "overheating",
    symptoms: [
      "Laptop temperatures were great right after repasting, but spiked back to 95C+ within 8-12 weeks",
      "Core-to-core temperature deltas exceed 15C-20C under load",
      "Disassembly reveals thermal paste pushed out around die edges with bare center silicon"
    ],
    fix_steps: [
      {
        title: "Replace standard paste with Honeywell PTM7950 phase-change pad",
        detail: "Standard paste (MX-4, Kryonaut) pumps out quickly on bare silicon dies. Order genuine Honeywell PTM7950 phase-change pad; it is solid at room temperature and melts under heat, completely eliminating pump-out."
      },
      {
        title: "Pre-chill PTM7950 in refrigerator before cutting",
        detail: "Place the PTM7950 sheet in the fridge for 10 minutes to make it stiff. Cut exactly to the size of the CPU and GPU dies, peel the plastic liner, apply to the die, and screw down the heatsink."
      },
      {
        title: "Use high-viscosity viscous paste if PTM is unavailable",
        detail: "If you must use paste, use high-viscosity thick compounds designed for direct-die applications (like Thermalright TFX, Gelid GC-Extreme, or K5 Pro on memory modules)."
      },
      {
        title: "Tighten laptop heatsink screws in numbered sequence",
        detail: "Laptop copper vapor chambers have numbered screw posts (1, 2, 3, 4, 5, 6). Always tighten them strictly in ascending sequence to prevent tilting the contact plate and pinching paste to one side."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  }
];

const NEW_DRIVER_ISSUES = [
  {
    slug: "device-manager-code-10-cannot-start",
    title: "Device Manager Code 10: This device cannot start",
    summary: "The device driver attempted to load, but the operating system hardware abstraction layer received a failure status from the device firmware or bus controller.",
    severity: "warn",
    category_slug: "driver-issues",
    symptoms: [
      "Yellow exclamation point icon next to device in Device Manager",
      "Device status reads: 'This device cannot start. (Code 10)'",
      "Wi-Fi, Bluetooth, or Realtek Audio suddenly stops functioning"
    ],
    fix_steps: [
      {
        title: "Perform a full power drain to reset hardware controller",
        detail: "Shut down your computer, unplug the power cord from the wall, and hold the power button down for 30 seconds. This fully discharges peripheral controllers that got stuck in an invalid state."
      },
      {
        title: "Uninstall device and restart Windows",
        detail: "In Device Manager, right-click the failing device > select 'Uninstall device' > check 'Attempt to remove the driver for this device' if available > click Uninstall. Restart Windows to force Plug and Play re-enumeration."
      },
      {
        title: "Delete UpperFilters and LowerFilters registry values",
        detail: "Press Win + R, type 'regedit', navigate to HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\Class\\{Device_Class_GUID}, and delete corrupted UpperFilters and LowerFilters keys."
      },
      {
        title: "Install official manufacturer chipset and device drivers",
        detail: "Download and install the latest standalone driver package directly from Intel, Realtek, or your motherboard manufacturer rather than relying on generic Windows Update drivers."
      }
    ],
    related_error_codes: [10, 29],
    source: "researched",
    verified: false
  },
  {
    slug: "device-manager-code-28-no-driver-installed",
    title: "Device Manager Code 28: The drivers for this device are not installed",
    summary: "Windows detected new hardware connected to the motherboard or PCIe bus, but cannot find a matching INF driver package in the local driver store or Windows Update.",
    severity: "info",
    category_slug: "driver-issues",
    symptoms: [
      "Listed under 'Other devices' with a yellow exclamation mark as 'Unknown device' or 'PCI Simple Communications Controller'",
      "Device status displays: 'The drivers for this device are not installed. (Code 28)'",
      "Certain motherboard features, audio jacks, or card readers fail to respond"
    ],
    fix_steps: [
      {
        title: "Look up Hardware ID in Device Properties",
        detail: "Right-click the Code 28 device > Properties > Details tab > Select 'Hardware Ids' in the dropdown. Copy the string (e.g. VEN_8086&DEV_7A60) and search it on devicehunt.com to identify the exact component."
      },
      {
        title: "Install Intel Management Engine (ME) or AMD Chipset Driver",
        detail: "'PCI Simple Communications Controller' or 'PCI Device' with Code 28 almost always indicates the Intel Management Engine interface or AMD I2C/GPIO chipset drivers are missing."
      },
      {
        title: "Check Windows Optional Updates",
        detail: "Go to Settings > Windows Update > Advanced options > Optional updates > Driver updates. Check all available manufacturer drivers and install them."
      },
      {
        title: "Run automated hardware driver setup utility",
        detail: "Use the official Intel Driver & Support Assistant or AMD Auto-Detect and Install tool to scan your PCIe bus and automatically install missing drivers."
      }
    ],
    related_error_codes: [28],
    source: "researched",
    verified: false
  },
  {
    slug: "device-manager-code-45-hardware-not-connected",
    title: "Device Manager Code 45: Hardware device is not connected to the computer",
    summary: "The device previously functioned and its driver remains registered, but Windows cannot physically detect electrical communication across the USB or PCIe interface.",
    severity: "warn",
    category_slug: "driver-issues",
    symptoms: [
      "Device icon appears translucent or faded in Device Manager",
      "Status reads: 'Currently, this hardware device is not connected to the computer. (Code 45)'",
      "Bluetooth adapter or webcam intermittently disappears completely"
    ],
    fix_steps: [
      {
        title: "Reseat the physical hardware cable or connector",
        detail: "If it is an internal M.2 Wi-Fi card, PCIe expansion card, or webcam cable, shut down the PC, unplug power, and reseat the card firmly into its motherboard slot."
      },
      {
        title: "Connect external USB devices to rear motherboard USB ports",
        detail: "Front-panel USB ports and unpowered USB hubs often fail to deliver sufficient current. Plug the device directly into a rear motherboard USB 3.0 port."
      },
      {
        title: "Uninstall ghost / hidden device entries",
        detail: "In Device Manager, click View > Show hidden devices > Expand the affected section > Right-click the greyed-out Code 45 entry and click 'Uninstall device'. Reconnect the device to trigger fresh detection."
      },
      {
        title: "Test device on a different computer",
        detail: "Connect the peripheral or USB hardware to a second PC or laptop. If it fails to register there as well, the device has suffered hardware failure (dead controller or broken solder connection)."
      }
    ],
    related_error_codes: [18, 45],
    source: "researched",
    verified: false
  },
  {
    slug: "device-manager-code-52-unsigned-driver",
    title: "Device Manager Code 52: Digital signature cannot be verified",
    summary: "Windows 64-bit Kernel-Mode Driver Signature Enforcement blocks a third-party driver because its cryptographic signature is absent, expired, or self-signed.",
    severity: "warn",
    category_slug: "driver-issues",
    symptoms: [
      "Status: 'Windows cannot verify the digital signature for the drivers required for this device. (Code 52)'",
      "Custom gamepad, legacy synthesizer, OBD2 car scanner, or microcontroller driver fails to start",
      "Occurs after upgrading Windows 10 to a newer feature update"
    ],
    fix_steps: [
      {
        title: "Check for an updated WHQL signed driver release",
        detail: "Visit the hardware manufacturer website to download the latest signed driver package updated for Windows 10/11 64-bit architecture."
      },
      {
        title: "Temporarily disable Driver Signature Enforcement",
        detail: "Hold Shift and click Restart from the Start Menu > Troubleshoot > Advanced Options > Startup Settings > Click Restart > Press 7 or F7 to 'Disable driver signature enforcement'. Test device functionality."
      },
      {
        title: "Install OEM digital security certificate into Windows Root Store",
        detail: "Right-click the driver's .inf or .sys file > Properties > Digital Signatures tab > Select signer > Details > View Certificate > Install Certificate > Select 'Trusted Root Certification Authorities'."
      },
      {
        title: "Use modern signed alternative driver packages",
        detail: "For USB serial devices (CH340, FTDI, CP2102) and controllers, download official WHQL drivers directly from FTDI Chip or Silicon Labs websites."
      }
    ],
    related_error_codes: [193],
    source: "researched",
    verified: false
  },
  {
    slug: "realtek-audio-front-panel-jack-not-detected",
    title: "Realtek audio front panel 3.5mm headphone jack not detected",
    summary: "The motherboard Realtek HD Audio codec fails to detect 3.5mm headphone or microphone insertion due to legacy AC97 vs HD Audio front panel pin detection mismatches.",
    severity: "warn",
    category_slug: "driver-issues",
    symptoms: [
      "Headphones plugged into case front panel produce zero sound and show as 'Unplugged'",
      "Rear motherboard audio works, but front jacks are completely ignored",
      "Realtek Audio Console reports 'No supported audio device found' or spins continuously"
    ],
    fix_steps: [
      {
        title: "Disable front panel jack detection in Realtek Audio Console",
        detail: "Open the Realtek Audio Console app > Click Device advanced settings (gear icon) > Toggle 'Disable front panel jack detection' to ON. This forces continuous analog audio stream output regardless of impedance sensing."
      },
      {
        title: "Inspect HD Audio front panel cable connection on motherboard",
        detail: "Ensure the case front panel audio cable (labeled 'HD AUDIO') is firmly plugged into the AAFP / JAUD1 9-pin header on the bottom-left corner of the motherboard with no bent pins."
      },
      {
        title: "Install OEM Realtek UAD drivers from motherboard support",
        detail: "Windows Update frequently replaces Realtek high-definition audio drivers with generic Microsoft High Definition Audio Device drivers that lack front-panel impedance sensing. Reinstall the OEM Realtek driver package."
      },
      {
        title: "Set default playback device in Windows Sound settings",
        detail: "Press Win + R, type 'mmsys.cpl', right-click 'Headphones' or 'Speakers (Realtek Audio)', and select 'Set as Default Device' and 'Set as Default Communication Device'."
      }
    ],
    related_error_codes: [28, 29],
    source: "researched",
    verified: false
  },
  {
    slug: "usb-hub-power-surge-exceeded",
    title: "Power surge on the USB port: A USB device has exceeded power limits",
    summary: "A shorted USB cable, damaged peripheral port, or unpowered multi-port hub attempts to pull more than the 500mA (USB 2.0) or 900mA (USB 3.0) current limit, tripping the motherboard resettable polyfuse.",
    severity: "critical",
    category_slug: "driver-issues",
    symptoms: [
      "Notification toast: 'Power surge on the USB port : Unknown USB device needs more power than the port can supply'",
      "All USB ports on the front panel or rear bracket shut down simultaneously",
      "System shuts off USB power to prevent motherboard circuit board burning"
    ],
    fix_steps: [
      {
        title: "Unplug all USB peripherals immediately",
        detail: "Disconnect every single USB device (flash drives, keyboards, mouse, webcams, RGB hubs). Click the 'Reset' button on the Windows error notification."
      },
      {
        title: "Inspect all USB ports with a flashlight for physical damage",
        detail: "Look inside every USB Type-A port. If the plastic center tab is broken and the 4 gold pins are touching each other or the metal outer housing, gently bend them apart with a wooden toothpick with the PC unplugged."
      },
      {
        title: "Switch to an externally powered USB hub",
        detail: "High-draw peripherals (like external hard drives, capture cards, and audio interfaces) should be plugged into an active USB 3.0 hub that has its own dedicated wall outlet AC power adapter."
      },
      {
        title: "Disconnect front-panel USB 3.0 header from motherboard",
        detail: "If the surge alert happens with nothing plugged into the case, disconnect the thick 19-pin blue USB 3.0 front-panel cable from the motherboard to isolate a defective case front I/O PCB."
      }
    ],
    related_error_codes: [29],
    source: "researched",
    verified: false
  },
  {
    slug: "mixed-refresh-rate-dual-monitor-stutter",
    title: "Dual monitor mixed refresh rate (144Hz + 60Hz) stuttering during video playback",
    summary: "The Windows Desktop Window Manager (DWM) drops the primary 144Hz monitor refresh down to 60Hz whenever GPU-accelerated video, animation, or streaming content plays on the secondary 60Hz screen.",
    severity: "warn",
    category_slug: "driver-issues",
    symptoms: [
      "Primary 144Hz/240Hz monitor feels laggy and stutters while playing a game whenever Twitch, YouTube, or Discord is open on the second 60Hz monitor",
      "Mouse movement looks like 60Hz on the 144Hz screen when a video is playing",
      "Minimizing the browser on the 60Hz screen instantly restores smooth 144Hz gameplay"
    ],
    fix_steps: [
      {
        title: "Ensure Windows 11 Build 22621 or newer is installed",
        detail: "Microsoft completely overhauled Desktop Window Manager (DWM) independent refresh rate synchronization in Windows 11, solving the legacy Windows 10 mixed refresh rate lock."
      },
      {
        title: "Disable Hardware Acceleration in browser and Discord",
        detail: "In Chrome/Edge settings, turn off 'Use graphics acceleration when available'. In Discord, go to User Settings > Advanced > Toggle Hardware Acceleration to OFF."
      },
      {
        title: "Set secondary monitor refresh rate to an exact integer divisor",
        detail: "If primary monitor is 144Hz, set it to 120Hz and keep secondary at 60Hz (exact 2:1 ratio). Integer division prevents frame pacing calculation jitter in GPU display engines."
      },
      {
        title: "Connect both monitors using identical cable types",
        detail: "Avoid mixing legacy HDMI 1.4 with DisplayPort 1.4. Connect both monitors via DisplayPort directly to the graphics card (never plug one into the motherboard and one into GPU)."
      }
    ],
    related_error_codes: [],
    source: "researched",
    verified: false
  },
  {
    slug: "hdmi-displayport-audio-device-disappears-after-sleep",
    title: "Monitor HDMI / DisplayPort audio device disappears after computer sleep",
    summary: "The GPU high-definition audio controller (NVIDIA High Definition Audio or AMD Audio Device) fails to re-detect the monitor audio sink after resuming from a low-power PCIe sleep state.",
    severity: "info",
    category_slug: "driver-issues",
    symptoms: [
      "Computer sound switches to internal motherboard speaker or cuts out completely after wake",
      "Monitor built-in speakers or headphone jack missing from Windows sound devices list",
      "Restarting the computer restores the monitor audio device immediately"
    ],
    fix_steps: [
      {
        title: "Restart the Windows Audio service in services.msc",
        detail: "Press Win + R, type 'services.msc', scroll to 'Windows Audio', right-click and choose 'Restart'. This forces Windows to rescan connected audio sinks without rebooting."
      },
      {
        title: "Disable and re-enable the display audio controller in Device Manager",
        detail: "Open Device Manager > Sound, video and game controllers > Right-click 'NVIDIA High Definition Audio' or 'AMD High Definition Audio Device' > Disable device > wait 3 seconds > Enable device."
      },
      {
        title: "Perform clean GPU driver installation with HD Audio component checked",
        detail: "Run the latest graphics driver installer. Choose 'Custom (Advanced)', ensure the 'HD Audio Driver' checkbox is selected, and check 'Perform a clean installation'."
      },
      {
        title: "Toggle monitor input selection button",
        detail: "Using the physical buttons on your monitor, cycle the input from DisplayPort to HDMI and back to DisplayPort. This forces a fresh hot-plug detection (HPD) handshake with the GPU audio controller."
      }
    ],
    related_error_codes: [28, 29],
    source: "researched",
    verified: false
  }
];

function appendIssues(fileName: string, newIssues: any[]) {
  const filePath = path.join(process.cwd(), "data", "research", fileName);
  const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const existingSlugs = new Set(existing.map((x: any) => x.slug));
  
  const toAdd = newIssues.filter((x: any) => !existingSlugs.has(x.slug));
  if (toAdd.length > 0) {
    const combined = [...existing, ...toAdd];
    fs.writeFileSync(filePath, JSON.stringify(combined, null, 2), "utf-8");
    console.log(`[+] Added ${toAdd.length} new issues to ${fileName} (Total: ${combined.length})`);
  } else {
    console.log(`[=] All issues already present in ${fileName}`);
  }
}

console.log("=== EXPANDING PC FIXIT RESEARCH KNOWLEDGE BASE ===");
appendIssues("wont-boot.json", NEW_WONT_BOOT);
appendIssues("blue-screen.json", NEW_BLUE_SCREEN);
appendIssues("running-slow.json", NEW_RUNNING_SLOW);
appendIssues("no-internet.json", NEW_NO_INTERNET);
appendIssues("overheating.json", NEW_OVERHEATING);
appendIssues("driver-issues.json", NEW_DRIVER_ISSUES);
console.log("=== EXPANSION COMPLETE ===");
