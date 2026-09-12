import wizardData from "../data/research/wizard_tree.json";

export interface WizardOption {
  label: string;
  next: string | null;
  next_id?: string | null;
  resolves_to_issue_slug?: string | null;
}

export interface WizardStep {
  id: string;
  question: string;
  options: WizardOption[];
}

export interface WizardResolvedIssue {
  slug: string;
  title: string;
  summary: string;
  steps: { title: string; detail: string }[];
}

export const WIZARD_TREE: Record<string, WizardStep> = Object.fromEntries(
  wizardData.map((node: any) => [
    node.id,
    {
      id: node.id,
      question: node.question,
      options: node.options.map((opt: any) => ({
        label: opt.label,
        next: opt.next_id || null,
        next_id: opt.next_id || null,
        resolves_to_issue_slug: opt.resolves_to_issue_slug || null,
      })),
    },
  ])
);
