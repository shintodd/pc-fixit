import type { Metadata } from "next";
import Wizard from "@/components/Wizard";
import { WIZARD_TREE, type WizardResolvedIssue } from "@/lib/wizard-data";
import { ISSUES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Guided Fix | PC Fixit",
  description:
    "Step-by-step interactive decision tree to pinpoint and fix your PC issues without technical jargon.",
  alternates: {
    canonical: "/wizard",
  },
  openGraph: {
    title: "Guided Fix | PC Fixit",
    description:
      "Step-by-step interactive decision tree to pinpoint and fix your PC issues without technical jargon.",
    type: "website",
    url: "/wizard",
    siteName: "PC Fixit",
  },
};

export default function WizardPage() {
  const resolutions: Record<string, WizardResolvedIssue> = {};
  for (const step of Object.values(WIZARD_TREE)) {
    for (const opt of step.options) {
      if (opt.resolves_to_issue_slug && ISSUES[opt.resolves_to_issue_slug]) {
        const issue = ISSUES[opt.resolves_to_issue_slug];
        resolutions[issue.slug] = {
          slug: issue.slug,
          title: issue.title,
          summary: issue.summary,
          steps: issue.steps.slice(0, 3),
        };
      }
    }
  }

  return <Wizard initialTree={WIZARD_TREE} resolutions={resolutions} />;
}

