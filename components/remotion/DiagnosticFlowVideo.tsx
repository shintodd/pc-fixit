import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface DiagnosticVideoProps {
  symptom: string;
  category: string;
  hardwareFocus: string;
  debugLed: "DRAM" | "CPU" | "VGA" | "BOOT";
  recommendedAction: string;
  warningText: string;
  primaryColor?: string;
}

export const defaultDiagnosticProps: DiagnosticVideoProps = {
  symptom: "No Display / Fans Spin at 100%",
  category: "Motherboard POST Triage",
  hardwareFocus: "Dual-Channel DDR5 Slots (A2 / B2)",
  debugLed: "DRAM",
  recommendedAction: "Reseat RAM modules into slots 2 & 4 until clips click firmly",
  warningText: "Always disconnect AC wall power before opening chassis latches",
  primaryColor: "#2563eb",
};

export const DiagnosticFlowVideo: React.FC<DiagnosticVideoProps> = ({
  symptom,
  category,
  hardwareFocus,
  debugLed,
  recommendedAction,
  warningText,
  primaryColor = "#2563eb",
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Animation values using Remotion interpolate and spring
  const introSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8, stiffness: 120 },
  });

  const headerOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const boardScale = interpolate(frame, [15, 45], [0.92, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const boardOpacity = interpolate(frame, [15, 35], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // LED pulse simulation driven purely by frame math
  const ledPulse = Math.sin(frame * 0.25) * 0.5 + 0.5;
  const ledColor = frame > 110 ? "#22c55e" : "#ef4444"; // flips from Red (error) to Green (resolved) at frame 110

  // Action card arrival
  const actionTranslateY = interpolate(frame, [50, 80], [60, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const actionOpacity = interpolate(frame, [50, 70], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Highlight stroke animation for RAM slots
  const ramHighlightPulse = interpolate(
    Math.sin(frame * 0.2),
    [-1, 1],
    [0.4, 1]
  );

  // Success stamp at frame 115
  const successScale = spring({
    frame: frame - 110,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 150 },
  });

  const successOpacity = interpolate(frame, [110, 125], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0d1117",
        color: "#f0f6fc",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 48,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      {/* Top Bar: Brand, Category Badge, Progress */}
      <div
        style={{
          opacity: headerOpacity,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(240, 246, 252, 0.12)",
          paddingBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              padding: "6px 14px",
              borderRadius: 9999,
              backgroundColor: primaryColor,
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            pcfix
          </div>
          <div>
            <div style={{ fontSize: 13, color: "#8b949e", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {category}
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: "#ffffff", marginTop: 2 }}>
              {symptom}
            </div>
          </div>
        </div>

        {/* Live Debug LED status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            backgroundColor: "rgba(22, 27, 34, 0.85)",
            border: "1px solid rgba(240, 246, 252, 0.15)",
            borderRadius: 12,
            padding: "8px 16px",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: ledColor,
              boxShadow: `0 0 ${12 * ledPulse}px ${ledColor}`,
            }}
          />
          <div style={{ fontSize: 14, fontWeight: 600, color: "#f0f6fc" }}>
            LED: <span style={{ color: ledColor }}>{debugLed}</span>{" "}
            {frame > 110 ? "(POST PASSED)" : "(ACTIVE ALERT)"}
          </div>
        </div>
      </div>

      {/* Middle Section: Motherboard Schematic + Focus Visual */}
      <div
        style={{
          display: "flex",
          flex: 1,
          gap: 36,
          alignItems: "center",
          marginTop: 24,
          marginBottom: 24,
          opacity: boardOpacity,
          scale: boardScale,
        }}
      >
        {/* Schematic Mockup Box */}
        <div
          style={{
            flex: 1.1,
            height: "100%",
            backgroundColor: "#161b22",
            border: "1px solid rgba(240, 246, 252, 0.12)",
            borderRadius: 20,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#8b949e",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: 16,
            }}
          >
            Motherboard Topography & Slot Mapping
          </div>

          {/* SVG Schematic */}
          <svg
            viewBox="0 0 400 220"
            style={{ width: "100%", height: "auto", overflow: "visible" }}
          >
            {/* Board PCB base */}
            <rect
              x="10"
              y="10"
              width="380"
              height="200"
              rx="12"
              fill="#0d1117"
              stroke="#30363d"
              strokeWidth="2"
            />

            {/* CPU Socket Area */}
            <rect
              x="40"
              y="40"
              width="90"
              height="90"
              rx="6"
              fill="#161b22"
              stroke="#484f58"
              strokeWidth="2"
            />
            <text x="55" y="90" fill="#8b949e" fontSize="11" fontWeight="bold">
              LGA / AM5
            </text>

            {/* RAM Slots: 4 slots (A1, A2, B1, B2) */}
            <g transform="translate(160, 30)">
              <text x="0" y="-8" fill="#8b949e" fontSize="9">
                SLOT A1
              </text>
              <rect x="0" y="0" width="14" height="110" rx="3" fill="#21262d" stroke="#30363d" />

              {/* A2 highlighted */}
              <text x="28" y="-8" fill={primaryColor} fontSize="9" fontWeight="bold">
                SLOT A2 *
              </text>
              <rect
                x="28"
                y="0"
                width="14"
                height="110"
                rx="3"
                fill={primaryColor}
                opacity={ramHighlightPulse}
                stroke="#60a5fa"
                strokeWidth="2"
              />

              <text x="56" y="-8" fill="#8b949e" fontSize="9">
                SLOT B1
              </text>
              <rect x="56" y="0" width="14" height="110" rx="3" fill="#21262d" stroke="#30363d" />

              {/* B2 highlighted */}
              <text x="84" y="-8" fill={primaryColor} fontSize="9" fontWeight="bold">
                SLOT B2 *
              </text>
              <rect
                x="84"
                y="0"
                width="14"
                height="110"
                rx="3"
                fill={primaryColor}
                opacity={ramHighlightPulse}
                stroke="#60a5fa"
                strokeWidth="2"
              />
            </g>

            {/* PCIe Slot */}
            <rect
              x="40"
              y="160"
              width="200"
              height="16"
              rx="4"
              fill="#21262d"
              stroke="#30363d"
            />
            <text x="50" y="172" fill="#8b949e" fontSize="9">
              PCIe 5.0 x16
            </text>

            {/* Debug LEDs cluster */}
            <g transform="translate(320, 35)">
              <rect x="-10" y="-10" width="60" height="90" rx="6" fill="#161b22" stroke="#30363d" />
              <text x="0" y="10" fill="#8b949e" fontSize="9">
                CPU
              </text>
              <circle cx="35" cy="7" r="4" fill="#30363d" />

              <text x="0" y="30" fill={ledColor} fontSize="9" fontWeight="bold">
                DRAM
              </text>
              <circle cx="35" cy="27" r="5" fill={ledColor} />

              <text x="0" y="50" fill="#8b949e" fontSize="9">
                VGA
              </text>
              <circle cx="35" cy="47" r="4" fill="#30363d" />

              <text x="0" y="70" fill="#8b949e" fontSize="9">
                BOOT
              </text>
              <circle cx="35" cy="67" r="4" fill="#30363d" />
            </g>
          </svg>

          <div style={{ marginTop: 16, fontSize: 13, color: "#8b949e" }}>
            Target Component:{" "}
            <span style={{ color: "#ffffff", fontWeight: 600 }}>{hardwareFocus}</span>
          </div>
        </div>

        {/* Action Callout Card */}
        <div
          style={{
            flex: 0.9,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            opacity: actionOpacity,
            translate: `0px ${actionTranslateY}px`,
          }}
        >
          <div
            style={{
              backgroundColor: "rgba(33, 38, 45, 0.95)",
              border: "1px solid rgba(56, 139, 253, 0.4)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: 6,
                backgroundColor: "rgba(56, 139, 253, 0.15)",
                color: "#58a6ff",
                fontSize: 12,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: 10,
              }}
            >
              Step 01 - Physical Verification
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", lineHeight: 1.4 }}>
              {recommendedAction}
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: "#a5d6ff", lineHeight: 1.5 }}>
              Counting right from CPU socket: Slot 2 (A2) and Slot 4 (B2) activate dual-channel bus topology with lowest trace capacitance.
            </div>
          </div>

          {/* Warning Safety Callout */}
          <div
            style={{
              backgroundColor: "rgba(33, 38, 45, 0.6)",
              border: "1px solid rgba(235, 87, 87, 0.3)",
              borderRadius: 12,
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ fontSize: 20 }}>&#9888;</div>
            <div style={{ fontSize: 12, color: "#f85149", lineHeight: 1.4, fontWeight: 500 }}>
              {warningText}
            </div>
          </div>

          {/* Success Notification on Resolution */}
          {frame >= 110 && (
            <div
              style={{
                backgroundColor: "rgba(35, 134, 54, 0.2)",
                border: "1px solid rgba(63, 185, 80, 0.6)",
                borderRadius: 12,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                opacity: successOpacity,
                scale: successScale,
              }}
            >
              <div style={{ fontSize: 22, color: "#3fb950" }}>&#10004;</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#3fb950" }}>
                  POST Cycle Cleared
                </div>
                <div style={{ fontSize: 12, color: "#e6edf3" }}>
                  Training memory timing profile. Initial boot may take up to 60s.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer scrubber & timestamp info */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: "1px solid rgba(240, 246, 252, 0.12)",
          paddingTop: 16,
          fontSize: 12,
          color: "#8b949e",
        }}
      >
        <div>pcfix Automated Diagnostic Engine - Rendered via Remotion React Canvas</div>
        <div>
          Frame: {frame} / 180 ({(frame / fps).toFixed(2)}s / 6.00s)
        </div>
      </div>
    </AbsoluteFill>
  );
};
