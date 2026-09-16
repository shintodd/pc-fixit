"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, Eye, CheckCircle2, ShieldCheck, Camera } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export interface HardwarePhotoGuide {
  id: string;
  imageSrc: string;
  altText: string;
  titleEn: string;
  titleMs: string;
  subtitleEn: string;
  subtitleMs: string;
  keyPointsEn: string[];
  keyPointsMs: string[];
  calloutEn?: string;
  calloutMs?: string;
}

const HARDWARE_GUIDES: Record<string, HardwarePhotoGuide> = {
  cmos: {
    id: "cmos",
    imageSrc: "/images/hardware/cmos-battery.jpg",
    altText: "Real motherboard CR2032 lithium coin battery in socket with metal spring clip",
    titleEn: "Motherboard CR2032 Battery & Retention Clip",
    titleMs: "Bateri CR2032 Motherboard & Klip Logam",
    subtitleEn: "Physical reference for resetting CMOS settings or replacing dead battery.",
    subtitleMs: "Rujukan fizikal untuk reset CMOS atau tukar bateri jam motherboard.",
    keyPointsEn: [
      "Standard 3V lithium coin cell (Panasonic / Maxell CR2032).",
      "Look for small shiny metal latch on the edge of the circular plastic socket.",
      "Gently press metal latch outward with a fingernail or flat plastic spudger; battery springs up.",
      "Never use metal screwdrivers to pry from underneath to prevent scratching traces."
    ],
    keyPointsMs: [
      "Bateri jenis leper 3V litium (biasanya jenama Panasonic / Maxell CR2032).",
      "Cari klip logam berkilat kecil di hujung soket plastik bulat.",
      "Tolak klip logam ke luar perlahan-lahan menggunakan kuku atau pencungkil plastik; bateri akan melompat keluar.",
      "Jangan guna pemutar skru besi secara kasar bagi mengelakkan calar pada litar motherboard."
    ],
    calloutEn: "PRO TIP: Keep battery out for 5 minutes with wall power unplugged to discharge capacitors and wipe CMOS memory.",
    calloutMs: "TIP PENTING: Biarkan bateri keluar selama 5 minit dengan plug dinding dicabut untuk pastikan memori CMOS terpadam sepenuhnya."
  },
  ram: {
    id: "ram",
    imageSrc: "/images/hardware/ram-dimm-slots.jpg",
    altText: "Real dual-channel motherboard RAM DIMM slots with plastic locking clips",
    titleEn: "RAM DIMM Slots & Locking Latches",
    titleMs: "Slot RAM DIMM Motherboard & Klip Pengunci",
    subtitleEn: "Inspect slot orientation and latch alignment before seating memory.",
    subtitleMs: "Kenal pasti arah slot dan klip pengunci sebelum tekan masuk RAM.",
    keyPointsEn: [
      "Notice the off-center alignment notch in the slot; sticks only insert in one direction.",
      "Dual-channel motherboards usually perform best with sticks in slots 2 and 4 (counting right from CPU).",
      "Open the swing latches at top/bottom of slot before inserting.",
      "Press firmly with both thumbs on both ends until the latches click shut on their own."
    ],
    keyPointsMs: [
      "Perhatikan lekuk tengah tidak simetri; RAM hanya boleh masuk pada satu arah sahaja.",
      "Motherboard dwi-saluran paling stabil jika RAM dipasang pada slot 2 dan 4 (kira dari CPU ke kanan).",
      "Buka klip tepi slot sebelum masukkan kepingan RAM.",
      "Tekan kuat dengan kedua-dua ibu jari di hujung kiri dan kanan sehingga klip berbunyi klik terkunci sendiri."
    ],
    calloutEn: "PRO TIP: A gold contact strip should disappear completely inside the slot when fully seated.",
    calloutMs: "TIP PENTING: Jalur tembaga emas RAM mestilah tenggelam sepenuhnya ke dalam slot apabila dipasang rapat."
  },
  gpu: {
    id: "gpu",
    imageSrc: "/images/hardware/gpu-bracket-ports.jpg",
    altText: "Real graphics card PCIe rear bracket with stamped DisplayPort and HDMI ports",
    titleEn: "Graphics Card Rear Bracket & Video Ports",
    titleMs: "Slot Kad Grafik Belakang (GPU) & Port Paparan",
    subtitleEn: "Always connect monitor cables to horizontal expansion bracket ports.",
    subtitleMs: "Sentiasa sambungkan kabel monitor ke slot mendatar kad grafik di bawah.",
    keyPointsEn: [
      "Look for stamped 'D' (DisplayPort) and 'HDMI' labels on the metal rear bracket.",
      "Horizontal expansion slots belong to dedicated GPU; vertical ports above belong to motherboard.",
      "Ensure display cable is clicked all the way in until metal collar is flush with bracket.",
      "Check that 6-pin or 8-pin PCIe power cables are clipped tightly into the top edge of the card."
    ],
    keyPointsMs: [
      "Cari simbol huruf 'D' (DisplayPort) dan 'HDMI' pada plat besi belakang kad grafik.",
      "Slot mendatar ialah kad grafik khusus (GPU); port menegak di atas adalah port motherboard (jangan cucuk situ jika ada GPU).",
      "Pastikan kepala kabel monitor dimasukkan rapat sehingga tiada ruang besi kelihatan.",
      "Pastikan wayar kuasa 6-pin atau 8-pin PCIe dicucuk kemas di bucu atas kad grafik."
    ],
    calloutEn: "COMMON MISTAKE: Plugging monitor into top motherboard ports gives a black screen on systems with dedicated graphics.",
    calloutMs: "KESILAPAN UTAMA: Mencucuk kabel ke port atas motherboard akan menyebabkan skrin hitam jika ada kad grafik berasingan."
  },
  cpu: {
    id: "cpu",
    imageSrc: "/images/hardware/motherboard-cpu.jpg",
    altText: "Real AMD Ryzen processor seated in motherboard AM4 socket with metal retention lever",
    titleEn: "CPU Socket & Retention Lever Mechanism",
    titleMs: "Soket Pemproses CPU & Tuil Pengunci Logam",
    subtitleEn: "Visual guide for processor seating, golden triangle alignment, and socket latch.",
    subtitleMs: "Rujukan kedudukan pemproses CPU, segitiga emas penjajaran, dan tuil pengunci.",
    keyPointsEn: [
      "Notice the small golden alignment triangle in one corner of CPU and matching mark on socket.",
      "Zero-insertion-force (ZIF) design: CPU must drop into socket freely without applying force.",
      "Lower metal retention lever down and hook it under the plastic tab to lock pins in place.",
      "Inspect motherboard socket pins (Intel LGA / AMD AM5) or CPU pins (AMD AM4) for any bends."
    ],
    keyPointsMs: [
      "Perhatikan simbol segitiga emas kecil di bucu processor dan tanda padanan pada soket.",
      "Reka bentuk ZIF: Processor mestilah masuk sendiri ke soket tanpa perlu ditekan.",
      "Tolak tuil besi ke bawah dan cangkukkan di bawah klip plastik untuk mengunci.",
      "Periksa pin soket motherboard atau pin CPU pastikan tiada yang bengkok."
    ],
    calloutEn: "WARNING: Never slide or drag CPU across socket; align straight down to avoid bent pins.",
    calloutMs: "AMARAN: Jangan sesekali seret processor di atas soket; letak lurus dari atas ke bawah untuk elak pin patah."
  },
  thermal: {
    id: "thermal",
    imageSrc: "/images/hardware/thermal-paste-cpu.jpg",
    altText: "Real thermal paste compound applied to CPU integrated heat spreader and heatsink copper base",
    titleEn: "Thermal Paste Application & Heatsink Base",
    titleMs: "Sapuan Thermal Paste & Tapak Tembaga Heatsink",
    subtitleEn: "Reference for adequate paste coverage and cleaning old dried compound.",
    subtitleMs: "Panduan jumlah thermal paste dan cara membersihkan lapisan lama yang kering.",
    keyPointsEn: [
      "A small pea-sized dot (5mm) or 'X' pattern in the center is sufficient for desktop CPUs.",
      "Clean old hardened paste using 90%+ isopropyl alcohol (IPA) and lint-free microfiber cloth.",
      "Heatsink mounting pressure will spread paste evenly across the metal heat spreader.",
      "Tighten cooler screws in diagonal crisscross pattern (1 to 2 turns at a time) for even pressure."
    ],
    keyPointsMs: [
      "Titik kecil saiz kacang pea (5mm) atau corak tanda 'X' di tengah sudah mencukupi.",
      "Bersihkan sisa cecair lama yang kering guna alkohol isopropil (IPA) 90%+ dan kain mikrofiber.",
      "Tekanan skru cooler akan meratakan thermal paste ke seluruh permukaan besi CPU.",
      "Ketatkan skru cooler secara bersilang (diagonal) sedikit demi sedikit untuk tekanan seimbang."
    ],
    calloutEn: "CHECK FIRST: Remember to peel off transparent plastic warning sticker from cooler copper base before mounting!",
    calloutMs: "PERIKSA DULU: Pastikan anda buka pelekat plastik amaran pada tapak tembaga cooler sebelum pasang!"
  },
  storage: {
    id: "storage",
    imageSrc: "/images/hardware/hard-drive-storage.jpg",
    altText: "Real 3.5 inch SATA hard drive with PCB logic board, power, and data connectors",
    titleEn: "Storage Drive Connectors (SATA & NVMe)",
    titleMs: "Sambungan Pemacu Simpanan (SATA & NVMe)",
    subtitleEn: "Verify SATA data cable latch and 15-pin power connector engagement.",
    subtitleMs: "Sahkan kabel data SATA dan wayar kuasa 15-pin terpasang kemas.",
    keyPointsEn: [
      "SATA drives require two cables: wide 15-pin power cable from PSU, and narrow 7-pin data cable to motherboard.",
      "Both cables feature an 'L-shaped' keyed slot; do not force backwards.",
      "M.2 NVMe SSDs install directly into motherboard slot at 30-degree angle and secure with tiny standoff screw.",
      "If drive disappears from BIOS, swap SATA motherboard port (e.g. SATA_0) and verify power cable."
    ],
    keyPointsMs: [
      "Pemacu SATA perlukan dua wayar: wayar lebar 15-pin kuasa dari PSU, dan wayar kecil 7-pin data ke motherboard.",
      "Kedua-dua kepala kabel mempunyai bentuk huruf 'L'; jangan paksa secara terbalik.",
      "SSD jenis M.2 NVMe dipasang terus ke slot motherboard pada sudut 30 darjah dan dikunci dengan skru kecil.",
      "Jika SSD tidak dikesan dalam BIOS, cuba tukar port SATA pada motherboard dan periksa kabel kuasa."
    ],
    calloutEn: "PRO TIP: High-speed NVMe drives perform best in the top slot connected directly to CPU lanes.",
    calloutMs: "TIP PENTING: Pasang SSD NVMe di slot paling atas berhampiran CPU untuk kelajuan paling maksimum."
  },
  desktop: {
    id: "desktop",
    imageSrc: "/images/hardware/desktop-pc-build.jpg",
    altText: "Real assembled desktop gaming PC chassis interior showing motherboard, cooler, and cabling",
    titleEn: "PC Chassis Internal Layout Overview",
    titleMs: "Gambaran Keseluruhan Susun Atur Dalam Casing PC",
    subtitleEn: "Locate internal components, power supply cabling, and airflow paths.",
    subtitleMs: "Kenal pasti kedudukan komponen dalaman, kabel kuasa, dan aliran udara kipas.",
    keyPointsEn: [
      "Power supply (PSU) is seated at the bottom chamber with 24-pin ATX and PCIe power branches.",
      "Motherboard is centered with CPU cooler and RAM at the upper half, GPU seated in top PCIe x16 slot.",
      "Front intake fans draw cool air inwards; rear and top exhaust fans push heated air outside.",
      "Always verify the case front-panel power switch wires (POWER SW) are seated on motherboard headers."
    ],
    keyPointsMs: [
      "Power supply (PSU) terletak di ruang bawah casing dengan cabang wayar 24-pin ATX dan PCIe.",
      "Motherboard berada di tengah dengan CPU cooler dan RAM di bahagian atas, GPU di slot PCIe x16.",
      "Kipas hadapan menyedut udara sejuk masuk; kipas belakang dan atas meniup udara panas keluar.",
      "Sentiasa periksa wayar butang kuasa hadapan (POWER SW) dicucuk pada pin f-panel motherboard."
    ],
    calloutEn: "SAFETY FIRST: Always turn off power strip and discharge static by touching metal case before handling internal parts.",
    calloutMs: "UTAMAKAN KESELAMATAN: Tutup suis plug dan sentuh bahagian besi casing untuk nyahcas elektrik statik sebelum sentuh komponen."
  },
  bsod: {
    id: "bsod",
    imageSrc: "/images/hardware/windows-bsod-screen.jpg",
    altText: "Real Windows Blue Screen of Death BSOD stop code screen",
    titleEn: "Windows Blue Screen (BSOD) & Stop Code",
    titleMs: "Skrin Biru Windows (BSOD) & Kod Stop",
    subtitleEn: "Locate stop code name, QR code, and failing system driver file.",
    subtitleMs: "Kenal pasti nama kod ralat, kod QR, dan fail pemacu sistem yang gagal.",
    keyPointsEn: [
      "Note the capital STOP CODE name at bottom (e.g. CRITICAL_PROCESS_DIED, MEMORY_MANAGEMENT).",
      "Check if a specific filename is listed next to 'What failed' (e.g. nvlddmkm.sys, ntoskrnl.exe).",
      "Scan the on-screen QR code with your phone camera for Microsoft troubleshooting documentation.",
      "If the percentage progress freezes at 0%, hold the power button for 10 seconds to force a restart."
    ],
    keyPointsMs: [
      "Salin nama KOD STOP huruf besar di bawah (contohnya CRITICAL_PROCESS_DIED atau MEMORY_MANAGEMENT).",
      "Periksa sama ada fail dinyatakan di 'What failed' (contoh: nvlddmkm.sys atau ntoskrnl.exe).",
      "Imbas kod QR pada skrin guna telefon pintar untuk buka panduan rasmi Microsoft.",
      "Jika peratusan terhenti pada 0%, tekan dan tahan butang power 10 saat untuk restart paksa."
    ],
    calloutEn: "PRO TIP: Snap a quick phone photo as soon as BSOD appears before your PC automatically restarts.",
    calloutMs: "TIP PENTING: Tangkap gambar skrin guna telefon segera sebaik BSOD muncul sebelum PC restart sendiri."
  },
  network: {
    id: "network",
    imageSrc: "/images/hardware/ethernet-rj45-cable.jpg",
    altText: "Real Ethernet RJ45 network cable with 8P8C modular connector plug and retention clip",
    titleEn: "Ethernet RJ45 Cable & Port Inspection",
    titleMs: "Pemeriksaan Kabel & Port Ethernet RJ45",
    subtitleEn: "Verify physical clip latch, 8 gold pin contacts, and port LED link indicators.",
    subtitleMs: "Sahkan klip pengunci kabel, 8 pin tembaga emas, dan lampu LED status pada port.",
    keyPointsEn: [
      "Inspect the flexible plastic retaining clip on top of the plug; a snapped clip causes loose drops.",
      "Check for green (link connection) and amber/orange (activity) indicator LEDs next to the port.",
      "Ensure all 8 gold copper pins inside the clear connector are clean, straight, and uncorroded.",
      "Firmly press cable into RJ45 socket until you hear and feel an audible mechanical click."
    ],
    keyPointsMs: [
      "Periksa klip plastik di atas kepala kabel; jika patah, wayar mudah longgar dan internet terputus.",
      "Lihat lampu LED hijau (sambungan) dan jingga (aktiviti) di sebelah port rangkaian.",
      "Pastikan 8 pin tembaga emas di dalam kepala jernih bersih, lurus, dan tidak berkarat.",
      "Tekan kabel masuk ke soket RJ45 sehingga terdengar bunyi klik pengunci kemas."
    ],
    calloutEn: "PRO TIP: If port lights stay completely dark, test with another Ethernet cable or router LAN port to rule out cable damage.",
    calloutMs: "TIP PENTING: Jika lampu port langsung gelap, uji dengan kabel Ethernet lain atau port router lain untuk pastikan wayar tidak putus."
  },
  driver: {
    id: "driver",
    imageSrc: "/images/hardware/device-manager-driver.jpg",
    altText: "Real Windows Device Manager utility showing hardware tree and driver device status",
    titleEn: "Windows Device Manager & Hardware Status",
    titleMs: "Pengurus Peranti Windows & Status Pemacu",
    subtitleEn: "Identify yellow warning exclamation marks and faulty hardware drivers.",
    subtitleMs: "Kesan tanda seruan amaran kuning dan komponen perkakasan yang bermasalah.",
    keyPointsEn: [
      "Press Win + X and select 'Device Manager' (or run devmgmt.msc from Run dialog).",
      "Look for hardware categories expanded automatically with a yellow triangular exclamation mark.",
      "Double-click warning item to check Device Status code (e.g. Code 43, Code 10, Code 28).",
      "Right-click item and choose 'Uninstall device', then reboot PC so Windows re-detects fresh drivers."
    ],
    keyPointsMs: [
      "Tekan Win + X dan pilih 'Device Manager' (atau taip devmgmt.msc dalam menu Run).",
      "Cari senarai kategori yang terbuka automatik dengan ikon tanda seruan kuning.",
      "Klik dua kali peranti bermasalah untuk semak kod ralat (contoh: Code 43, Code 10, Code 28).",
      "Klik kanan peranti dan pilih 'Uninstall device', kemudian restart PC untuk Windows kesan semula pemacu."
    ],
    calloutEn: "PRO TIP: Code 43 on graphics cards often indicates PCIe slot seating or hardware VRAM fault rather than pure driver bug.",
    calloutMs: "TIP PENTING: Ralat Code 43 pada kad grafik selalunya berpunca daripada slot PCIe longgar atau kerosakan VRAM."
  },
  performance: {
    id: "performance",
    imageSrc: "/images/hardware/task-manager-performance.jpg",
    altText: "Real Windows Task Manager Performance tab showing CPU, Memory, and Disk resource utilization",
    titleEn: "Task Manager Resource Performance",
    titleMs: "Prestasi & Penggunaan Sumber Task Manager",
    subtitleEn: "Pinpoint CPU, RAM, Disk, or GPU utilization spikes causing system lag and freezes.",
    subtitleMs: "Kenal pasti kesesakan pada penggunaan CPU, RAM, Storan, atau GPU yang punca lembap.",
    keyPointsEn: [
      "Press Ctrl + Shift + Esc to open Task Manager directly and switch to the 'Performance' tab.",
      "Check if CPU or Disk 0 is pinned near 100% utilization while the computer is idle.",
      "Inspect Memory graph: if In Use exceeds 90%, Windows is heavily swapping memory to storage.",
      "Switch to 'Processes' tab and click column header (CPU or Memory) to sort highest consuming apps."
    ],
    keyPointsMs: [
      "Tekan Ctrl + Shift + Esc untuk buka Task Manager terus dan pilih tab 'Performance'.",
      "Periksa sama ada graf CPU atau Storan (Disk 0) tersekat hampir 100% semasa PC santai.",
      "Semak graf Memori: jika penggunaan melebihi 90%, Windows terpaksa bergantung pada swap storan.",
      "Tukar ke tab 'Processes' dan klik kepala lajur untuk susun aplikasi yang memakan sumber paling tinggi."
    ],
    calloutEn: "PRO TIP: 100% Disk usage on traditional mechanical hard drives (HDDs) is permanently fixed by upgrading to an SSD.",
    calloutMs: "TIP PENTING: Isu Disk 100% pada hard disk mekanikal (HDD) lama boleh diselesaikan serta-merta dengan menaik taraf ke SSD."
  }
};

function resolveHardwareGuide(slug: string, categorySlug?: string): HardwarePhotoGuide | null {
  const s = (slug || "").toLowerCase();
  const cat = (categorySlug || "").toLowerCase();

  // CMOS
  if (s.includes("cmos") || s.includes("date-reset") || s.includes("battery") || s.includes("bios-checksum")) {
    return HARDWARE_GUIDES.cmos;
  }
  // RAM / DRAM
  if (s.includes("dram") || s.includes("ram") || s.includes("memory") || s.includes("channel-loss")) {
    return HARDWARE_GUIDES.ram;
  }
  // GPU / VGA / Display
  if (s.includes("vga") || s.includes("gpu") || s.includes("display") || s.includes("artifact") || s.includes("graphics") || s.includes("hdmi") || s.includes("displayport") || s.includes("black-screen")) {
    return HARDWARE_GUIDES.gpu;
  }
  // CPU / Socket
  if (s.includes("cpu") || s.includes("processor") || s.includes("socket") || s.includes("mounting-pressure")) {
    return HARDWARE_GUIDES.cpu;
  }
  // Thermal / Overheating
  if (cat.includes("overheat") || s.includes("thermal") || s.includes("overheat") || s.includes("temperature") || s.includes("fan") || s.includes("throttling") || s.includes("cooler")) {
    return HARDWARE_GUIDES.thermal;
  }
  // Storage / SSD / Drive
  if (s.includes("ssd") || s.includes("bootmgr") || s.includes("inaccessible-boot") || s.includes("hard-drive") || s.includes("nvme") || s.includes("sata") || s.includes("storage")) {
    return HARDWARE_GUIDES.storage;
  }
  // Blue Screen (BSOD)
  if (cat.includes("blue-screen") || s.includes("bsod") || s.includes("stop-code") || s.includes("bugcheck")) {
    return HARDWARE_GUIDES.bsod;
  }
  // No Internet / Networking
  if (cat.includes("no-internet") || s.includes("internet") || s.includes("ethernet") || s.includes("wifi") || s.includes("network") || s.includes("dns") || s.includes("ip-config")) {
    return HARDWARE_GUIDES.network;
  }
  // Driver Issues
  if (cat.includes("driver") || s.includes("driver") || s.includes("device-manager") || s.includes("code-43") || s.includes("code-10") || s.includes("peripheral")) {
    return HARDWARE_GUIDES.driver;
  }
  // Running Slow / Performance
  if (cat.includes("running-slow") || s.includes("slow") || s.includes("lag") || s.includes("freeze") || s.includes("high-cpu") || s.includes("100-disk") || s.includes("taskmgr") || s.includes("performance")) {
    return HARDWARE_GUIDES.performance;
  }
  // Won't boot general layout
  if (cat.includes("wont-boot") || s.includes("power-sequence") || s.includes("breadboarding") || s.includes("fans-spin") || s.includes("no-power")) {
    return HARDWARE_GUIDES.desktop;
  }

  // Fallback: 100% of guides resolve to desktop interior reference
  return HARDWARE_GUIDES.desktop;
}

interface HardwareVisualGuideProps {
  slug: string;
  categorySlug?: string;
  overrideGuideId?: keyof typeof HARDWARE_GUIDES;
}

export default function HardwareVisualGuide({
  slug,
  categorySlug,
  overrideGuideId,
}: HardwareVisualGuideProps) {
  const { language } = useLanguage();
  const isMs = language === "ms";
  const [isZoomed, setIsZoomed] = useState(false);

  // Close zoomed photo on Escape key
  useEffect(() => {
    if (!isZoomed) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsZoomed(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  const guide = overrideGuideId ? HARDWARE_GUIDES[overrideGuideId] : resolveHardwareGuide(slug, categorySlug);

  if (!guide) return null;

  const title = isMs ? guide.titleMs : guide.titleEn;
  const subtitle = isMs ? guide.subtitleMs : guide.subtitleEn;
  const keyPoints = isMs ? guide.keyPointsMs : guide.keyPointsEn;
  const callout = isMs ? guide.calloutMs : guide.calloutEn;

  return (
    <div className="mt-8 rounded-2xl border border-line dark:border-dark-line bg-surface dark:bg-dark-card overflow-hidden shadow-xs print-clean">
      {/* Header Banner */}
      <div className="px-5 py-3.5 border-b border-line dark:border-dark-line bg-subtle/50 dark:bg-dark-subtle/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-accent/10 dark:bg-dark-accent/20 px-2.5 text-[11px] font-bold uppercase tracking-wider text-accent dark:text-dark-accent">
            <Camera className="h-3 w-3" />
            <span>{isMs ? "Panduan Visual Perkakasan" : "Hardware Visual Guide"}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsZoomed(true)}
          className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent dark:text-dark-accent hover:underline focus:outline-none"
        >
          <ZoomIn className="h-3.5 w-3.5" />
          <span>{isMs ? "Besarkan Foto" : "Inspect Image"}</span>
        </button>
      </div>

      {/* Main Grid: Photo + Key Points */}
      <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hardware Photo with Click to Zoom */}
        <div className="lg:col-span-5 relative group">
          <div
            onClick={() => setIsZoomed(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIsZoomed(true)}
            className="relative h-56 sm:h-64 w-full overflow-hidden rounded-xl border border-line dark:border-dark-line cursor-zoom-in bg-subtle dark:bg-dark-subtle shadow-xs"
          >
            <Image
              src={guide.imageSrc}
              alt={guide.altText}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={false}
            />

            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity flex flex-col justify-end p-3.5 text-white">
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-full">
                  <Eye className="h-3 w-3 text-accent" />
                  <span>{isMs ? "Klik untuk zum" : "Click to enlarge"}</span>
                </span>
                <span className="bg-accent/80 backdrop-blur-xs px-2 py-0.5 rounded-full text-white">
                  100% Real
                </span>
              </div>
            </div>
          </div>

          <p className="mt-2 text-[11px] text-ink-tertiary dark:text-dark-ink-tertiary text-center leading-tight">
            {isMs ? "Foto perkakasan fizikal untuk bantu anda kenal pasti komponen." : "Actual component photograph to assist with physical hardware identification."}
          </p>
        </div>

        {/* Content & Inspection Points */}
        <div className="lg:col-span-7 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-ink dark:text-dark-ink">
              {title}
            </h3>
            <p className="mt-1 text-[13px] text-ink-secondary dark:text-dark-ink-secondary leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Inspection Checklist */}
          <div className="space-y-2.5 pt-1">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-tertiary dark:text-dark-ink-tertiary">
              {isMs ? "Titik Pemeriksaan Fizikal:" : "Physical Inspection Checklist:"}
            </div>
            <ul className="space-y-2">
              {keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[13px] text-ink dark:text-dark-ink leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tip / Callout */}
          {callout && (
            <div className="rounded-xl border border-accent/25 bg-accent/5 dark:bg-dark-accent/10 p-3.5 text-[12px] text-ink dark:text-dark-ink leading-relaxed flex items-start gap-2.5">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div className="font-medium">{callout}</div>
            </div>
          )}
        </div>
      </div>

      {/* High-Resolution Zoom Lightbox Modal */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/85 backdrop-blur-sm"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full max-h-[90vh] bg-surface dark:bg-dark-card rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Lightbox Header */}
              <div className="p-4 border-b border-line dark:border-dark-line flex items-center justify-between bg-subtle dark:bg-dark-subtle">
                <div>
                  <h4 className="font-bold text-ink dark:text-dark-ink text-sm sm:base">
                    {title}
                  </h4>
                  <p className="text-[11px] text-ink-secondary dark:text-dark-ink-secondary">
                    {isMs ? "Foto rujukan perkakasan sebenar resolusi tinggi." : "High-resolution authentic hardware reference photograph."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-ink-secondary dark:text-dark-ink-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close photo"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Lightbox Image Viewport */}
              <div className="relative w-full h-[60vh] bg-black/95 flex items-center justify-center p-2">
                <Image
                  src={guide.imageSrc}
                  alt={guide.altText}
                  fill
                  sizes="(max-width: 1200px) 100vw, 1200px"
                  className="object-contain"
                  priority
                />
              </div>

              {/* Lightbox Footer Note */}
              <div className="p-3.5 bg-subtle/80 dark:bg-dark-subtle/80 text-[12px] text-ink-secondary dark:text-dark-ink-secondary border-t border-line dark:border-dark-line flex items-center justify-between">
                <span>{guide.altText}</span>
                <span className="text-ok font-semibold text-[11px]">{isMs ? "Foto Perkakasan Disahkan" : "Verified Authentic Photo"}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
