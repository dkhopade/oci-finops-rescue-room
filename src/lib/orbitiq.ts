export type AccountType = "Existing" | "Greenfield";

export type PlayType =
  | "Growth"
  | "Risk"
  | "Optimization"
  | "Renewal"
  | "Greenfield";

export type FeedbackStatus =
  | "New"
  | "Accepted"
  | "Rejected"
  | "Snoozed"
  | "Edited"
  | "Converted"
  | "False Positive"
  | "Already Handled";

export type ActionType =
  | "customer_email"
  | "internal_handoff"
  | "crm_task"
  | "jira_ticket"
  | "account_brief"
  | "discovery_brief";

export type SignalType =
  | "Usage Growth"
  | "Spend Spike"
  | "New Service Adoption"
  | "Low Utilization"
  | "Commitment Underuse"
  | "Support Friction"
  | "Negative Sentiment"
  | "Renewal Proximity"
  | "Public Expansion Signal"
  | "Hiring Signal"
  | "Greenfield Architecture Hypothesis";

export type EvidenceItem = {
  id: string;
  type: string;
  source: string;
  date: string;
  headline: string;
  detail: string;
  relatedSignal: SignalType;
  confidenceContribution: number;
};

export type Signal = {
  id: string;
  type: SignalType;
  playType: PlayType;
  source: string;
  title: string;
  description: string;
  metricValue?: string;
  baselineValue?: string;
  changePct?: number;
  detectedAt: string;
  confidence: number;
  linkedRecommendation: string;
};

export type ScoreBreakdown = {
  impact: number;
  momentum: number;
  urgency: number;
  fit: number;
  confidence: number;
};

export type ImpactEstimate = {
  expansionPotential: string;
  savingsOpportunity: string;
  riskSeverity: string;
  forecastTrend: string;
  assumptions: string;
};

export type ActionPlan = {
  sales: string;
  solutionEngineering: string;
  customerSuccess: string;
  finops: string;
  timeline: string;
};

export type GeneratedArtifactTemplate = {
  type: ActionType;
  title: string;
  recipientRole: string;
  tone: string;
  body: string;
  evidenceUsed: string[];
};

export type DemoScenario = {
  label: string;
  before: string;
  after: string;
  demoProof: string[];
};

export type OrbitAccount = {
  id: string;
  name: string;
  logoUrl: string;
  logoAlt: string;
  accountType: AccountType;
  industry: string;
  region: string;
  segment: string;
  accountOwner: string;
  solutionEngineer: string;
  customerSuccessManager?: string;
  renewalDate?: string;
  annualContractValue?: number;
  playType: PlayType;
  recommendedNextAction: string;
  suggestedOwner: string;
  status: FeedbackStatus;
  priorityScore: number;
  scoreBreakdown: ScoreBreakdown;
  estimatedImpact: string;
  impactValue: number;
  spendGrowthPct?: number;
  lastSignalDate: string;
  whyNow: string;
  interpretation: string;
  customerSafeRecommendation: string;
  confidenceRationale: string;
  trustWarning?: string;
  doNotSay: string[];
  evidence: EvidenceItem[];
  signals: Signal[];
  impactEstimate: ImpactEstimate;
  actionPlan: ActionPlan;
  generatedArtifacts: GeneratedArtifactTemplate[];
  demoScenario: DemoScenario;
};

export type GeneratedAction = {
  id: string;
  accountId: string;
  type: ActionType;
  title: string;
  body: string;
  status: "Draft" | "Saved" | "Created";
  timestamp: string;
};

export type WorkflowEvent = {
  id: string;
  accountId: string;
  label: string;
  detail: string;
  timestamp: string;
};

export type DemoThresholds = {
  spendGrowthPct: number;
  usageGrowthPct: number;
  commitmentUtilizationPct: number;
  renewalWindowDays: number;
  greenfieldKeywordCount: number;
};

export type DemoConnector = {
  id: string;
  name: string;
  category: string;
  status: "Connected" | "Needs Auth" | "Draft Only";
  mode: "Read only" | "Read + draft write";
  syncCadence: string;
  lastSyncAt: string;
  owner: string;
  description: string;
  signalCoverage: string[];
  demoEndpoint: string;
  authMethod: string;
};

export const demoToday = "2026-06-11";

export const defaultThresholds: DemoThresholds = {
  spendGrowthPct: 25,
  usageGrowthPct: 30,
  commitmentUtilizationPct: 70,
  renewalWindowDays: 90,
  greenfieldKeywordCount: 2,
};

export const actionTypeLabels: Record<ActionType, string> = {
  customer_email: "Customer Email",
  internal_handoff: "Internal Handoff",
  crm_task: "CRM Task",
  jira_ticket: "Jira Ticket",
  account_brief: "Account Brief",
  discovery_brief: "Discovery Brief",
};

export const statusDescriptions: Record<FeedbackStatus, string> = {
  New: "Awaiting owner review",
  Accepted: "Approved for follow-up",
  Rejected: "Dismissed by reviewer",
  Snoozed: "Deferred for later review",
  Edited: "Recommendation revised",
  Converted: "Converted to pipeline motion",
  "False Positive": "Labeled for model learning",
  "Already Handled": "No further action required",
};

export const demoConnectors: DemoConnector[] = [
  {
    id: "cloud-spend-platform",
    name: "Cloud Spend Platform",
    category: "Usage, billing, and utilization",
    status: "Connected",
    mode: "Read only",
    syncCadence: "Daily at 08:00",
    lastSyncAt: "2026-06-11 08:00",
    owner: "FinOps",
    description:
      "Spend, usage, utilization, and service-adoption signals from cloud billing and usage APIs.",
    signalCoverage: ["Spend Spike", "Usage Growth", "New Service Adoption", "Low Utilization"],
    demoEndpoint: "spend-api.demo.orbitiq.local",
    authMethod: "Service account",
  },
  {
    id: "commitment-management",
    name: "Commitment Management",
    category: "Contracts and commitments",
    status: "Connected",
    mode: "Read only",
    syncCadence: "Daily at 08:05",
    lastSyncAt: "2026-06-11 08:05",
    owner: "Sales Operations",
    description:
      "Commitment utilization, renewal windows, account ownership, and contract context.",
    signalCoverage: ["Commitment Underuse", "Renewal Proximity"],
    demoEndpoint: "contracts.demo.orbitiq.local",
    authMethod: "OAuth",
  },
  {
    id: "crm",
    name: "CRM",
    category: "Account and opportunity context",
    status: "Connected",
    mode: "Read + draft write",
    syncCadence: "Every 4 hours",
    lastSyncAt: "2026-06-11 08:10",
    owner: "Revenue Operations",
    description:
      "Account notes, initiatives, stakeholders, renewal dates, and draft CRM tasks.",
    signalCoverage: ["Usage Growth", "Renewal Proximity"],
    demoEndpoint: "crm.demo.orbitiq.local",
    authMethod: "OAuth",
  },
  {
    id: "jira-service-management",
    name: "Jira Service Management",
    category: "Support and engineering workflow",
    status: "Draft Only",
    mode: "Read + draft write",
    syncCadence: "Hourly",
    lastSyncAt: "2026-06-11 08:15",
    owner: "Support Operations",
    description:
      "Support friction, open-ticket sentiment, and draft technical review tickets.",
    signalCoverage: ["Support Friction", "Negative Sentiment"],
    demoEndpoint: "jira.demo.orbitiq.local",
    authMethod: "API token",
  },
  {
    id: "public-web-research",
    name: "Public Web Research",
    category: "Market and hiring intelligence",
    status: "Connected",
    mode: "Read only",
    syncCadence: "Daily at 07:30",
    lastSyncAt: "2026-06-11 07:30",
    owner: "Sales Development",
    description:
      "Public hiring, company-news, and technology-keyword signals for greenfield discovery.",
    signalCoverage: [
      "Hiring Signal",
      "Public Expansion Signal",
      "Greenfield Architecture Hypothesis",
    ],
    demoEndpoint: "research.demo.orbitiq.local",
    authMethod: "Managed crawler",
  },
];

export const initialWorkflowEvents: WorkflowEvent[] = [
  {
    id: "event-acme-seeded",
    accountId: "acme-retail",
    label: "Autonomous scan",
    detail: "Usage, commitment, and CRM signals produced a growth play.",
    timestamp: "2026-06-11 08:00",
  },
  {
    id: "event-beta-seeded",
    accountId: "beta-health",
    label: "Autonomous scan",
    detail: "Usage, support, renewal, and CRM signals produced a save play.",
    timestamp: "2026-06-11 08:00",
  },
  {
    id: "event-nova-seeded",
    accountId: "nova-logistics",
    label: "Autonomous scan",
    detail: "Public research signals produced a greenfield discovery play.",
    timestamp: "2026-06-11 08:00",
  },
];

export const rubricProofPoints = [
  {
    category: "Demand reality",
    proof:
      "Cloud account teams lose 90-120 minutes per account stitching together billing, support, CRM, and public signals before deciding who needs attention.",
  },
  {
    category: "Target customer",
    proof:
      "The first wedge is sales and pre-sales engineering teams that own expansion, renewal confidence, and architecture-review motions.",
  },
  {
    category: "Product fit",
    proof:
      "The home experience is a daily action queue with a click-through account plan, evidence, decision, draft, and downstream handoff.",
  },
  {
    category: "Demo proof",
    proof:
      "The MVP runs locally with deterministic data, three journeys, nine source-backed signals, generated drafts, and workflow state.",
  },
  {
    category: "Investment readiness",
    proof:
      "The differentiated loop captures accepted, adjusted, created, and dismissed actions so the product can compound from workflow data.",
  },
];

export const demoImpactMetrics = [
  {
    label: "Modeled queue impact",
    value: "$1.18M",
    detail:
      "Pipeline, renewal protection, and savings represented by the three seeded account journeys.",
  },
  {
    label: "Manual review avoided",
    value: "90-120 min/account",
    detail:
      "Current account-team workflow across spend, CRM, support, renewal, and public-research systems.",
  },
  {
    label: "Demo signal coverage",
    value: "9 signals / 5 connectors",
    detail:
      "Cloud spend, commitment, CRM, Jira support, and public research sources are represented.",
  },
  {
    label: "Initial wedge",
    value: "Sales + pre-sales",
    detail:
      "Daily expansion, save, and architecture-review queue before broader CS and FinOps rollout.",
  },
];

export const wedgeProof = [
  {
    label: "Smallest useful product",
    detail:
      "A daily account-action queue for sales and solution engineers who already own customer expansion and renewal conversations.",
  },
  {
    label: "Why it wins the first workflow",
    detail:
      "It replaces manual account research with ranked evidence, a customer-safe decision, and a ready downstream draft.",
  },
  {
    label: "Why it expands",
    detail:
      "Every accepted, adjusted, created, and dismissed action becomes outcome data for CSM, FinOps, partner, and leadership workflows.",
  },
];

export const readinessProof = [
  {
    label: "Production-shaped",
    detail:
      "Typed account, signal, evidence, connector, scoring, artifact, and workflow models; deterministic seed validation; production build passes.",
  },
  {
    label: "Still demo-grade",
    detail:
      "No authentication, live integrations, external writes, durable database, or learned model loop is enabled in this hackathon MVP.",
  },
  {
    label: "Next hardening path",
    detail:
      "Add tenant auth, connector OAuth, database persistence, evaluation traces, audit logging, and approval-gated writes to CRM/Jira/Slack.",
  },
];

export const demoAccounts: OrbitAccount[] = [
  {
    id: "acme-retail",
    name: "Acme Retail",
    logoUrl: "/logos/acme-retail.svg",
    logoAlt: "Acme Retail logo",
    accountType: "Existing",
    industry: "Retail",
    region: "North America",
    segment: "Enterprise",
    accountOwner: "Avery Chen",
    solutionEngineer: "Sam Patel",
    customerSuccessManager: "Jordan Lee",
    renewalDate: "2026-09-22",
    annualContractValue: 850000,
    playType: "Growth",
    recommendedNextAction: "Schedule a data and AI architecture review",
    suggestedOwner: "Solution Engineer",
    status: "New",
    priorityScore: 87,
    scoreBreakdown: {
      impact: 88,
      momentum: 94,
      urgency: 70,
      fit: 91,
      confidence: 84,
    },
    estimatedImpact: "$180K expansion potential plus $42K guardrail savings",
    impactValue: 222000,
    spendGrowthPct: 38,
    lastSignalDate: "2026-05-31",
    whyNow:
      "Object storage spend rose 38%, GPU usage appeared for the first time, and CRM notes mention a personalization initiative while commitment utilization is only 61%.",
    interpretation:
      "Observed usage suggests Acme may be moving into data and AI workloads. The capacity plan should be shaped before momentum turns into inefficient spend.",
    customerSafeRecommendation:
      "Lead with an architecture and guardrails conversation that helps Acme scale the personalization program with cost confidence.",
    confidenceRationale:
      "High confidence because usage, spend, commitment, and CRM evidence point in the same direction.",
    trustWarning:
      "Do not frame this as an upsell before confirming workload goals and GPU governance needs.",
    doNotSay: [
      "Acme has already committed to an AI platform purchase.",
      "The new GPU usage is production without customer confirmation.",
      "Savings are guaranteed.",
    ],
    evidence: [
      {
        id: "acme-usage-storage",
        type: "Metric change",
        source: "Cloud Spend Platform",
        date: "2026-05-31",
        headline: "Object Storage spend increased 38%",
        detail:
          "Storage moved from $18,000 on 2026-05-01 to $24,840 on 2026-05-31.",
        relatedSignal: "Spend Spike",
        confidenceContribution: 26,
      },
      {
        id: "acme-usage-gpu",
        type: "New service",
        source: "Cloud Spend Platform",
        date: "2026-05-31",
        headline: "GPU Compute appeared for the first time",
        detail:
          "Current period includes 420 GPU-hours and $12,600 of spend with no prior baseline.",
        relatedSignal: "New Service Adoption",
        confidenceContribution: 22,
      },
      {
        id: "acme-usage-transfer",
        type: "Metric change",
        source: "Cloud Spend Platform",
        date: "2026-05-31",
        headline: "Data transfer increased 27%",
        detail:
          "Data transfer reached 87 TB month over month, consistent with a larger data workload.",
        relatedSignal: "Usage Growth",
        confidenceContribution: 16,
      },
      {
        id: "acme-commit",
        type: "Commitment metric",
        source: "Commitment Management",
        date: "2026-05-31",
        headline: "Annual commitment utilization is 61%",
        detail:
          "Object Storage annual commit shows $61,000 used against $100,000 committed.",
        relatedSignal: "Commitment Underuse",
        confidenceContribution: 18,
      },
      {
        id: "acme-crm",
        type: "CRM note",
        source: "CRM",
        date: "2026-05-27",
        headline: "Personalization initiative mentioned",
        detail:
          "Call note says the customer asked about AI recommendations for product discovery.",
        relatedSignal: "Usage Growth",
        confidenceContribution: 18,
      },
    ],
    signals: [
      {
        id: "sig-acme-storage",
        type: "Spend Spike",
        playType: "Growth",
        source: "Cloud Spend Platform",
        title: "Object Storage spend growth",
        description:
          "30-day object storage spend exceeded the 25% threshold and reached 38%.",
        metricValue: "$24,840",
        baselineValue: "$18,000",
        changePct: 38,
        detectedAt: "2026-05-31",
        confidence: 86,
        linkedRecommendation: "Data and AI architecture review",
      },
      {
        id: "sig-acme-gpu",
        type: "New Service Adoption",
        playType: "Growth",
        source: "Cloud Spend Platform",
        title: "GPU usage appeared",
        description:
          "GPU Compute is present in the current period and absent from the prior period.",
        metricValue: "420 GPU-hours",
        baselineValue: "0 GPU-hours",
        detectedAt: "2026-05-31",
        confidence: 84,
        linkedRecommendation: "GPU cost guardrail review",
      },
      {
        id: "sig-acme-commit",
        type: "Commitment Underuse",
        playType: "Optimization",
        source: "Commitment Management",
        title: "Commitment utilization below threshold",
        description:
          "Object Storage commitment utilization is 61%, below the 70% demo threshold.",
        metricValue: "61%",
        baselineValue: "70% threshold",
        detectedAt: "2026-05-31",
        confidence: 82,
        linkedRecommendation: "Capacity and commitment planning",
      },
    ],
    impactEstimate: {
      expansionPotential: "$180K pipeline hypothesis from data and AI workload fit",
      savingsOpportunity: "$42K annualized guardrail and commitment planning upside",
      riskSeverity: "Medium if growth continues without governance",
      forecastTrend: "90-day spend trend could reach $221K if current growth persists",
      assumptions:
        "Uses observed storage, GPU, data transfer, and commitment signals. It does not assume a confirmed buying project.",
    },
    actionPlan: {
      sales:
        "Confirm business sponsor for personalization and position the meeting as a value planning session.",
      solutionEngineering:
        "Review data platform, GPU governance, and reference architecture options.",
      customerSuccess:
        "Capture success criteria for product discovery and customer experience metrics.",
      finops:
        "Model commitment utilization and cost guardrails before GPU usage scales.",
      timeline: "Open outreach today, run architecture review within 10 business days.",
    },
    generatedArtifacts: [
      {
        type: "customer_email",
        title: "Draft email to Acme technical sponsor",
        recipientRole: "Technical sponsor",
        tone: "Helpful advisory",
        evidenceUsed: ["acme-usage-storage", "acme-usage-gpu", "acme-crm"],
        body: `Subject: Planning support for Acme's personalization workload

Hi,

We noticed a few usage changes that may be worth reviewing together: Object Storage spend increased from $18,000 to $24,840 in May, GPU Compute appeared for the first time, and your team recently mentioned a personalization initiative.

Rather than treat this as a sales conversation, I would suggest a short architecture review focused on data movement, GPU guardrails, and commitment planning. The goal would be to help the workload scale with predictable cost and performance before usage accelerates.

Would next week work for a 45-minute session with our solution engineer?`,
      },
      {
        type: "internal_handoff",
        title: "SE handoff for Acme growth play",
        recipientRole: "Solution engineering",
        tone: "Specific internal brief",
        evidenceUsed: ["acme-usage-storage", "acme-usage-gpu", "acme-commit"],
        body: `Account: Acme Retail
Play: Growth
Why now: Object Storage spend is up 38%, GPU Compute appeared for the first time, and annual commitment utilization is 61%.

Ask: Prepare a data and AI architecture review covering GPU guardrails, storage lifecycle planning, data-transfer patterns, and commitment options.

Questions to investigate:
- Is the GPU usage experimentation, batch training, or production inference?
- What data sources support the personalization initiative?
- Which cost guardrails should be in place before usage scales?

Customer-safe framing: Help Acme scale the personalization initiative with cost confidence. Do not imply they have already committed to an AI purchase.`,
      },
      {
        type: "crm_task",
        title: "CRM task: Acme architecture review",
        recipientRole: "Account owner",
        tone: "Operational",
        evidenceUsed: ["acme-crm", "acme-usage-gpu"],
        body: `Task: Schedule Acme Retail data and AI architecture review
Owner: Avery Chen
Due date: 2026-06-18
Priority: High

Description: Follow up on the 2026-05-27 CRM note about personalization. Anchor the outreach in observed usage: GPU Compute appeared in May and Object Storage spend increased 38%. Include Sam Patel for technical discovery and FinOps guardrails.`,
      },
      {
        type: "jira_ticket",
        title: "Architecture review ticket: Acme personalization workload",
        recipientRole: "Architecture review queue",
        tone: "Technical",
        evidenceUsed: ["acme-usage-storage", "acme-usage-gpu", "acme-usage-transfer"],
        body: `Title: Review Acme Retail data and AI workload architecture

Triggering signals: Object Storage spend up 38%, GPU Compute newly adopted, Data Transfer up 27%.

Technical hypothesis: Acme may be expanding a personalization or product discovery workload that needs cost guardrails, storage lifecycle review, and GPU usage controls.

Requested review:
- Validate workload pattern and environment.
- Review GPU shape selection and scheduling.
- Assess object storage lifecycle and data egress controls.
- Recommend commitment planning options.

Success criteria: Customer leaves with a clear scale plan, risk list, and next-step estimate.`,
      },
      {
        type: "account_brief",
        title: "Acme account brief",
        recipientRole: "Account team",
        tone: "Executive concise",
        evidenceUsed: ["acme-usage-storage", "acme-commit", "acme-crm"],
        body: `Acme Retail is showing usage momentum consistent with a data and AI expansion motion. Storage spend increased 38%, GPU usage appeared for the first time, data transfer increased 27%, and CRM notes mention a personalization initiative. The customer-safe motion is an architecture and cost-confidence review, not a hard upsell. Suggested owner: Solution Engineer with AE support.`,
      },
      {
        type: "discovery_brief",
        title: "Acme discovery call plan",
        recipientRole: "SE and AE",
        tone: "Discovery",
        evidenceUsed: ["acme-crm", "acme-usage-gpu"],
        body: `Discovery objective: Understand whether the personalization initiative is experimentation, production rollout, or capacity planning.

Questions:
- What outcomes define success for the personalization initiative?
- Which teams own the data pipeline and GPU workloads?
- What cost thresholds would trigger governance concerns?
- Are there planned launch dates or seasonal peaks?

Architecture themes: Data platform scalability, GPU guardrails, object storage lifecycle, and commitment planning.`,
      },
    ],
    demoScenario: {
      label: "Existing customer growth",
      before:
        "The account team manually checks billing tools, CRM notes, and usage dashboards to notice expansion momentum.",
      after:
        "OrbitIQ ranks Acme near the top, explains the evidence, and drafts an architecture-review motion.",
      demoProof: [
        "Growth play appears in the ranked queue.",
        "Evidence separates usage metrics from CRM context.",
        "Customer email avoids unsupported claims.",
        "Engineering ticket can be prepared as a draft.",
      ],
    },
  },
  {
    id: "beta-health",
    name: "Beta Health",
    logoUrl: "/logos/beta-health.svg",
    logoAlt: "Beta Health logo",
    accountType: "Existing",
    industry: "Healthcare",
    region: "North America",
    segment: "Enterprise",
    accountOwner: "Morgan Smith",
    solutionEngineer: "Riley Garcia",
    customerSuccessManager: "Taylor Kim",
    renewalDate: "2026-08-23",
    annualContractValue: 620000,
    playType: "Risk",
    recommendedNextAction: "Prepare a rightsizing and renewal confidence review",
    suggestedOwner: "Customer Success Manager",
    status: "New",
    priorityScore: 91,
    scoreBreakdown: {
      impact: 86,
      momentum: 78,
      urgency: 97,
      fit: 89,
      confidence: 86,
    },
    estimatedImpact: "$620K renewal protected plus $96K savings opportunity",
    impactValue: 716000,
    spendGrowthPct: 31,
    lastSignalDate: "2026-05-31",
    whyNow:
      "Spend increased 31%, utilization fell to 45%, support tickets mention latency and cost surprises, and renewal is on 2026-08-23.",
    interpretation:
      "Observed spend growth and low utilization point to inefficient architecture or misconfigured capacity. Negative support context makes this a retention motion, not an upsell.",
    customerSafeRecommendation:
      "Lead with performance, reliability, and cost confidence. The recommended motion is a save and optimization plan before renewal.",
    confidenceRationale:
      "High confidence because structured usage data, support tickets, CRM notes, and renewal timing all indicate risk.",
    trustWarning:
      "Customer trust guardrail: prioritize optimization and renewal confidence before expansion asks.",
    doNotSay: [
      "Beta Health is overspending because of customer error.",
      "Rightsizing will solve all performance issues.",
      "The renewal is lost without immediate action.",
    ],
    evidence: [
      {
        id: "beta-spend",
        type: "Metric change",
        source: "Cloud Spend Platform",
        date: "2026-05-31",
        headline: "Compute spend increased 31%",
        detail:
          "Compute spend moved from $36,000 on 2026-05-01 to $47,160 on 2026-05-31.",
        relatedSignal: "Spend Spike",
        confidenceContribution: 22,
      },
      {
        id: "beta-utilization",
        type: "Commitment metric",
        source: "Commitment Management",
        date: "2026-05-31",
        headline: "Compute utilization is 45%",
        detail:
          "Annual compute commit shows $40,500 used against $90,000 committed.",
        relatedSignal: "Low Utilization",
        confidenceContribution: 20,
      },
      {
        id: "beta-support-latency",
        type: "Support ticket",
        source: "Jira Service Management",
        date: "2026-05-19",
        headline: "Database latency issue remains open",
        detail:
          "Customer reports intermittent latency during peak reporting windows. Sentiment is negative.",
        relatedSignal: "Support Friction",
        confidenceContribution: 20,
      },
      {
        id: "beta-support-cost",
        type: "Support ticket",
        source: "Jira Service Management",
        date: "2026-05-24",
        headline: "Unexpected compute cost increase",
        detail:
          "Customer asks why compute cost increased while application traffic stayed flat.",
        relatedSignal: "Negative Sentiment",
        confidenceContribution: 18,
      },
      {
        id: "beta-crm",
        type: "CRM note",
        source: "CRM",
        date: "2026-05-28",
        headline: "Cost predictability raised before renewal",
        detail:
          "Customer wants better cost predictability before renewal and raised performance concerns.",
        relatedSignal: "Renewal Proximity",
        confidenceContribution: 16,
      },
    ],
    signals: [
      {
        id: "sig-beta-spend",
        type: "Spend Spike",
        playType: "Risk",
        source: "Cloud Spend Platform",
        title: "Spend growth with low utilization",
        description:
          "Compute spend grew 31%, exceeding the 25% threshold, while utilization is only 45%.",
        metricValue: "$47,160",
        baselineValue: "$36,000",
        changePct: 31,
        detectedAt: "2026-05-31",
        confidence: 87,
        linkedRecommendation: "Rightsizing and cost confidence review",
      },
      {
        id: "sig-beta-support",
        type: "Support Friction",
        playType: "Risk",
        source: "Jira Service Management",
        title: "Negative support friction",
        description:
          "Open tickets include latency and cost surprise language with negative sentiment.",
        metricValue: "2 open tickets",
        detectedAt: "2026-05-24",
        confidence: 86,
        linkedRecommendation: "Internal risk review",
      },
      {
        id: "sig-beta-renewal",
        type: "Renewal Proximity",
        playType: "Renewal",
        source: "CRM",
        title: "Renewal within 90-day window",
        description:
          "Renewal date is 2026-08-23, inside the configured 90-day demo threshold.",
        metricValue: "2026-08-23",
        baselineValue: "2026-09-09 threshold",
        detectedAt: "2026-06-11",
        confidence: 91,
        linkedRecommendation: "Executive business review",
      },
    ],
    impactEstimate: {
      expansionPotential: "No expansion ask recommended until trust issues are addressed",
      savingsOpportunity: "$96K annualized rightsizing and commitment optimization hypothesis",
      riskSeverity: "High because support friction is close to renewal",
      forecastTrend: "Spend trend could remain elevated while utilization stays below 50%",
      assumptions:
        "Uses spend growth, low utilization, support language, and renewal date. It does not diagnose root cause without technical review.",
    },
    actionPlan: {
      sales:
        "Avoid aggressive upsell. Align executive sponsor on a cost and reliability confidence plan.",
      solutionEngineering:
        "Inspect database latency pattern, compute shape fit, and capacity configuration.",
      customerSuccess:
        "Prepare renewal confidence agenda and track support-ticket closure risk.",
      finops:
        "Build rightsizing and commitment optimization options with customer approval.",
      timeline: "Open internal risk review today, customer EBR within five business days.",
    },
    generatedArtifacts: [
      {
        type: "customer_email",
        title: "Draft email to Beta Health sponsor",
        recipientRole: "Executive sponsor",
        tone: "Supportive and advisory",
        evidenceUsed: ["beta-spend", "beta-support-latency", "beta-crm"],
        body: `Subject: Cost and reliability review before renewal planning

Hi,

Ahead of your August 23 renewal, I would like to set up a focused review on cost predictability and performance confidence.

The reason for raising this now is specific: May compute spend increased from $36,000 to $47,160, current utilization is tracking around 45%, and recent support notes mention latency during peak reporting windows. Those facts suggest there may be a rightsizing or configuration opportunity worth reviewing before renewal discussions get too far along.

Would you be open to a working session with our customer success and solution engineering team this week? The goal is to identify practical options, not to push a new purchase.`,
      },
      {
        type: "internal_handoff",
        title: "CSM handoff for Beta save motion",
        recipientRole: "Customer success",
        tone: "Urgent internal brief",
        evidenceUsed: ["beta-support-cost", "beta-support-latency", "beta-crm"],
        body: `Account: Beta Health
Play: Risk/save
Why now: Spend is up 31%, utilization is 45%, two negative support tickets are open, and renewal is on 2026-08-23.

Ask: Lead an EBR-style cost and reliability review. Include SE and FinOps support before any commercial ask.

Questions to investigate:
- What workload changed during the spend increase?
- Are latency issues tied to database sizing, query patterns, or capacity scheduling?
- Which actions would restore confidence before renewal?

Customer-safe framing: We are helping Beta Health regain cost predictability and performance confidence.`,
      },
      {
        type: "crm_task",
        title: "CRM task: Beta renewal confidence review",
        recipientRole: "Customer success manager",
        tone: "Operational",
        evidenceUsed: ["beta-crm", "beta-spend"],
        body: `Task: Schedule Beta Health renewal confidence review
Owner: Taylor Kim
Due date: 2026-06-14
Priority: High

Description: Customer raised cost predictability and performance concerns before renewal. Use observed spend growth of 31%, utilization at 45%, and open latency/cost tickets as the evidence base. Keep the motion focused on reliability and cost confidence.`,
      },
      {
        type: "jira_ticket",
        title: "Risk review ticket: Beta Health latency and cost spike",
        recipientRole: "Solution review queue",
        tone: "Technical",
        evidenceUsed: ["beta-support-latency", "beta-spend", "beta-utilization"],
        body: `Title: Investigate Beta Health compute spend increase and reporting latency

Triggering signals: Compute spend up 31%, utilization at 45%, open latency ticket, negative cost-surprise ticket, renewal on 2026-08-23.

Technical hypothesis: Current compute/database sizing or scheduling may be driving higher spend without matching traffic growth.

Requested review:
- Compare workload demand to provisioned capacity.
- Inspect database latency during peak reporting windows.
- Identify rightsizing and commitment optimization options.
- Document customer-safe recommendations for EBR.

Success criteria: Provide options that improve performance confidence and reduce avoidable spend before renewal.`,
      },
      {
        type: "account_brief",
        title: "Beta Health risk brief",
        recipientRole: "Account team",
        tone: "Executive concise",
        evidenceUsed: ["beta-spend", "beta-support-cost", "beta-crm"],
        body: `Beta Health should be treated as a risk/save motion. Spend increased 31%, utilization is 45%, open support tickets mention latency and unexpected compute cost, and the customer asked for cost predictability before the 2026-08-23 renewal. Recommended owner: Customer Success Manager with SE and FinOps support.`,
      },
      {
        type: "discovery_brief",
        title: "Beta Health EBR plan",
        recipientRole: "CSM and SE",
        tone: "Renewal risk planning",
        evidenceUsed: ["beta-support-latency", "beta-crm"],
        body: `EBR objective: Rebuild cost and performance confidence before renewal.

Discussion points:
- Recent compute spend increase and customer perception.
- Current utilization and potential rightsizing options.
- Open latency concerns during reporting windows.
- Commitments, coverage, and forecast guardrails.

Risks and assumptions: Evidence indicates risk but does not prove root cause. Technical review should separate infrastructure sizing, application behavior, and reporting workload patterns.`,
      },
    ],
    demoScenario: {
      label: "Existing customer risk and save",
      before:
        "The team discovers cost and support friction late, often during renewal escalation.",
      after:
        "OrbitIQ prioritizes Beta above growth plays because urgency, renewal proximity, and support friction are high.",
      demoProof: [
        "Risk score outranks growth because urgency is high.",
        "Customer trust warning recommends optimization before upsell.",
        "Draft email uses supportive language.",
        "Feedback can mark the play accepted, snoozed, or already handled.",
      ],
    },
  },
  {
    id: "nova-logistics",
    name: "Nova Logistics",
    logoUrl: "/logos/nova-logistics.svg",
    logoAlt: "Nova Logistics logo",
    accountType: "Greenfield",
    industry: "Logistics",
    region: "EMEA",
    segment: "Mid-Market",
    accountOwner: "Casey Nguyen",
    solutionEngineer: "Dev Singh",
    playType: "Greenfield",
    recommendedNextAction: "Open a discovery conversation on data-platform modernization",
    suggestedOwner: "Account Executive",
    status: "New",
    priorityScore: 73,
    scoreBreakdown: {
      impact: 72,
      momentum: 76,
      urgency: 62,
      fit: 82,
      confidence: 64,
    },
    estimatedImpact: "$240K qualified opportunity hypothesis",
    impactValue: 240000,
    lastSignalDate: "2026-05-26",
    whyNow:
      "Public snippets mention regional expansion, data engineering hiring, platform engineering hiring, Kubernetes, cloud migration, and route optimization.",
    interpretation:
      "This is a hypothesis, not a confirmed project. Nova may be preparing a data-platform modernization or cloud migration initiative tied to logistics analytics.",
    customerSafeRecommendation:
      "Frame outreach as a hypothesis based on public signals and ask discovery questions about expansion, analytics, and cost-governed AI experimentation.",
    confidenceRationale:
      "Medium confidence because evidence is public and inferential, but multiple independent snippets point to the same modernization theme.",
    trustWarning:
      "Greenfield claims must be phrased as hypotheses. Do not imply internal usage, spend, or confirmed initiative data.",
    doNotSay: [
      "Nova is already migrating to our cloud.",
      "Nova has budget approved.",
      "We know their internal architecture.",
    ],
    evidence: [
      {
        id: "nova-hiring-data",
        type: "Research snippet",
        source: "Public Web Research",
        date: "2026-05-20",
        headline: "Hiring data engineers and platform engineers",
        detail:
          "Public hiring snippet says Nova is hiring data engineers and platform engineers to support analytics modernization.",
        relatedSignal: "Hiring Signal",
        confidenceContribution: 24,
      },
      {
        id: "nova-news-expansion",
        type: "Research snippet",
        source: "Public Web Research",
        date: "2026-05-15",
        headline: "Regional expansion and route optimization",
        detail:
          "Company news snippet mentions regional expansion and investment in route optimization capabilities.",
        relatedSignal: "Public Expansion Signal",
        confidenceContribution: 20,
      },
      {
        id: "nova-job-cloud",
        type: "Research snippet",
        source: "Public Web Research",
        date: "2026-05-26",
        headline: "Kubernetes, cloud migration, and scalable data platform",
        detail:
          "Job post mentions Kubernetes, cloud migration, and scalable data platform experience.",
        relatedSignal: "Greenfield Architecture Hypothesis",
        confidenceContribution: 20,
      },
    ],
    signals: [
      {
        id: "sig-nova-hiring",
        type: "Hiring Signal",
        playType: "Greenfield",
        source: "Public Web Research",
        title: "Data and platform engineering hiring",
        description:
          "Research snippet contains data engineer and platform engineer keywords.",
        metricValue: "2 strategic hiring keywords",
        baselineValue: "2 keyword threshold",
        detectedAt: "2026-05-20",
        confidence: 66,
        linkedRecommendation: "Data platform discovery",
      },
      {
        id: "sig-nova-expansion",
        type: "Public Expansion Signal",
        playType: "Greenfield",
        source: "Public Web Research",
        title: "Regional expansion signal",
        description:
          "Public news references regional expansion and route optimization investment.",
        metricValue: "2 public themes",
        detectedAt: "2026-05-15",
        confidence: 62,
        linkedRecommendation: "Logistics analytics outreach",
      },
      {
        id: "sig-nova-architecture",
        type: "Greenfield Architecture Hypothesis",
        playType: "Greenfield",
        source: "Public Web Research",
        title: "Cloud migration and Kubernetes language",
        description:
          "Public job post includes Kubernetes, cloud migration, and scalable data platform terms.",
        metricValue: "3 architecture keywords",
        detectedAt: "2026-05-26",
        confidence: 65,
        linkedRecommendation: "Modernization discovery call",
      },
    ],
    impactEstimate: {
      expansionPotential: "$240K discovery-stage opportunity hypothesis",
      savingsOpportunity: "Unknown until discovery validates current platform and spend",
      riskSeverity: "Low customer risk, medium opportunity timing risk",
      forecastTrend: "No internal usage forecast available for greenfield account",
      assumptions:
        "Only public snippets are used. Confidence is intentionally lower and the recommended action is discovery.",
    },
    actionPlan: {
      sales:
        "Send personalized discovery outreach grounded in public hiring and expansion signals.",
      solutionEngineering:
        "Prepare architecture themes for logistics analytics, Kubernetes, migration, and cost-governed AI experiments.",
      customerSuccess:
        "Not assigned until account becomes an active opportunity.",
      finops:
        "Bring a cost-governed experimentation narrative rather than a savings claim.",
      timeline: "Send outreach this week, qualify discovery in the next two weeks.",
    },
    generatedArtifacts: [
      {
        type: "customer_email",
        title: "Draft email to Nova platform leader",
        recipientRole: "Platform or data leader",
        tone: "Hypothesis-led discovery",
        evidenceUsed: ["nova-hiring-data", "nova-news-expansion", "nova-job-cloud"],
        body: `Subject: Data platform ideas for Nova's expansion plans

Hi,

I saw public signals that Nova Logistics is expanding regionally and hiring for data engineering, platform engineering, Kubernetes, and cloud migration experience. Based only on those public signals, it looks like your team may be investing in analytics modernization or route optimization.

If that is directionally right, we may be able to share patterns for scalable logistics analytics, governed AI experimentation, and cost-aware cloud migration.

Would a short discovery conversation be useful? I would keep it practical: what is changing in the platform, where analytics performance matters, and how to keep experimentation cost controlled.`,
      },
      {
        type: "internal_handoff",
        title: "AE handoff for Nova greenfield hypothesis",
        recipientRole: "Account executive",
        tone: "Prospecting brief",
        evidenceUsed: ["nova-hiring-data", "nova-news-expansion", "nova-job-cloud"],
        body: `Account: Nova Logistics
Play: Greenfield discovery
Why now: Public snippets mention regional expansion, route optimization, data engineering hiring, platform engineering hiring, Kubernetes, and cloud migration.

Ask: Open discovery with a hypothesis, not a claim. Position logistics analytics, scalable data platform, and cost-governed AI experimentation.

Questions to investigate:
- What platform changes are tied to regional expansion?
- Are route optimization and analytics workloads centralized today?
- Is Kubernetes part of a migration, modernization, or new build?
- What would make cloud experimentation financially safe?`,
      },
      {
        type: "crm_task",
        title: "CRM task: Nova discovery outreach",
        recipientRole: "Account executive",
        tone: "Prospecting",
        evidenceUsed: ["nova-news-expansion", "nova-hiring-data"],
        body: `Task: Send Nova Logistics discovery outreach
Owner: Casey Nguyen
Due date: 2026-06-17
Priority: Medium

Description: Reference public expansion, route optimization, and data/platform hiring signals. Keep all claims as hypotheses. Objective is to qualify a data-platform modernization or cloud migration discussion.`,
      },
      {
        type: "jira_ticket",
        title: "Solution prep ticket: Nova logistics analytics discovery",
        recipientRole: "Solution engineering",
        tone: "Technical prep",
        evidenceUsed: ["nova-job-cloud", "nova-news-expansion"],
        body: `Title: Prepare discovery architecture themes for Nova Logistics

Triggering signals: Public snippets mention Kubernetes, cloud migration, scalable data platform, regional expansion, and route optimization.

Technical hypothesis: Nova may be evaluating data-platform modernization for logistics analytics.

Requested prep:
- Draft reference architecture for logistics analytics ingestion and optimization.
- Include Kubernetes migration discussion points.
- Prepare cost-governed AI experimentation guardrails.
- Keep all recommendations exploratory until discovery validates the need.

Success criteria: AE can lead a qualified discovery call without overstating public evidence.`,
      },
      {
        type: "account_brief",
        title: "Nova greenfield account brief",
        recipientRole: "Prospecting team",
        tone: "Hypothesis brief",
        evidenceUsed: ["nova-hiring-data", "nova-news-expansion", "nova-job-cloud"],
        body: `Nova Logistics is a greenfield discovery hypothesis. Public evidence includes regional expansion, route optimization investment, data engineering hiring, platform engineering hiring, Kubernetes, cloud migration, and scalable data platform language. Recommended entry point: discovery around logistics analytics modernization and cost-governed AI experimentation. Confidence is medium because the evidence is public and inferential.`,
      },
      {
        type: "discovery_brief",
        title: "Nova discovery call plan",
        recipientRole: "AE and SE",
        tone: "Discovery",
        evidenceUsed: ["nova-hiring-data", "nova-job-cloud"],
        body: `Discovery hypothesis: Nova may be modernizing its data platform to support route optimization and regional expansion.

Business context:
- Public expansion signal.
- Public hiring for data and platform engineering.
- Public job language around Kubernetes, cloud migration, and scalable data platforms.

Technical discovery questions:
- Which logistics analytics workflows are constrained today?
- What role does Kubernetes play in the future platform?
- Are AI experiments planned for routing, demand, or operations?
- What financial guardrails matter for cloud migration?

Recommended next step: 30-minute discovery with platform and data leaders.`,
      },
    ],
    demoScenario: {
      label: "Greenfield account discovery",
      before:
        "Prospecting starts from generic research and unqualified outreach.",
      after:
        "OrbitIQ turns public evidence into a lower-confidence but specific discovery hypothesis.",
      demoProof: [
        "No internal usage data is implied.",
        "Evidence distinguishes observed snippets from inferred hypothesis.",
        "Draft email frames claims as public-signal hypotheses.",
        "Discovery brief creates a concrete call plan.",
      ],
    },
  },
];

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }

  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }

  return formatCurrency(value);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function daysUntil(date: string, from = demoToday) {
  const start = new Date(`${from}T00:00:00Z`).getTime();
  const end = new Date(`${date}T00:00:00Z`).getTime();
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

export function weightedPriorityScore(score: ScoreBreakdown) {
  return Math.round(
    0.35 * score.impact +
      0.2 * score.momentum +
      0.15 * score.urgency +
      0.15 * score.fit +
      0.15 * score.confidence,
  );
}

export function getAccountArtifact(
  account: OrbitAccount,
  type: ActionType,
) {
  return (
    account.generatedArtifacts.find((artifact) => artifact.type === type) ??
    account.generatedArtifacts[0]
  );
}

export function getAllSignals(accounts = demoAccounts) {
  return accounts.flatMap((account) =>
    account.signals.map((signal) => ({
      ...signal,
      accountId: account.id,
      accountName: account.name,
      accountType: account.accountType,
      industry: account.industry,
      region: account.region,
    })),
  );
}

export function getAllEvidence(accounts = demoAccounts) {
  return accounts.flatMap((account) =>
    account.evidence.map((evidence) => ({
      ...evidence,
      accountId: account.id,
      accountName: account.name,
    })),
  );
}

export function getSourceNames(accounts = demoAccounts) {
  return Array.from(
    new Set(accounts.flatMap((account) => account.evidence.map((item) => item.source))),
  ).sort();
}

export function createTimestamp() {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}
