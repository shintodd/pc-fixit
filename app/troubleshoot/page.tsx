import type { Metadata } from "next";
import Chat from "@/components/Chat";
import { ISSUES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "AI Technician | PC Fixit",
  description:
    "Chat directly with your friendly AI PC repair technician to troubleshoot hardware, Windows, or network problems.",
  alternates: {
    canonical: "/troubleshoot",
  },
  openGraph: {
    title: "AI Technician | PC Fixit",
    description:
      "Chat directly with your friendly AI PC repair technician to troubleshoot hardware, Windows, or network problems.",
    type: "website",
    url: "/troubleshoot",
    siteName: "PC Fixit",
  },
};

export default function TroubleshootPage({
  searchParams,
}: {
  searchParams: { q?: string; topic?: string };
}) {
  const guideSlug =
    searchParams.topic && ISSUES[searchParams.topic] ? searchParams.topic : undefined;

  return (
    <Chat
      key={`${searchParams.q || ""}_${searchParams.topic || ""}`}
      initialQuery={searchParams.q}
      topic={searchParams.topic}
      guideSlug={guideSlug}
    />
  );
}

