export type Language = "en" | "ms";

export const translations = {
  en: {
    // Navigation & Header
    nav_diagnostician: "AI Diagnostician",
    nav_guided_fix: "Guided Fix",
    nav_knowledge_base: "Knowledge Base",
    nav_start_diagnosis: "Start diagnosis",
    theme_light: "Switch to light mode",
    theme_dark: "Switch to dark mode",
    lang_toggle_label: "Switch language",

    // Hero Section
    hero_badge: "Verified Hardware & Windows Diagnostic Engine",
    hero_title_prefix: "Diagnose PC Problems.",
    hero_title_accent: "Get the Actual Fix.",
    hero_description:
      "No confusing jargon or dead forum links. Describe what your computer is doing and receive clear, step-by-step diagnostic solutions.",
    hero_input_placeholder:
      "Describe your PC problem: e.g. Fans spin for a second then shut off",
    hero_btn_diagnose: "Diagnose",
    hero_try_asking: "Try asking:",
    hero_pill_no_display: "No display / Black screen",
    hero_pill_clicks_off: "PC turns on then clicks off",
    hero_pill_bsod: "Blue screen stop code",
    hero_pill_no_internet: "Wi-Fi connected no internet",
    hero_pill_fans_100: "Fans roaring at 100%",
    hero_action_launch_ai: "Launch AI Diagnostician",
    hero_action_wizard: "Step-by-Step Guided Fix",

    // Triage Section
    triage_badge: "Instant Symptom Triage",
    triage_title: "Find Your Exact Failure Point",
    triage_subtitle:
      "Select what your PC is doing to get a verified, step-by-step resolution plan in seconds.",
    triage_guide_link: "View Full Guide",
    triage_immediate_check: "Immediate Check",
    triage_immediate_step: "Immediate Step:",
    triage_need_wizard: "Need full diagnostic wizard?",
    triage_tab_wont_boot: "Won't Boot",
    triage_tab_blue_screen: "Blue Screen",
    triage_tab_running_slow: "Freezes & Lag",
    triage_tab_no_internet: "No Internet",
    triage_tab_overheating: "Overheating",
    triage_tab_driver_issues: "Device & Drivers",

    // Categories Section
    categories_badge: "Knowledge Base",
    categories_title: "Explore Problem Categories",
    categories_subtitle:
      "Browse our complete library of 180 researched hardware failure modes and error code resolutions.",
    cat_library_badge: "Diagnostic Library",
    cat_browse_title: "Browse by Hardware & System Area",
    cat_browse_subtitle:
      "Select your specific symptom category to explore targeted resolution guides.",
    cat_ask_ai: "Ask AI directly",
    cat_action_diagnose: "Diagnose",
    cat_sev_critical: "Critical Fault",
    cat_sev_warn: "High Frequency",
    cat_sev_info: "Hardware & Driver",
    cat_wont_boot_title: "Won't boot",
    cat_wont_boot_desc: "Black screen, no POST, stuck on logo",
    cat_blue_screen_title: "Blue screen (BSOD)",
    cat_blue_screen_desc: "Crashes with a stop code",
    cat_running_slow_title: "Running slow",
    cat_running_slow_desc: "Lag, freezes, long load times",
    cat_no_internet_title: "No internet",
    cat_no_internet_desc: "Wi-Fi drops, no connection, slow speeds",
    cat_overheating_title: "Overheating",
    cat_overheating_desc: "Loud fans, thermal shutdowns",
    cat_driver_issues_title: "Driver issues",
    cat_driver_issues_desc: "GPU, audio, or peripheral not working",
    cat_guides_count: "{count} researched guides",

    // How It Works Section
    how_badge: "Engineering Workflow",
    how_title: "Three Steps to a Working Computer",
    how_subtitle:
      "Designed for ordinary computer users and technicians alike. Clean instructions from external cables to internal parts.",
    how_step1_title: "Describe in Plain Words",
    how_step1_desc:
      "Tell it what you see, hear, or smell: flashing LEDs, sudden power loss, blue screen codes, or loud fans. No tech jargon needed.",
    how_step2_title: "Hardware Analysis",
    how_step2_desc:
      "The engine cross-references your symptoms against verified hardware documentation, Windows error references, and diagnostic AI.",
    how_step3_title: "Follow Step-by-Step Fixes",
    how_step3_desc:
      "Clear numbered steps ordered from easiest, no-risk checks first (cables, ports) to advanced component isolation.",

    // Chat / Diagnostician Page
    chat_header_title: "AI Diagnostician",
    chat_header_status: "Active & Ready",
    chat_header_sub: "Interactive Hardware & Windows Diagnostic Station",
    chat_intro:
      "Hi there! I'm PC Fixit. Describe what's going on with your computer in your own words: what you're seeing, any lights or beeps, and what you've already tried.",
    chat_quick_prompts: "Quick Diagnostic Prompts",
    chat_starter_1: "Screen turns on but stays black",
    chat_starter_2: "Computer turns on and immediately shuts off",
    chat_starter_3: "Blue screen with a stop code",
    chat_starter_4: "Wi-Fi icon disappeared",
    chat_input_placeholder: "Describe your PC problem in plain language...",
    chat_send_btn: "Send",
    chat_thinking: "Analyzing symptoms against error code database...",
    chat_disclaimer:
      "AI diagnosis provides guided troubleshooting steps based on vendor documentation and error-code references.",
    chat_retry_btn: "Retry diagnosis",
    chat_copy_btn: "Copy diagnosis",
    chat_copied_btn: "Copied!",

    // Wizard Page
    wizard_header_title: "Guided Hardware Fix",
    wizard_header_sub:
      "Step-by-step decision tree to isolate your hardware or software problem without guessing.",
    wizard_restart_btn: "Start Over",
    wizard_back_btn: "Back",
    wizard_step_indicator: "Step {step} of ~4",
    wizard_question_badge: "Diagnostic Question",
    wizard_complete_badge: "Diagnosis Complete",
    wizard_matched_badge: "Targeted Match Found",
    wizard_likely_happening: "Here is what is likely happening",
    wizard_path_label: "Diagnostic path:",
    wizard_resolution_title: "Recommended Resolution",
    wizard_solution_steps: "Recommended Solution Steps",
    wizard_view_full_guide: "View Complete Guide",
    wizard_ask_ai_explain: "Ask AI to Explain This",

    // Issue Detail Page
    issue_all_guides: "All Guides",
    issue_share: "Share",
    issue_copied_link: "Copied link!",
    issue_checklist_title: "Interactive Fix Checklist",
    issue_symptoms_title: "Identified Symptoms",
    issue_common_symptoms: "Common Symptoms & Tells",
    issue_related_codes: "Related Stop Codes",
    issue_verified_badge: "Verified Hardware Solution",
    issue_researched_badge: "Documentation Researched",
    issue_all_steps_done: "All steps completed!",

    // Footer
    footer_status: "AI Diagnostician Ready",
    footer_disclaimer:
      "Compiled from vendor documentation and Windows error-code references. Not affiliated with any commercial hardware manufacturer.",
    footer_nav_diagnose: "Diagnose",
    footer_nav_guided_fix: "Guided Fix",
    footer_nav_kb: "Knowledge Base",
  },
  ms: {
    // Navigation & Header
    nav_diagnostician: "AI Diagnostik",
    nav_guided_fix: "Panduan Baiki",
    nav_knowledge_base: "Koleksi Panduan",
    nav_start_diagnosis: "Mula semak",
    theme_light: "Mod cerah",
    theme_dark: "Mod gelap",
    lang_toggle_label: "Tukar bahasa",

    // Hero Section
    hero_badge: "Sistem Diagnostik Hardware & Windows",
    hero_title_prefix: "Cari Punca Masalah PC.",
    hero_title_accent: "Terus Dapat Cara Baiki.",
    hero_description:
      "Tak perlu pening istilah teknikal pelik atau link forum mati. Cerita je apa masalah PC anda, kami bagi panduan baiki langkah demi langkah yang jelas.",
    hero_input_placeholder:
      "Cerita masalah PC anda: cth. Kipas pusing sekejap lepas tu mati",
    hero_btn_diagnose: "Diagnos",
    hero_try_asking: "Cuba tanya:",
    hero_pill_no_display: "Screen hitam / Tak keluar display",
    hero_pill_clicks_off: "PC on sekejap terus terpadam",
    hero_pill_bsod: "Blue screen (BSOD) stop code",
    hero_pill_no_internet: "Wi-Fi connect tapi tiada internet",
    hero_pill_fans_100: "Kipas bising pusing laju 100%",
    hero_action_launch_ai: "Tanya AI Diagnostik",
    hero_action_wizard: "Panduan Langkah Demi Langkah",

    // Triage Section
    triage_badge: "Pilih Masalah Anda",
    triage_title: "Ketahui Punca Kerosakan",
    triage_subtitle:
      "Pilih apa yang berlaku pada PC anda untuk dapatkan cara baiki yang tepat dalam beberapa saat.",
    triage_guide_link: "Tengok Panduan Penuh",
    triage_immediate_check: "Semakan Awal",
    triage_immediate_step: "Cuba Buat Ni Dulu:",
    triage_need_wizard: "Nak panduan langkah demi langkah?",
    triage_tab_wont_boot: "Tak Boleh On",
    triage_tab_blue_screen: "Blue Screen",
    triage_tab_running_slow: "Lag & Hang",
    triage_tab_no_internet: "Tiada Internet",
    triage_tab_overheating: "Panas / Overheat",
    triage_tab_driver_issues: "Driver & Peranti",

    // Categories Section
    categories_badge: "Pusat Panduan",
    categories_title: "Kategori Masalah Utama",
    categories_subtitle:
      "Lihat 180 panduan lengkap untuk masalah hardware dan kod error Windows.",
    cat_library_badge: "Koleksi Panduan",
    cat_browse_title: "Pilih Ikut Bahagian PC",
    cat_browse_subtitle:
      "Pilih kategori masalah anda untuk cari penyelesaian yang paling tepat.",
    cat_ask_ai: "Tanya AI terus",
    cat_action_diagnose: "Semak",
    cat_sev_critical: "Masalah Kritikal",
    cat_sev_warn: "Kerap Berlaku",
    cat_sev_info: "Hardware & Driver",
    cat_wont_boot_title: "Tak boleh on",
    cat_wont_boot_desc: "Screen hitam, tak keluar display, sangkut kat logo",
    cat_blue_screen_title: "Blue screen (BSOD)",
    cat_blue_screen_desc: "PC kerap crash dan keluar kod stop code",
    cat_running_slow_title: "Lembap / Selalu Hang",
    cat_running_slow_desc: "Lag, freeze, loading lama sangat",
    cat_no_internet_title: "Tiada internet",
    cat_no_internet_desc: "Wi-Fi putus-putus, tak boleh connect, speed slow",
    cat_overheating_title: "Panas / Overheat",
    cat_overheating_desc: "Kipas bunyi kuat, PC padam sendiri sebab panas",
    cat_driver_issues_title: "Masalah Driver",
    cat_driver_issues_desc: "Graphic card, sound, atau USB tak detect",
    cat_guides_count: "{count} panduan baiki",

    // How It Works Section
    how_badge: "Cara Ia Berfungsi",
    how_title: "3 Langkah Mudah Baiki PC",
    how_subtitle:
      "Sesuai untuk semua orang, daripada pengguna biasa sampai technician. Check dari luar dulu sampai part dalam.",
    how_step1_title: "Cerita Guna Ayat Sendiri",
    how_step1_desc:
      "Beritahu apa yang anda nampak atau dengar: lampu kelip-kelip, PC mati tiba-tiba, blue screen, atau kipas bising. Tak payah istilah pening.",
    how_step2_title: "AI Semak Masalah",
    how_step2_desc:
      "Sistem semak tanda kerosakan dengan rekod hardware sebenar dan rujukan kod error Windows.",
    how_step3_title: "Ikut Cara Baiki",
    how_step3_desc:
      "Langkah tersusun dari yang paling senang dan selamat (kabel, plug) sampai semakan komponen dalam.",

    // Chat / Diagnostician Page
    chat_header_title: "AI Diagnostik",
    chat_header_status: "Aktif & Sedia",
    chat_header_sub: "Pusat Bantuan Diagnostik Hardware & Windows",
    chat_intro:
      "Hai! Saya pembantu PC Fixit. Cerita je apa masalah PC anda guna ayat sendiri: apa yang berlaku, ada lampu atau bunyi beep tak, dan apa yang anda dah cuba buat.",
    chat_quick_prompts: "Contoh Soalan Biasa",
    chat_starter_1: "PC on tapi screen hitam",
    chat_starter_2: "PC hidup sekejap terus padam",
    chat_starter_3: "Keluar blue screen dan kod error",
    chat_starter_4: "Ikon Wi-Fi hilang tak boleh connect",
    chat_input_placeholder: "Tulis masalah PC anda kat sini...",
    chat_send_btn: "Hantar",
    chat_thinking: "Tengah semak masalah & kod error...",
    chat_disclaimer:
      "Panduan AI ini berdasarkan dokumentasi rasmi hardware dan rujukan kod error Windows.",
    chat_retry_btn: "Cuba tanya lagi",
    chat_copy_btn: "Salin",
    chat_copied_btn: "Dah salin!",

    // Wizard Page
    wizard_header_title: "Panduan Baiki Langkah Demi Langkah",
    wizard_header_sub:
      "Jawab beberapa soalan mudah untuk cari punca masalah tanpa teka-teka.",
    wizard_restart_btn: "Mula Balik",
    wizard_back_btn: "Kembali",
    wizard_step_indicator: "Langkah {step} / ~4",
    wizard_question_badge: "Soalan",
    wizard_complete_badge: "Selesai",
    wizard_matched_badge: "Punca Masalah Dijumpai",
    wizard_likely_happening: "Ini kemungkinan besar apa yang berlaku",
    wizard_path_label: "Pilihan anda:",
    wizard_resolution_title: "Cara Baiki Yang Disyorkan",
    wizard_solution_steps: "Langkah Baiki",
    wizard_view_full_guide: "Tengok Panduan Lengkap",
    wizard_ask_ai_explain: "Minta AI Terangkan Lebih Lanjut",

    // Issue Detail Page
    issue_all_guides: "Semua Panduan",
    issue_share: "Kongsi",
    issue_copied_link: "Pautan disalin!",
    issue_checklist_title: "Senarai Semak Cara Baiki",
    issue_symptoms_title: "Tanda-Tanda Yang Dikesan",
    issue_common_symptoms: "Tanda-Tanda Biasa",
    issue_related_codes: "Kod Error Berkaitan",
    issue_verified_badge: "Solusi Dah Diuji",
    issue_researched_badge: "Panduan Disemak",
    issue_all_steps_done: "Semua langkah dah siap!",

    // Footer
    footer_status: "AI Diagnostik Sedia",
    footer_disclaimer:
      "Rujukan dihimpun daripada dokumentasi pengeluar dan kod error Windows. Tiada kaitan dengan mana-mana jenama perkakasan komersial.",
    footer_nav_diagnose: "Diagnos",
    footer_nav_guided_fix: "Panduan Baiki",
    footer_nav_kb: "Koleksi Panduan",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
