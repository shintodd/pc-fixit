import type { Metadata } from "next";
import Chat from "@/components/Chat";
import { ISSUES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "AI Diagnostician | PC Fixit",
  description:
    "Describe your computer problem in plain words and receive real-time streaming AI diagnostic steps.",
  alternates: {
    canonical: "/troubleshoot",
  },
  openGraph: {
    title: "AI Diagnostician | PC Fixit",
    description:
      "Describe your computer problem in plain words and receive real-time streaming AI diagnostic steps.",
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

