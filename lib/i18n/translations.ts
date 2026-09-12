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
    nav_diagnostician: "Diagnostik AI",
    nav_guided_fix: "Panduan Baiki",
    nav_knowledge_base: "Pangkalan Pengetahuan",
    nav_start_diagnosis: "Mula diagnostik",
    theme_light: "Tukar ke mod cerah",
    theme_dark: "Tukar ke mod gelap",
    lang_toggle_label: "Tukar bahasa",

    // Hero Section
    hero_badge: "Enjin Diagnostik Perkakasan & Windows Sah",
    hero_title_prefix: "Kenal Pasti Masalah PC.",
    hero_title_accent: "Dapatkan Solusi Sebenar.",
    hero_description:
      "Tiada istilah teknikal yang mengelirukan atau link forum mati. Terangkan apa yang berlaku pada komputer anda dan terima langkah penyelesaian yang jelas.",
    hero_input_placeholder:
      "Terangkan masalah PC anda: cth. Kipas berpusing sekejap lepas tu mati",
    hero_btn_diagnose: "Diagnostik",
    hero_try_asking: "Cuba tanya:",
    hero_pill_no_display: "Tiada paparan / Skrin gelap",
    hero_pill_clicks_off: "PC hidup sekejap terus padam",
    hero_pill_bsod: "Kod ralat skrin biru (BSOD)",
    hero_pill_no_internet: "Wi-Fi bersambung tiada internet",
    hero_pill_fans_100: "Kipas bising menderu 100%",
    hero_action_launch_ai: "Buka Diagnostik AI",
    hero_action_wizard: "Panduan Baiki Langkah Demi Langkah",

    // Triage Section
    triage_badge: "Triage Simptom Segera",
    triage_title: "Kesan Punca Masalah Anda",
    triage_subtitle:
      "Pilih keadaan PC anda untuk dapatkan pelan penyelesaian yang sah dalam beberapa saat.",
    triage_guide_link: "Lihat Panduan Penuh",
    triage_immediate_check: "Pemeriksaan Awal",
    triage_immediate_step: "Langkah Segera:",
    triage_need_wizard: "Perlukan wizard diagnostik penuh?",
    triage_tab_wont_boot: "Tak Boleh Hidup",
    triage_tab_blue_screen: "Skrin Biru",
    triage_tab_running_slow: "Hang & Tersekat",
    triage_tab_no_internet: "Tiada Internet",
    triage_tab_overheating: "Panas Melampau",
    triage_tab_driver_issues: "Peranti & Driver",

    // Categories Section
    categories_badge: "Pangkalan Pengetahuan",
    categories_title: "Kategori Masalah Utama",
    categories_subtitle:
      "Lihat koleksi lengkap 180 panduan kegagalan perkakasan dan penyelesaian kod ralat Windows.",
    cat_library_badge: "Perpustakaan Diagnostik",
    cat_browse_title: "Lihat Mengikut Perkakasan & Sistem",
    cat_browse_subtitle:
      "Pilih kategori simptom anda untuk meneroka panduan penyelesaian tepat.",
    cat_ask_ai: "Tanya AI terus",
    cat_action_diagnose: "Diagnostik",
    cat_sev_critical: "Kerosakan Kritikal",
    cat_sev_warn: "Kekerapan Tinggi",
    cat_sev_info: "Perkakasan & Driver",
    cat_wont_boot_title: "Tak boleh hidup",
    cat_wont_boot_desc: "Skrin hitam, tiada POST, tersangkut pada logo",
    cat_blue_screen_title: "Skrin biru (BSOD)",
    cat_blue_screen_desc: "Sistem crash dengan kod ralat stop code",
    cat_running_slow_title: "Sangat perlahan / Hang",
    cat_running_slow_desc: "Lag, tersekat-sekat, masa loading lama",
    cat_no_internet_title: "Tiada internet",
    cat_no_internet_desc: "Wi-Fi putus-putus, tiada sambungan, perlahan",
    cat_overheating_title: "Panas melampau",
    cat_overheating_desc: "Kipas bising, PC padam mengejut sebab panas",
    cat_driver_issues_title: "Masalah Driver",
    cat_driver_issues_desc: "GPU, audio, atau peranti USB tidak berfungsi",
    cat_guides_count: "{count} panduan diselidik",

    // How It Works Section
    how_badge: "Aliran Kerja Kejuruteraan",
    how_title: "Tiga Langkah Membaiki Komputer",
    how_subtitle:
      "Direka khas untuk pengguna biasa mahupun juruteknik. Panduan teratur dari kabel luaran ke komponen dalaman.",
    how_step1_title: "Terangkan dengan Bahasa Mudah",
    how_step1_desc:
      "Beritahu apa yang anda lihat, dengar, atau bau: lampu berkelip, PC padam tiba-tiba, kod skrin biru, atau kipas bising. Tiada istilah rumit diperlukan.",
    how_step2_title: "Analisis Perkakasan",
    how_step2_desc:
      "Enjin membandingkan simptom anda dengan dokumentasi perkakasan sah, rujukan ralat Windows, dan AI diagnostik.",
    how_step3_title: "Ikuti Langkah Pembaikan",
    how_step3_desc:
      "Langkah bernombor yang jelas disusun daripada semakan paling mudah tanpa risiko (kabel, port) hingga pengasingan komponen.",

    // Chat / Diagnostician Page
    chat_header_title: "Diagnostik AI",
    chat_header_status: "Aktif & Sedia",
    chat_header_sub: "Stesen Diagnostik Perkakasan & Windows Interaktif",
    chat_intro:
      "Hai! Saya PC Fixit. Terangkan apa yang berlaku pada komputer anda dengan perkataan anda sendiri: apa yang anda lihat, sebarang lampu atau bunyi beep, dan apa yang telah anda cuba.",
    chat_quick_prompts: "Cadangan Soalan Diagnostik",
    chat_starter_1: "Skrin hidup tetapi kekal gelap",
    chat_starter_2: "Komputer hidup dan terus padam serta-merta",
    chat_starter_3: "Skrin biru dengan kod stop code",
    chat_starter_4: "Ikon Wi-Fi hilang tiba-tiba",
    chat_input_placeholder: "Terangkan masalah PC anda dalam bahasa mudah...",
    chat_send_btn: "Hantar",
    chat_thinking: "Menganalisis simptom berdasarkan pangkalan data ralat...",
    chat_disclaimer:
      "Diagnostik AI menyediakan panduan berasaskan dokumentasi pengeluar dan rujukan kod ralat sistem.",
    chat_retry_btn: "Cuba diagnosis semula",
    chat_copy_btn: "Salin diagnosis",
    chat_copied_btn: "Disalin!",

    // Wizard Page
    wizard_header_title: "Panduan Baiki Terbimbing",
    wizard_header_sub:
      "Pohon keputusan langkah demi langkah untuk mengesan kerosakan tanpa perlu meneka.",
    wizard_restart_btn: "Mula Semula",
    wizard_back_btn: "Kembali",
    wizard_step_indicator: "Langkah {step} daripada ~4",
    wizard_question_badge: "Soalan Diagnostik",
    wizard_complete_badge: "Diagnosis Selesai",
    wizard_matched_badge: "Padanan Tepat Ditemui",
    wizard_likely_happening: "Ini kemungkinan besar apa yang berlaku",
    wizard_path_label: "Laluan diagnostik:",
    wizard_resolution_title: "Penyelesaian Disyorkan",
    wizard_solution_steps: "Langkah Penyelesaian Disyorkan",
    wizard_view_full_guide: "Lihat Panduan Lengkap",
    wizard_ask_ai_explain: "Minta AI Terangkan Ini",

    // Issue Detail Page
    issue_all_guides: "Semua Panduan",
    issue_share: "Kongsi",
    issue_copied_link: "Pautan disalin!",
    issue_checklist_title: "Senarai Semak Pembaikan Interaktif",
    issue_symptoms_title: "Simptom Yang Dikesan",
    issue_common_symptoms: "Simptom & Petunjuk Biasa",
    issue_related_codes: "Kod Ralat Berkaitan",
    issue_verified_badge: "Solusi Perkakasan Disahkan",
    issue_researched_badge: "Dokumentasi Diselidik",
    issue_all_steps_done: "Semua langkah selesai!",

    // Footer
    footer_status: "Diagnostik AI Sedia",
    footer_disclaimer:
      "Dihimpunkan daripada dokumentasi pengeluar dan rujukan kod ralat Windows. Tidak bergabung dengan mana-mana pengeluar perkakasan komersial.",
    footer_nav_diagnose: "Diagnostik",
    footer_nav_guided_fix: "Panduan Baiki",
    footer_nav_kb: "Pangkalan Pengetahuan",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
