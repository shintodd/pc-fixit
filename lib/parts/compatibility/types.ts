export type SeverityLevel = "CRITICAL" | "WARN" | "INFO";

export interface CompatibilityIssue {
  ruleId: string;
  category: "SOCKET" | "RAM" | "FORM_FACTOR" | "DIMENSIONS" | "POWER" | "COOLING" | "STORAGE";
  level: SeverityLevel;
  passed: boolean;
  messageEn: string;
  messageMs: string;
  componentA?: string;
  componentB?: string;
}

export interface CompatibilityReport {
  isCompatible: boolean;
  status: "PASS" | "FAIL" | "WARN";
  estimatedWattage: number;
  recommendedPsuWattage: number;
  checks: CompatibilityIssue[];
}
