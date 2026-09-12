export type Severity = "info" | "warn" | "critical";

export interface CategoryInfo {
  slug: string;
  title: string;
  description: string;
  severity: Severity;
  count: number;
  label: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    slug: "wont-boot",
    title: "Won't boot",
    description: "Black screen, no POST, stuck on logo",
    severity: "critical",
    count: 24,
    label: "24 researched guides",
  },
  {
    slug: "blue-screen",
    title: "Blue screen (BSOD)",
    description: "Crashes with a stop code",
    severity: "critical",
    count: 24,
    label: "24 researched guides",
  },
  {
    slug: "running-slow",
    title: "Running slow",
    description: "Lag, freezes, long load times",
    severity: "warn",
    count: 24,
    label: "24 researched guides",
  },
  {
    slug: "no-internet",
    title: "No internet",
    description: "Wi-Fi drops, no connection, slow speeds",
    severity: "warn",
    count: 24,
    label: "24 researched guides",
  },
  {
    slug: "overheating",
    title: "Overheating",
    description: "Loud fans, thermal shutdowns",
    severity: "warn",
    count: 24,
    label: "24 researched guides",
  },
  {
    slug: "driver-issues",
    title: "Driver issues",
    description: "GPU, audio, or peripheral not working",
    severity: "info",
    count: 24,
    label: "24 researched guides",
  },
];
