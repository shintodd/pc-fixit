import wontBootData from "../data/research/wont-boot.json";
import blueScreenData from "../data/research/blue-screen.json";
import runningSlowData from "../data/research/running-slow.json";
import noInternetData from "../data/research/no-internet.json";
import overheatingData from "../data/research/overheating.json";
import driverIssuesData from "../data/research/driver-issues.json";

import { CATEGORIES, type Severity, type CategoryInfo } from "./categories";
export { CATEGORIES };
export type { Severity, CategoryInfo as Category };

export interface FixStep {
  title: string;
  detail: string;
}

export interface IssueDetail {
  slug: string;
  title: string;
  summary: string;
  severity: Severity;
  category_slug?: string;
  symptoms: string[];
  steps: FixStep[];
  fix_steps: FixStep[];
  related_error_codes: number[];
  source?: "researched" | "verified" | "live_search";
  verified?: boolean;
}

// Compile all researched issues into the ISSUES map
const allResearchedIssues: IssueDetail[] = [
  ...wontBootData,
  ...blueScreenData,
  ...runningSlowData,
  ...noInternetData,
  ...overheatingData,
  ...driverIssuesData,
].map((item: any) => {
  const steps: FixStep[] = (item.fix_steps || []).map((s: any) => ({
    title: s.title,
    detail: s.detail || s.instruction || "",
  }));
  return {
    slug: item.slug,
    title: item.title,
    summary: item.summary,
    severity: item.severity as Severity,
    category_slug: item.category_slug,
    symptoms: item.symptoms || [],
    steps,
    fix_steps: steps,
    related_error_codes: Array.isArray(item.related_error_codes)
      ? item.related_error_codes
      : [],
    source: (item.source as any) || "researched",
    verified: Boolean(item.verified),
  };
});

export const ISSUES: Record<string, IssueDetail> = Object.fromEntries(
  allResearchedIssues.map((issue) => [issue.slug, issue])
);

// Actual database/research counts
export const TOTAL_ISSUES_COUNT = allResearchedIssues.length;
export const VERIFIED_ISSUES_COUNT = allResearchedIssues.filter((i) => i.verified === true).length;
export const RESEARCHED_ISSUES_COUNT = allResearchedIssues.filter((i) => i.verified !== true).length;

/**
 * Returns truthful guide counts for a category, differentiating verified vs researched.
 */
export function getCategoryGuideStats(categorySlug: string) {
  const categoryIssues = allResearchedIssues.filter(
    (i) => i.category_slug === categorySlug
  );
  const total = categoryIssues.length;
  const verified = categoryIssues.filter((i) => i.verified === true).length;
  const researched = categoryIssues.filter((i) => i.verified !== true).length;

  let label = `${researched} researched guides`;
  if (verified > 0 && researched > 0) {
    label = `${verified} verified · ${researched} researched`;
  } else if (verified > 0 && researched === 0) {
    label = `${verified} verified guides`;
  } else if (total === 0) {
    label = "Guides available";
  }

  return {
    total,
    verified,
    researched,
    label,
  };
}

export {
  type WizardOption,
  type WizardStep,
  type WizardResolvedIssue,
  WIZARD_TREE,
} from "./wizard-data";


export {
  type ChatMessage,
  diagnoseProblem,
  mockDiagnose,
} from "./diagnose-client";
