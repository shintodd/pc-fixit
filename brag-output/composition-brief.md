# Hyperframes Composition Brief: pcfix

## Objective
Create a short, polished launch-style brag video for pcfix, a self-hosted AI-powered PC diagnostic tool.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape -- 1920x1080
- Duration: 20 seconds

## Source Material
- Project root: c:\Users\ainol\Downloads\pc-fixit-frontend
- Primary files read: app/page.tsx, app/layout.tsx, app/globals.css, tailwind.config.ts, components/Chat.tsx, components/QuickToolsBar.tsx, components/Header.tsx, README.md, package.json
- Product name: pcfix
- Tagline / strongest claim: "Describe what's wrong with your PC and get a real diagnosis: guided troubleshooting, plain-language fixes, no fluff."
- Key UI or visual moment to recreate: The iMessage-style AI chat interface with blue user bubbles and white/dark assistant bubbles, streaming AI diagnosis response
- Copy that must appear verbatim:
  - "STOP CODE: CRITICAL_PROCESS_DIED"
  - "My PC won't boot, DRAM LED is red on the motherboard"
  - "220+ Guides"
  - "309 Error Codes"
  - "Zero Ads"
  - "Describe the problem. Get the fix."
  - "pcfixtech.my.id"

## Creative Direction
- Tone preset: polished
- Creative direction: quiet confidence, clinical precision, Apple-grade restraint
- Interpretation: Slow reveals, generous holds, confidence through stillness. Inter font, Apple-inspired color palette, frosted glass effects. The product speaks for itself. Every frame is clean and readable.
- Angle: Your PC is broken. You're panicking. pcfix asks one question, then walks you through the actual fix. No ads, no affiliate links. Just the diagnosis.
- Hook: A blue screen crash error fills the frame, then glitches into the clean pcfix interface.
- Outro / punchline: pcfix logo, "Describe the problem. Get the fix." Clean hold.
- Avoid:
  - Generic SaaS language ("streamline", "revolutionize", "empower")
  - Abstract filler visuals
  - Unrelated visual redesign of the actual app
  - Any em dashes

## Visual Identity
- Background light: #f5f5f7
- Background dark: #161617
- Text light: #1d1d1f
- Text dark: #f5f5f7
- Accent light: #0066cc
- Accent dark: #2997ff
- BSOD blue: #0078d7
- Display font: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- Body font: Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif
- Visual references from the project: iMessage chat bubbles (blue gradient user, white/dark assistant), glass-panel frosted backdrop, Apple-style typing dots, rounded pill buttons, QuickToolsBar card pills

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. BSOD Hook -- 2.5s -- Full-screen BSOD with "STOP CODE: CRITICAL_PROCESS_DIED", glitch dissolve to pcfix
2. AI Diagnosis in Action -- 5s -- Dark mode chat, user types symptom, AI streams structured response
3. Diagnostic Toolkit -- 4s -- Light mode, 5 tool cards fan out one by one
4. The Numbers -- 4s -- Dark mode, 3 stats appear sequentially: 220+ Guides, 309 Error Codes, Zero Ads
5. Logo & Tagline -- 4.5s -- Dark mode, pcfix logo scales in, tagline fades up, URL appears small

## Audio
- Audio role: warm bed with clinical precision
- Audio arc: BSOD glitch shock, then clean steady warmth through the middle, gentle swell under stats, quiet bell on logo, fade out
- Music: happy-beats-business-moves-vol-12-by-ende-dot-app.mp3
- Music treatment: fade in at 0.30 volume over first 0.5s, steady through scenes 2-4, gentle fade-out under final logo hold (last 2s)
- Music cue guidance: bundled preset at assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json; tempo 110 BPM. Target strong cues: 8.74s for chat reveal, 13.11s for tools fan-out, 17.47s for stat line.
- Audio-reactive treatment: subtle; use music RMS/bass to make the chat panel border glow breathe gently and the background warmth pulse. No waveform/equalizer visuals.
- Audio-coupled moments:
  - Scene 1 BSOD -- glitch_002 SFX on BSOD appearance
  - Scene 2 typing -- subtle keyboard ticks as user message types out
  - Scene 3 toolkit -- card-slide SFX on each tool card entrance, beat-grid aligned
  - Scene 4 stats -- soft drop_001 on each stat appearance
  - Scene 5 logo -- impactBell_heavy_000 on logo landing
- SFX selection guidance: use sparse, clean sounds that match the polished tone. Card sounds for sequential reveals, keyboard for typing, one bell for the logo moment. Keep volume at 0.65-0.75.
- SFX analysis guidance: C:\Users\ainol\.gemini\config\skills\brag\assets\sfx\sfx-analysis.md; prefer low high-frequency-risk files for polished moments.
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills -- `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. /brag is its own workflow: do not enter the `hyperframes` entry-point intent interview and do not route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in `/brag`.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer unless audio was explicitly disabled or documented as intentionally silent.
- Treat `/brag` audio notes as guidance, not a fixed cue sheet. Choose SFX after the visual animation exists.
- Treat music cue metadata as optional timing hints. Hyperframes decides exact animation timing and should ignore cues that hurt readability, scene pacing, or the product story.
- Major reveals may move toward nearby strong cues within about 0.15s. Smaller entrances may align to nearby beat points within about 0.10s. Use only 1-3 strong cue locks in a 15-25s video unless the edit clearly benefits from more.
- Use SFX to support motion and interaction: card sounds for card-like reveals, short announcement cues for major payoffs, key/click sounds for text or user actions, and restraint when the edit is already busy.
- Honor planned music treatment such as fade-outs, ducking, beat-aligned reveals, or letting a final SFX ring over the music, using the best Hyperframes-supported implementation.
- When music is present and the treatment is not `none`, consider Hyperframes audio-reactive workflow: extract audio data and use RMS/frequency bands for subtle, brand-specific motion. Good targets are glow, depth, background warmth, card presence, title emphasis, or other existing visual elements. Avoid waveform/equalizer visuals, musical-note graphics, generic particle systems, strobing, or heavy pulsing.
- Use local assets for audio and any required runtime/media dependencies when possible.
- Run `hyperframes check` before render -- it is brag's single gate.
