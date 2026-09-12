import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1117" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "PC Fixit: Diagnose and fix your PC problems",
    template: "%s | PC Fixit",
  },
  description:
    "Describe what's wrong with your PC and get a real diagnosis: guided troubleshooting, plain-language fixes, no fluff.",
  keywords: [
    "PC repair",
    "computer diagnostics",
    "Windows troubleshooting",
    "BSOD fixes",
    "hardware repair",
    "PC won't boot",
  ],
  authors: [{ name: "PC Fixit" }],
  creator: "PC Fixit",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "PC Fixit: Diagnose and fix your PC problems",
    description:
      "Describe what's wrong with your PC and get a real diagnosis: guided troubleshooting, plain-language fixes, no fluff.",
    type: "website",
    locale: "en_US",
    siteName: "PC Fixit",
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Fixit: Diagnose and fix your PC problems",
    description:
      "Describe what's wrong with your PC and get a real diagnosis: guided troubleshooting, plain-language fixes, no fluff.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-inter min-h-screen flex flex-col antialiased bg-surface text-ink dark:bg-dark-surface dark:text-dark-ink`}>
        <ThemeProvider>
          <LanguageProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
            >
              Skip to main content
            </a>
            <Header />
            <main id="main-content" className="flex-1 flex flex-col">{children}</main>
            <Footer />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
