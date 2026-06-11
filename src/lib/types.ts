export type Severity = "High" | "Medium" | "Low";

export type Effort = "Low" | "Medium" | "High";

export type OwnerSuggestion =
  | "Sales Rep"
  | "Solution Architect"
  | "Customer FinOps"
  | "Customer Platform Team";

export type OciResource = {
  id: string;
  resourceName: string;
  service: string;
  compartment: string;
  environment: string;
  region: string;
  monthlyCost: number;
  utilizationPct: number;
  owner: string;
  costCenter: string;
  hasLifecyclePolicy: boolean;
  isAttached: boolean;
  isPublic: boolean;
  notes: string;
};

export type DemoCustomer = {
  id: string;
  name: string;
  logoUrl?: string;
  logoAlt?: string;
  industry: string;
  accountTeam: string;
  executiveConcern: string;
  resources: OciResource[];
};

export type Recommendation = {
  id: string;
  category: string;
  resourceId: string;
  resourceName: string;
  service: string;
  compartment: string;
  recommendationTitle: string;
  businessImpact: string;
  technicalAction: string;
  estimatedMonthlySavings: number;
  severity: Severity;
  effort: Effort;
  confidencePct: number;
  ownerSuggestion: OwnerSuggestion;
};
