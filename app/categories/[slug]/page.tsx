import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { getIssuesByCategory } from "@/lib/mock-data";
import CategoryDetailView from "@/components/CategoryDetailView";
import type { Metadata } from "next";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ slug: cat.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const category = CATEGORIES.find((c) => c.slug === params.slug);

  if (!category) {
    return {
      title: "Category Not Found | pcfix",
      description: "Hardware troubleshooting category not found.",
    };
  }

  const title = `${category.title} Troubleshooting Guides | pcfix`;
  const description = `Explore ${category.count} researched step-by-step guides for ${category.title.toLowerCase()}. ${category.description}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/categories/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `/categories/${params.slug}`,
      siteName: "pcfix",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const category = CATEGORIES.find((c) => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  const issues = getIssuesByCategory(params.slug);

  return <CategoryDetailView category={category} issues={issues} />;
}
