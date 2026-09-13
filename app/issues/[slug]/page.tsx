import { notFound } from "next/navigation";
import { ISSUES, type Severity, type IssueDetail } from "@/lib/mock-data";
import { prisma, isDatabaseAvailable } from "@/lib/prisma";
import IssueDetailView from "@/components/IssueDetailView";

import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return Object.keys(ISSUES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const issue = Object.prototype.hasOwnProperty.call(ISSUES, params.slug)
    ? ISSUES[params.slug]
    : undefined;
  let title = "Troubleshooting Guide";
  let description = "Step-by-step PC hardware and system troubleshooting instructions.";

  if (issue) {
    title = issue.title;
    description = issue.summary;
  } else if (await isDatabaseAvailable()) {
    try {
      const dbIssue = await prisma.issue.findUnique({
        where: { slug: params.slug },
      });
      if (dbIssue) {
        title = dbIssue.title;
        description = dbIssue.summary;
      }
    } catch {
      // Fallback to default
    }
  }

  return {
    title,
    description,
    alternates: {
      canonical: `/issues/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/issues/${params.slug}`,
      siteName: "pcfix",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function IssuePage({ params }: { params: { slug: string } }) {
  let issue: IssueDetail | undefined = Object.prototype.hasOwnProperty.call(
    ISSUES,
    params.slug
  )
    ? ISSUES[params.slug]
    : undefined;

  if (!issue && (await isDatabaseAvailable())) {
    try {
      const dbIssue = await prisma.issue.findUnique({
        where: { slug: params.slug },
        include: {
          error_codes: true,
        },
      });
      if (dbIssue) {
        const steps = Array.isArray(dbIssue.fix_steps)
          ? (dbIssue.fix_steps as any)
          : [];
        issue = {
          slug: dbIssue.slug,
          title: dbIssue.title,
          summary: dbIssue.summary,
          severity: dbIssue.severity as Severity,
          category_slug: dbIssue.category_slug || undefined,
          symptoms: dbIssue.symptoms,
          steps,
          fix_steps: steps,
          related_error_codes: dbIssue.error_codes
            ? dbIssue.error_codes.map((e) => e.code)
            : [],
          source: (dbIssue.source as any) || "researched",
          verified: dbIssue.verified,
        };
      }
    } catch {
      // Fallback to undefined
    }
  }

  if (!issue) notFound();

  return <IssueDetailView issue={issue} />;
}
