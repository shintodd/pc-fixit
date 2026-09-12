export type Language = "en" | "ms";

export const translations = {
  en: {
    // Navigation & Header
    nav_diagnostician: "AI Technician",
    nav_guided_fix: "Guided Fix",
    nav_knowledge_base: "Knowledge Base",
    nav_start_diagnosis: "Start diagnosis",
    theme_light: "Switch to light mode",
    theme_dark: "Switch to dark mode",
    lang_toggle_label: "Switch language",

    // Hero Section
    hero_badge: "Your Friendly 24/7 PC Repair Tech",
    hero_title_prefix: "Got a PC Problem?",
    hero_title_accent: "Let's Fix It Together.",
    hero_description:
      "No confusing tech jargon or dead-end forum posts. Tell your friendly technician what your PC is doing and get clear, step-by-step guidance right away.",
    hero_input_placeholder:
      "Tell your tech: e.g. Fans spin for a second then shut off",
    hero_btn_diagnose: "Ask Tech",
    hero_try_asking: "Try asking your tech:",
    hero_pill_no_display: "No display / Black screen",
    hero_pill_clicks_off: "PC turns on then clicks off",
    hero_pill_bsod: "Blue screen stop code",
    hero_pill_no_internet: "Wi-Fi connected no internet",
    hero_pill_fans_100: "Fans roaring at 100%",
    hero_action_launch_ai: "Chat with AI Technician",
    hero_action_wizard: "Step-by-Step Guided Fix",

    // Triage Section
    triage_badge: "Quick Tech Triage",
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
    how_badge: "How We Help",
    how_title: "Three Simple Steps to Fix Your PC",
    how_subtitle:
      "Just like having a patient, experienced PC repair tech right next to you at your desk.",
    how_step1_title: "Tell Us in Your Own Words",
    how_step1_desc:
      "No technical knowledge required. Just tell your tech what you see or hear: blinking lights, beeps, or sudden power loss.",
    how_step2_title: "Your Tech Pinpoints the Cause",
    how_step2_desc:
      "We match your exact symptoms against verified hardware blueprints, real repair cases, and Windows error codes.",
    how_step3_title: "Walk Through the Fix",
    how_step3_desc:
      "Your tech starts with zero-risk, no-tools checks first (cables, plugs) before touching anything inside.",

    // Chat / Diagnostician Page
    chat_header_title: "Friendly AI Technician",
    chat_header_status: "Active & Ready",
    chat_header_sub: "Your personal, patient PC repair buddy on standby",
    chat_intro:
      "Hey there! I'm your PC Fixit tech. Don't stress if your computer is acting up, we can figure this out together! Tell me what's happening in your own words: what do you see or hear, and what have you tried so far?",
    chat_quick_prompts: "Popular Tech Questions",
    chat_starter_1: "Screen turns on but stays black",
    chat_starter_2: "Computer turns on and immediately shuts off",
    chat_starter_3: "Blue screen with a stop code",
    chat_starter_4: "Wi-Fi icon disappeared",
    chat_input_placeholder: "Tell your technician what's happening with your PC...",
    chat_send_btn: "Send",
    chat_thinking: "Your tech is checking the symptoms and finding the best solution...",
    chat_disclaimer:
      "Friendly technician guidance based on official vendor documentation and Windows error diagnostics. Feel free to ask follow-up questions anytime!",
    chat_retry_btn: "Ask tech again",
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
    wizard_ask_ai_explain: "Ask Tech to Explain This",

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
    footer_status: "AI Technician Online & Ready",
    footer_disclaimer:
      "Compiled from vendor documentation and Windows error-code references. Not affiliated with any commercial hardware manufacturer.",
    footer_nav_diagnose: "Diagnose",
    footer_nav_guided_fix: "Guided Fix",
    footer_nav_kb: "Knowledge Base",
  },
  ms: {
    // Navigation & Header
    nav_diagnostician: "Technician AI",
    nav_guided_fix: "Panduan Baiki",
    nav_knowledge_base: "Koleksi Panduan",
    nav_start_diagnosis: "Mula semak",
    theme_light: "Mod cerah",
    theme_dark: "Mod gelap",
    lang_toggle_label: "Tukar bahasa",

    // Hero Section
    hero_badge: "Technician PC Mesra 24/7 Anda",
    hero_title_prefix: "PC Anda Buat Hal?",
    hero_title_accent: "Jom Kita Baiki Sama-Sama.",
    hero_description:
      "Tak perlu pening istilah pelik atau baca forum lama. Cerita je masalah PC anda kat technician kami dan dapatkan cara baiki yang mudah difahami langkah demi langkah.",
    hero_input_placeholder:
      "Cerita kat technician: cth. Kipas pusing sekejap lepas tu mati",
    hero_btn_diagnose: "Tanya Tech",
    hero_try_asking: "Cuba tanya technician:",
    hero_pill_no_display: "Screen hitam / Tak keluar display",
    hero_pill_clicks_off: "PC on sekejap terus terpadam",
    hero_pill_bsod: "Blue screen (BSOD) stop code",
    hero_pill_no_internet: "Wi-Fi connect tapi tiada internet",
    hero_pill_fans_100: "Kipas bising pusing laju 100%",
    hero_action_launch_ai: "Sembang Dengan Technician AI",
    hero_action_wizard: "Panduan Langkah Demi Langkah",

    // Triage Section
    triage_badge: "Semakan Cepat Technician",
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
    how_badge: "Cara Kami Bantu",
    how_title: "3 Langkah Mudah Baiki PC Anda",
    how_subtitle:
      "Macam ada kawan technician yang penyabar tolong tengokkan PC sebelah meja anda.",
    how_step1_title: "Cerita Guna Ayat Sendiri",
    how_step1_desc:
      "Tak perlu tahu istilah komputer pun. Cerita je apa yang anda nampak atau dengar: lampu kelip, bunyi beep, atau kipas pusing.",
    how_step2_title: "Technician Cari Punca Masalah",
    how_step2_desc:
      "Sistem semak tanda kerosakan dengan rekod baiki sebenar dan rujukan kod error Windows.",
    how_step3_title: "Ikut Langkah Baiki",
    how_step3_desc:
      "Technician akan ajar semak benda paling selamat dan mudah dulu (kabel, plug) sebelum usik part dalam.",

    // Chat / Diagnostician Page
    chat_header_title: "Technician AI Mesra",
    chat_header_status: "Sedia Membantu",
    chat_header_sub: "Kawan technician PC peribadi anda yang sedia membantu",
    chat_intro:
      "Hai! Saya abang technician PC Fixit anda. Jangan risau kalau PC buat hal ya, jom kita check sama-sama sampai elok! Cerita je apa masalah yang jadi: ada lampu menyala ke, screen hitam ke, atau kipas tak pusing?",
    chat_quick_prompts: "Soalan Popular Kepada Tech",
    chat_starter_1: "PC on tapi screen hitam",
    chat_starter_2: "PC hidup sekejap terus padam",
    chat_starter_3: "Keluar blue screen dan kod error",
    chat_starter_4: "Ikon Wi-Fi hilang tak boleh connect",
    chat_input_placeholder: "Cerita kat technician apa masalah PC anda...",
    chat_send_btn: "Hantar",
    chat_thinking: "Technician tengah semak punca masalah dan cari jalan penyelesaian...",
    chat_disclaimer:
      "Panduan santai daripada technician berpandukan manual rasmi. Kalau ada apa-apa langkah yang tak faham, tanya je ya!",
    chat_retry_btn: "Tanya technician lagi",
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
    wizard_ask_ai_explain: "Minta Tech Terangkan Lagi",

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
    footer_status: "Technician AI Sedia Membantu",
    footer_disclaimer:
      "Rujukan dihimpun daripada dokumentasi pengeluar dan kod error Windows. Tiada kaitan dengan mana-mana jenama perkakasan komersial.",
    footer_nav_diagnose: "Diagnos",
    footer_nav_guided_fix: "Panduan Baiki",
    footer_nav_kb: "Koleksi Panduan",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
