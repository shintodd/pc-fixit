import type { Metadata } from "next";
import Chat from "@/components/Chat";
import { ISSUES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "AI Technician",
  description:
    "Chat directly with your friendly AI PC repair technician to troubleshoot hardware, Windows, or network problems.",
  alternates: {
    canonical: "/troubleshoot",
  },
  openGraph: {
    title: "AI Technician | pcfix",
    description:
      "Chat directly with your friendly AI PC repair technician to troubleshoot hardware, Windows, or network problems.",
    type: "website",
    url: "/troubleshoot",
    siteName: "pcfix",
  },
};

export default function TroubleshootPage({
  searchParams,
}: {
  searchParams: { q?: string; topic?: string; hw?: string };
}) {
  // Desktop scanner handoff (pcfix-scanner.exe): ?hw=<compact findings>. Capped to keep the seed message sane.
  const hwSeed = searchParams.hw ? searchParams.hw.slice(0, 2000) : undefined;
  const initialQuery = searchParams.q || hwSeed;

  const guideSlug =
    searchParams.topic && ISSUES[searchParams.topic] ? searchParams.topic : undefined;

  return (
    <Chat
      key={`${initialQuery || ""}_${searchParams.topic || ""}`}
      initialQuery={initialQuery}
      topic={searchParams.topic}
      guideSlug={guideSlug}
    />
  );
}

