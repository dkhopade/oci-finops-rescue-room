"use client";

import Image from "next/image";
import { ChangeEvent, useMemo, useState } from "react";
import {
  actionTypeLabels,
  createTimestamp,
  daysUntil,
  defaultThresholds,
  demoConnectors,
  demoAccounts,
  demoImpactMetrics,
  demoToday,
  formatCompactCurrency,
  formatCurrency,
  formatDate,
  getAccountArtifact,
  getAllSignals,
  getSourceNames,
  initialWorkflowEvents,
  readinessProof,
  rubricProofPoints,
  statusDescriptions,
  wedgeProof,
  weightedPriorityScore,
} from "@/lib/orbitiq";
import type {
  AccountType,
  ActionType,
  DemoConnector,
  DemoThresholds,
  FeedbackStatus,
  GeneratedAction,
  OrbitAccount,
  PlayType,
  SignalType,
  WorkflowEvent,
} from "@/lib/orbitiq";

type ViewName =
  | "Action Queue"
  | "Accounts"
  | "Signals"
  | "Generated Actions"
  | "Demo Scenarios"
  | "Settings";

type SortKey =
  | "priority"
  | "impact"
  | "urgency"
  | "confidence"
  | "newest"
  | "renewal"
  | "spend";

type FilterState = {
  accountType: "All" | AccountType;
  playType: "All" | PlayType;
  status: "All" | FeedbackStatus;
  owner: "All" | string;
  region: "All" | string;
  industry: "All" | string;
  impact: "All" | "High" | "Medium";
  renewal: "All" | "Within 90 Days" | "No Renewal";
  source: "All" | string;
  minConfidence: number;
  sort: SortKey;
};

type OverrideRole = "Sales" | "Engineering" | "Customer Success" | "FinOps";

const navItems: ViewName[] = [
  "Action Queue",
  "Accounts",
  "Signals",
  "Generated Actions",
  "Demo Scenarios",
  "Settings",
];

const feedbackButtons: {
  label: string;
  detail: string;
  status: FeedbackStatus;
}[] = [
  {
    label: "Approve",
    detail: "Move forward with the action.",
    status: "Accepted",
  },
  {
    label: "Adjust",
    detail: "Needs professional context.",
    status: "Edited",
  },
  {
    label: "Snooze",
    detail: "Revisit after timing changes.",
    status: "Snoozed",
  },
  {
    label: "Dismiss",
    detail: "Not useful for this account.",
    status: "Rejected",
  },
];

const overrideRoles: OverrideRole[] = [
  "Sales",
  "Engineering",
  "Customer Success",
  "FinOps",
];

const defaultFilters: FilterState = {
  accountType: "All",
  playType: "All",
  status: "All",
  owner: "All",
  region: "All",
  industry: "All",
  impact: "All",
  renewal: "All",
  source: "All",
  minConfidence: 0,
  sort: "priority",
};

function Pill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "red" | "amber" | "purple" | "blue";
}) {
  const tones = {
    neutral: "border-zinc-200 bg-zinc-50 text-zinc-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-800",
    red: "border-rose-200 bg-rose-50 text-rose-800",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    purple: "border-violet-200 bg-violet-50 text-violet-800",
    blue: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function playTone(playType: PlayType): "green" | "red" | "amber" | "purple" | "blue" {
  if (playType === "Growth") return "green";
  if (playType === "Risk") return "red";
  if (playType === "Optimization") return "amber";
  if (playType === "Greenfield") return "purple";
  return "blue";
}

function statusTone(status: FeedbackStatus): "neutral" | "green" | "red" | "amber" | "purple" | "blue" {
  if (status === "Accepted" || status === "Converted") return "green";
  if (status === "Rejected" || status === "False Positive") return "red";
  if (status === "Snoozed") return "amber";
  if (status === "Edited") return "purple";
  if (status === "Already Handled") return "blue";
  return "neutral";
}

function connectorStatusTone(
  status: DemoConnector["status"],
  enabled: boolean,
): "neutral" | "green" | "amber" | "blue" {
  if (!enabled) return "neutral";
  if (status === "Connected") return "green";
  if (status === "Needs Auth") return "amber";
  return "blue";
}

function SummaryCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "neutral" | "green" | "red" | "amber" | "purple" | "blue";
}) {
  const accents = {
    neutral: "border-zinc-200",
    green: "border-emerald-200",
    red: "border-rose-200",
    amber: "border-amber-200",
    purple: "border-violet-200",
    blue: "border-sky-200",
  };

  return (
    <div className={`rounded-lg border bg-white p-4 ${accents[tone]}`}>
      <p className="text-xs font-semibold uppercase text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-1 text-sm leading-5 text-zinc-600">{detail}</p>
    </div>
  );
}

function ImpactMetricStrip() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Impact model
          </p>
          <h2 className="mt-1 text-lg font-semibold text-zinc-950">
            Small wedge, measurable account-team lift
          </h2>
        </div>
        <Pill tone="green">Judge metric ready</Pill>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {demoImpactMetrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
          >
            <p className="text-xs font-semibold uppercase text-zinc-500">
              {metric.label}
            </p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">
              {metric.value}
            </p>
            <p className="mt-1 text-sm leading-5 text-zinc-600">
              {metric.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function WedgeProofPanel() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-zinc-500">
        Wedge and expansion
      </p>
      <h2 className="mt-2 text-xl font-semibold text-zinc-950">
        Start with the daily sales and pre-sales action queue
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {wedgeProof.map((item) => (
          <div key={item.label} className="border-l-2 border-zinc-300 pl-3">
            <p className="font-semibold text-zinc-950">{item.label}</p>
            <p className="mt-2 text-sm leading-5 text-zinc-600">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AccountWorkflowPanel({
  account,
  status,
  activeAction,
}: {
  account: OrbitAccount;
  status: FeedbackStatus;
  activeAction?: GeneratedAction;
}) {
  const workflow = [
    {
      label: "Signal triaged",
      detail: `${account.signals.length} source-backed signals scored into priority ${account.priorityScore}.`,
      active: true,
    },
    {
      label: "Human decision",
      detail:
        status === "New"
          ? "Pending account-team decision."
          : statusDescriptions[status],
      active: status !== "New",
    },
    {
      label: "Draft prepared",
      detail: activeAction
        ? `${actionTypeLabels[activeAction.type]} is ${activeAction.status.toLowerCase()}.`
        : "Ready to prepare from the current evidence set.",
      active: Boolean(activeAction),
    },
    {
      label: "Downstream handoff",
      detail:
        activeAction?.status === "Created"
          ? "Created in demo mode with no external write."
          : "Approval-gated CRM, Jira, Slack, or email handoff.",
      active: activeAction?.status === "Created",
    },
  ];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Account workflow
          </p>
          <h3 className="mt-2 text-lg font-semibold text-zinc-950">
            From noisy signals to one accountable next step
          </h3>
        </div>
        <Pill tone="blue">{account.suggestedOwner}</Pill>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-4">
        {workflow.map((step, index) => (
          <div
            key={step.label}
            className={`rounded-lg border p-3 ${
              step.active
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-200 bg-zinc-50 text-zinc-900"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-xs font-semibold ${
                  step.active
                    ? "bg-white text-zinc-950"
                    : "bg-zinc-200 text-zinc-700"
                }`}
              >
                {index + 1}
              </span>
              <p className="font-semibold">{step.label}</p>
            </div>
            <p
              className={`mt-3 text-sm leading-5 ${
                step.active ? "text-zinc-200" : "text-zinc-600"
              }`}
            >
              {step.detail}
            </p>
          </div>
        ))}
      </div>
      <dl className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 text-sm md:grid-cols-3">
        <div>
          <dt className="font-semibold text-zinc-900">Before</dt>
          <dd className="mt-1 text-zinc-600">
            90-120 minutes of manual account research across source systems.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">After</dt>
          <dd className="mt-1 text-zinc-600">
            Evidence-backed decision and downstream draft in one account plan.
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-zinc-900">Account impact</dt>
          <dd className="mt-1 text-zinc-600">{account.estimatedImpact}</dd>
        </div>
      </dl>
    </section>
  );
}

function ReadinessPanel() {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-5">
      <p className="text-xs font-semibold uppercase text-zinc-500">
        Reliability boundary
      </p>
      <h2 className="mt-2 text-xl font-semibold text-zinc-950">
        Production-shaped demo with explicit limits
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {readinessProof.map((item) => (
          <div key={item.label} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
            <p className="font-semibold text-zinc-950">{item.label}</p>
            <p className="mt-2 text-sm leading-5 text-zinc-600">
              {item.detail}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ScoreBar({
  label,
  value,
  weight,
}: {
  label: string;
  value: number;
  weight: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-zinc-700">{label}</span>
        <span className="text-zinc-500">
          {value} · {weight}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="h-full rounded-full bg-zinc-900"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Sidebar({
  activeView,
  setActiveView,
}: {
  activeView: ViewName;
  setActiveView: (view: ViewName) => void;
}) {
  return (
    <aside className="border-b border-zinc-200 bg-white px-4 py-4 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div>
        <div className="relative h-14 w-52 overflow-hidden rounded-lg bg-black shadow-sm">
          <Image
            src="/brand/orbitiq-logo.png"
            alt="OrbitIQ"
            fill
            sizes="208px"
            className="object-cover"
            priority
          />
        </div>
      </div>

      <nav className="mt-6 grid gap-1">
        {navItems.map((item) => (
          <button
            key={item}
            type="button"
            data-testid={`nav-${item.toLowerCase().replaceAll(" ", "-")}`}
            onClick={() => setActiveView(item)}
            className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
              activeView === item
                ? "bg-zinc-950 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950"
            }`}
          >
            {item}
          </button>
        ))}
      </nav>

      <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Demo mode
        </p>
        <p className="mt-2 text-sm leading-5 text-zinc-700">
          Deterministic demo data · Draft-only actions · No external writes
        </p>
      </div>

      <div className="mt-4 grid gap-3 text-sm">
        <div>
          <p className="text-zinc-500">Demo date</p>
          <p className="font-semibold text-zinc-950">{formatDate(demoToday)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Seed accounts</p>
          <p className="font-semibold text-zinc-950">Acme · Beta · Nova</p>
        </div>
      </div>
    </aside>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="font-medium text-zinc-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function AgentInsightPanel({
  account,
  status,
}: {
  account: OrbitAccount;
  status: FeedbackStatus;
}) {
  const topEvidence = account.evidence.slice(0, 3);

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="p-5">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone={playTone(account.playType)}>{account.playType}</Pill>
            <Pill tone={statusTone(status)}>{status}</Pill>
            <Pill>{account.signals.length} signals</Pill>
            <Pill tone="blue">{account.scoreBreakdown.confidence}% confidence</Pill>
          </div>
          <p className="mt-5 text-xs font-semibold uppercase text-zinc-500">
            Autonomous recommendation
          </p>
          <h2 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-zinc-950">
            {account.recommendedNextAction}
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-zinc-700">
            {account.whyNow}
          </p>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {topEvidence.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3"
              >
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {item.source}
                </p>
                <p className="mt-2 text-sm font-semibold leading-5 text-zinc-950">
                  {item.headline}
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {formatDate(item.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function FilterPanel({
  filters,
  setFilters,
  advancedOpen,
  setAdvancedOpen,
  owners,
  regions,
  industries,
  sources,
}: {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  advancedOpen: boolean;
  setAdvancedOpen: (open: boolean) => void;
  owners: string[];
  regions: string[];
  industries: string[];
  sources: string[];
}) {
  function updateFilter<K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) {
    setFilters({ ...filters, [key]: value });
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid flex-1 gap-4 md:grid-cols-3">
          <FilterSelect
            label="Play Type"
            value={filters.playType}
            onChange={(value) => updateFilter("playType", value as FilterState["playType"])}
            options={["All", "Growth", "Risk", "Optimization", "Renewal", "Greenfield"]}
          />
          <FilterSelect
            label="Status"
            value={filters.status}
            onChange={(value) => updateFilter("status", value as FilterState["status"])}
            options={[
              "All",
              "New",
              "Accepted",
              "Rejected",
              "Snoozed",
              "Edited",
              "Converted",
              "False Positive",
              "Already Handled",
            ]}
          />
          <FilterSelect
            label="Sort"
            value={filters.sort}
            onChange={(value) => updateFilter("sort", value as SortKey)}
            options={[
              "priority",
              "impact",
              "urgency",
              "confidence",
              "newest",
              "renewal",
              "spend",
            ]}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            {advancedOpen ? "Hide Filters" : "More Filters"}
          </button>
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            Reset
          </button>
        </div>
      </div>

      {advancedOpen ? (
        <div className="mt-4 grid gap-4 border-t border-zinc-100 pt-4 md:grid-cols-2 xl:grid-cols-4">
          <FilterSelect
            label="Account Type"
            value={filters.accountType}
            onChange={(value) => updateFilter("accountType", value as FilterState["accountType"])}
            options={["All", "Existing", "Greenfield"]}
          />
          <FilterSelect
            label="Owner"
            value={filters.owner}
            onChange={(value) => updateFilter("owner", value)}
            options={["All", ...owners]}
          />
          <FilterSelect
            label="Region"
            value={filters.region}
            onChange={(value) => updateFilter("region", value)}
            options={["All", ...regions]}
          />
          <FilterSelect
            label="Industry"
            value={filters.industry}
            onChange={(value) => updateFilter("industry", value)}
            options={["All", ...industries]}
          />
          <FilterSelect
            label="Impact"
            value={filters.impact}
            onChange={(value) => updateFilter("impact", value as FilterState["impact"])}
            options={["All", "High", "Medium"]}
          />
          <FilterSelect
            label="Renewal Window"
            value={filters.renewal}
            onChange={(value) => updateFilter("renewal", value as FilterState["renewal"])}
            options={["All", "Within 90 Days", "No Renewal"]}
          />
          <FilterSelect
            label="Connector"
            value={filters.source}
            onChange={(value) => updateFilter("source", value)}
            options={["All", ...sources]}
          />
          <label className="text-sm">
            <span className="font-medium text-zinc-700">
              Minimum Confidence: {filters.minConfidence}%
            </span>
            <input
              type="range"
              min={0}
              max={95}
              step={5}
              value={filters.minConfidence}
              onChange={(event) =>
                updateFilter("minConfidence", Number(event.target.value))
              }
              className="mt-3 block w-full accent-zinc-950"
            />
          </label>
        </div>
      ) : null}
    </section>
  );
}

function AccountQueueTable({
  accounts,
  statusByAccount,
  selectedAccountId,
  onOpenActionPlan,
}: {
  accounts: OrbitAccount[];
  statusByAccount: Record<string, FeedbackStatus>;
  selectedAccountId: string;
  onOpenActionPlan: (accountId: string) => void;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-[1100px] divide-y divide-zinc-200 text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="w-14 px-4 py-3" aria-label="Open action plan" />
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Play</th>
              <th className="px-4 py-3">Why Now</th>
              <th className="px-4 py-3">Impact</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Last Signal</th>
              <th className="px-4 py-3">Next Action</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {accounts.map((account, index) => {
              const status = statusByAccount[account.id] ?? account.status;
              return (
                <tr
                  key={account.id}
                  data-testid={`queue-row-${account.id}`}
                  onClick={() => onOpenActionPlan(account.id)}
                  className={`cursor-pointer align-top transition ${
                    selectedAccountId === account.id
                      ? "bg-zinc-100"
                      : "hover:bg-zinc-50"
                  }`}
                >
                  <td className="w-14 px-4 py-4">
                    <button
                      type="button"
                      data-testid={`open-action-plan-${account.id}`}
                      aria-label={`Open action plan for ${account.name}`}
                      title={`Open action plan for ${account.name}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenActionPlan(account.id);
                      }}
                      className="grid h-9 w-9 place-items-center rounded-md border border-zinc-300 bg-white text-zinc-900 shadow-sm transition hover:border-zinc-950 hover:bg-zinc-950 hover:text-white focus:outline-none focus:ring-2 focus:ring-zinc-400"
                    >
                      <span aria-hidden="true" className="text-lg leading-none">
                        →
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-950">
                    {index + 1}
                  </td>
                  <td className="min-w-56 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={account.logoUrl}
                        alt={account.logoAlt}
                        width={96}
                        height={34}
                        className="h-8 w-auto"
                        unoptimized
                      />
                      <div>
                        <p className="font-semibold text-zinc-950">
                          {account.name}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Priority {account.priorityScore}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {account.accountType}
                  </td>
                  <td className="px-4 py-4">
                    <Pill tone={playTone(account.playType)}>
                      {account.playType}
                    </Pill>
                  </td>
                  <td className="max-w-xs px-4 py-4 text-zinc-600">
                    {account.whyNow}
                  </td>
                  <td className="px-4 py-4 font-semibold text-zinc-950">
                    {account.estimatedImpact}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {account.scoreBreakdown.confidence}%
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {account.suggestedOwner}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {formatDate(account.lastSignalDate)}
                  </td>
                  <td className="min-w-60 px-4 py-4 text-zinc-600">
                    {account.recommendedNextAction}
                  </td>
                  <td className="px-4 py-4">
                    <Pill tone={statusTone(status)}>{status}</Pill>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProfessionalOverridePanel({
  account,
  overrideRole,
  setOverrideRole,
  professionalNote,
  setProfessionalNote,
  onRegenerateWithNotes,
}: {
  account: OrbitAccount;
  overrideRole: OverrideRole;
  setOverrideRole: (role: OverrideRole) => void;
  professionalNote: string;
  setProfessionalNote: (note: string) => void;
  onRegenerateWithNotes: () => void;
}) {
  return (
    <div className="mt-4 rounded-lg border border-zinc-300 bg-zinc-50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Professional override
          </p>
          <h4 className="mt-2 text-base font-semibold text-zinc-950">
            Add sales or engineering context
          </h4>
          <p className="mt-1 text-sm leading-5 text-zinc-600">
            Use this when the autonomous recommendation needs field knowledge
            before OrbitIQ prepares the actionable draft.
          </p>
        </div>
        <Pill>{account.suggestedOwner}</Pill>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {overrideRoles.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => setOverrideRole(role)}
            className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
              overrideRole === role
                ? "border-zinc-950 bg-zinc-950 text-white"
                : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
            }`}
          >
            {role}
          </button>
        ))}
      </div>

      <textarea
        value={professionalNote}
        onChange={(event) => setProfessionalNote(event.target.value)}
        rows={5}
        placeholder="Example: customer prefers a technical workshop first; avoid pricing until latency root cause is clear."
        className="mt-4 w-full resize-y rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRegenerateWithNotes}
          className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Regenerate action plan
        </button>
        <p className="text-sm text-zinc-600">
          Updates the actionable draft and keeps approval required.
        </p>
      </div>
    </div>
  );
}

function RecommendationDetail({
  account,
  status,
  workflowEvents,
  onFeedback,
  overrideRole,
  setOverrideRole,
  professionalNote,
  setProfessionalNote,
  onRegenerateWithNotes,
  activeActionType,
  setActiveActionType,
  editorText,
  setEditorText,
  activeAction,
  isGenerating,
  onGenerateAction,
  onSaveAction,
  onCreateAction,
}: {
  account: OrbitAccount;
  status: FeedbackStatus;
  workflowEvents: WorkflowEvent[];
  onFeedback: (status: FeedbackStatus) => void;
  overrideRole: OverrideRole;
  setOverrideRole: (role: OverrideRole) => void;
  professionalNote: string;
  setProfessionalNote: (note: string) => void;
  onRegenerateWithNotes: () => void;
  activeActionType: ActionType;
  setActiveActionType: (type: ActionType) => void;
  editorText: string;
  setEditorText: (text: string) => void;
  activeAction?: GeneratedAction;
  isGenerating: boolean;
  onGenerateAction: () => void;
  onSaveAction: () => void;
  onCreateAction: () => void;
}) {
  const daysToRenewal = account.renewalDate
    ? daysUntil(account.renewalDate)
    : null;

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone={playTone(account.playType)}>{account.playType}</Pill>
              <Pill tone={statusTone(status)}>{status}</Pill>
              <Pill>{account.suggestedOwner}</Pill>
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
              {account.name}
            </h2>
            <p className="mt-2 text-sm leading-6 text-zinc-600">
              {account.recommendedNextAction}
            </p>
          </div>
          <div className="min-w-32 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Priority
            </p>
            <p className="mt-1 text-3xl font-semibold text-zinc-950">
              {account.priorityScore}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Account
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              {account.accountType} · {account.segment} · {account.region}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Renewal
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              {account.renewalDate
                ? `${formatDate(account.renewalDate)} (${daysToRenewal} days)`
                : "No active renewal"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-zinc-500">
              ACV
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              {account.annualContractValue
                ? formatCurrency(account.annualContractValue)
                : "Prospecting account"}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-2 border-t border-zinc-100 pt-4 sm:grid-cols-4">
          {[
            ["1", "Review signal"],
            ["2", "Decide"],
            ["3", "Prepare draft"],
            ["4", "Create handoff"],
          ].map(([step, label]) => (
            <div key={step} className="flex items-center gap-2 text-sm">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-semibold text-white">
                {step}
              </span>
              <span className="font-medium text-zinc-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 p-5">
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-zinc-950">Why now</h3>
            <Pill tone="green">Recommendation ready</Pill>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            {account.whyNow}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            <span className="font-semibold text-zinc-950">Interpretation: </span>
            {account.interpretation}
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-700">
            <span className="font-semibold text-zinc-950">
              Customer-safe recommendation:{" "}
            </span>
            {account.customerSafeRecommendation}
          </p>
          {account.trustWarning ? (
            <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm leading-5 text-amber-900">
              {account.trustWarning}
            </p>
          ) : null}
        </section>

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Score breakdown
          </h3>
          <div className="mt-4 grid gap-4">
            <ScoreBar label="Impact" value={account.scoreBreakdown.impact} weight="35%" />
            <ScoreBar label="Momentum" value={account.scoreBreakdown.momentum} weight="20%" />
            <ScoreBar label="Urgency" value={account.scoreBreakdown.urgency} weight="15%" />
            <ScoreBar label="Fit" value={account.scoreBreakdown.fit} weight="15%" />
            <ScoreBar label="Confidence" value={account.scoreBreakdown.confidence} weight="15%" />
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Weighted score check: {weightedPriorityScore(account.scoreBreakdown)}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Evidence drawer
          </h3>
          <div className="mt-3 divide-y divide-zinc-100 border-y border-zinc-100">
            {account.evidence.map((item) => (
              <div key={item.id} className="py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">
                      {item.headline}
                    </p>
                    <p className="mt-1 text-sm leading-5 text-zinc-600">
                      {item.detail}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill>{item.source}</Pill>
                    <Pill tone="blue">{formatDate(item.date)}</Pill>
                  </div>
                </div>
                <p className="mt-2 text-xs font-medium uppercase text-zinc-500">
                  {item.type} · {item.relatedSignal} · +{item.confidenceContribution} confidence contribution
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Impact estimate
          </h3>
          <dl className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-zinc-900">
                Expansion potential
              </dt>
              <dd className="mt-1 text-zinc-600">
                {account.impactEstimate.expansionPotential}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">
                Savings opportunity
              </dt>
              <dd className="mt-1 text-zinc-600">
                {account.impactEstimate.savingsOpportunity}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Risk severity</dt>
              <dd className="mt-1 text-zinc-600">
                {account.impactEstimate.riskSeverity}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Forecast trend</dt>
              <dd className="mt-1 text-zinc-600">
                {account.impactEstimate.forecastTrend}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-sm leading-6 text-zinc-600">
            {account.impactEstimate.assumptions}
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Recommended action plan
          </h3>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="font-semibold text-zinc-900">Sales</dt>
              <dd className="mt-1 text-zinc-600">{account.actionPlan.sales}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">
                Solution engineering
              </dt>
              <dd className="mt-1 text-zinc-600">
                {account.actionPlan.solutionEngineering}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Customer success</dt>
              <dd className="mt-1 text-zinc-600">
                {account.actionPlan.customerSuccess}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">FinOps</dt>
              <dd className="mt-1 text-zinc-600">{account.actionPlan.finops}</dd>
            </div>
            <div>
              <dt className="font-semibold text-zinc-900">Timeline</dt>
              <dd className="mt-1 text-zinc-600">
                {account.actionPlan.timeline}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Decision
          </h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {feedbackButtons.map((button) => (
              <button
                key={button.status}
                type="button"
                data-testid={`decision-${button.label.toLowerCase()}`}
                onClick={() => onFeedback(button.status)}
                className={`rounded-md border px-3 py-3 text-left transition ${
                  status === button.status
                    ? "border-zinc-950 bg-zinc-950 text-white"
                    : "border-zinc-300 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {button.label}
                </span>
                <span
                  className={`mt-1 block text-xs ${
                    status === button.status ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {button.detail}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            {statusDescriptions[status]}
          </p>
          {status === "Edited" ? (
            <ProfessionalOverridePanel
              account={account}
              overrideRole={overrideRole}
              setOverrideRole={setOverrideRole}
              professionalNote={professionalNote}
              setProfessionalNote={setProfessionalNote}
              onRegenerateWithNotes={onRegenerateWithNotes}
            />
          ) : null}
        </section>

        <ActionGeneratorPanel
          account={account}
          activeActionType={activeActionType}
          setActiveActionType={setActiveActionType}
          editorText={editorText}
          setEditorText={setEditorText}
          activeAction={activeAction}
          isGenerating={isGenerating}
          onGenerateAction={onGenerateAction}
          onSaveAction={onSaveAction}
          onCreateAction={onCreateAction}
          embedded
        />

        <section>
          <h3 className="text-lg font-semibold text-zinc-950">
            Account action history
          </h3>
          <div className="mt-3 divide-y divide-zinc-100 border-y border-zinc-100">
            {workflowEvents.length === 0 ? (
              <p className="py-4 text-sm text-zinc-600">
                No workflow events recorded yet.
              </p>
            ) : (
              workflowEvents.map((event) => (
                <div key={event.id} className="py-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-zinc-950">{event.label}</p>
                    <p className="text-zinc-500">{event.timestamp}</p>
                  </div>
                  <p className="mt-1 text-zinc-600">{event.detail}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </section>
  );
}

function ActionGeneratorPanel({
  account,
  activeActionType,
  setActiveActionType,
  editorText,
  setEditorText,
  activeAction,
  isGenerating,
  onGenerateAction,
  onSaveAction,
  onCreateAction,
  embedded = false,
}: {
  account: OrbitAccount;
  activeActionType: ActionType;
  setActiveActionType: (type: ActionType) => void;
  editorText: string;
  setEditorText: (text: string) => void;
  activeAction?: GeneratedAction;
  isGenerating: boolean;
  onGenerateAction: () => void;
  onSaveAction: () => void;
  onCreateAction: () => void;
  embedded?: boolean;
}) {
  const artifact = getAccountArtifact(account, activeActionType);

  return (
    <section
      className={
        embedded
          ? "border-t border-zinc-200 pt-5"
          : "rounded-lg border border-zinc-200 bg-white"
      }
    >
      <div className={embedded ? "" : "border-b border-zinc-200 p-5"}>
        <div>
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Action composer
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Prepared downstream draft
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            OrbitIQ prepares this draft from the current evidence, decision
            state, and any professional override notes.
          </p>
        </div>
      </div>

      <div
        className={`grid gap-5 ${
          embedded ? "mt-5" : "p-5"
        } xl:grid-cols-[280px_1fr]`}
      >
        <aside className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Output type
          </p>
          <p className="mt-2 text-sm leading-5 text-zinc-600">
            Select the draft OrbitIQ should prepare for the next human-approved
            step.
          </p>
          <div className="mt-4 grid gap-2">
          {account.generatedArtifacts.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setActiveActionType(item.type)}
              className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                activeActionType === item.type
                  ? "border-zinc-950 bg-zinc-950 text-white"
                  : "border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50"
              }`}
            >
              {actionTypeLabels[item.type]}
            </button>
          ))}
          </div>
          <div className="mt-5 border-t border-zinc-200 pt-4">
            <p className="text-xs font-semibold uppercase text-zinc-500">
              Workflow
            </p>
            <ol className="mt-3 grid gap-2 text-sm text-zinc-700">
              <li>1. Prepare draft from evidence</li>
              <li>2. Edit with human judgment</li>
              <li>3. Create downstream record</li>
            </ol>
          </div>
        </aside>

        <div className="rounded-lg border-2 border-zinc-950 bg-white p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-zinc-500">
                Dynamic draft
              </p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-950">
                {artifact.title}
              </h3>
              <p className="mt-1 text-sm text-zinc-600">
                Recipient: {artifact.recipientRole} · Tone: {artifact.tone}
              </p>
            </div>
            {activeAction ? (
              <Pill tone={activeAction.status === "Created" ? "green" : "blue"}>
                {activeAction.status}
              </Pill>
            ) : (
              <Pill>Template</Pill>
            )}
          </div>
          <textarea
            value={editorText}
            onChange={(event) => setEditorText(event.target.value)}
            rows={16}
            className="mt-4 w-full resize-y rounded-md border border-zinc-300 bg-zinc-50 p-3 font-mono text-sm leading-6 text-zinc-900 shadow-inner focus:border-zinc-500 focus:outline-none"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              data-testid="prepare-draft"
              onClick={onGenerateAction}
              disabled={isGenerating}
              className="rounded-md bg-zinc-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {isGenerating ? "Preparing Draft" : "Prepare Draft"}
            </button>
            <button
              type="button"
              data-testid="save-draft-edits"
              onClick={onSaveAction}
              disabled={!activeAction}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
            >
              Save Edits
            </button>
            <button
              type="button"
              data-testid="create-downstream-record"
              onClick={onCreateAction}
              disabled={!activeAction}
              className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-50 disabled:text-zinc-400"
            >
              Create
            </button>
          </div>
          <p className="mt-3 text-xs font-medium uppercase text-zinc-500">
            Evidence used: {artifact.evidenceUsed.join(", ")}
          </p>
        </div>
      </div>
    </section>
  );
}

function QueueView({
  accounts,
  statusByAccount,
  selectedAccount,
  selectedAccountId,
  actionPlanOpen,
  onOpenActionPlan,
  onBackToQueue,
  filters,
  setFilters,
  advancedFiltersOpen,
  setAdvancedFiltersOpen,
  owners,
  regions,
  industries,
  sources,
  workflowEvents,
  onFeedback,
  overrideRole,
  setOverrideRole,
  professionalNote,
  setProfessionalNote,
  onRegenerateWithNotes,
  activeActionType,
  setActiveActionType,
  editorText,
  setEditorText,
  activeAction,
  isGenerating,
  onGenerateAction,
  onSaveAction,
  onCreateAction,
}: {
  accounts: OrbitAccount[];
  statusByAccount: Record<string, FeedbackStatus>;
  selectedAccount: OrbitAccount;
  selectedAccountId: string;
  actionPlanOpen: boolean;
  onOpenActionPlan: (accountId: string) => void;
  onBackToQueue: () => void;
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
  advancedFiltersOpen: boolean;
  setAdvancedFiltersOpen: (open: boolean) => void;
  owners: string[];
  regions: string[];
  industries: string[];
  sources: string[];
  workflowEvents: WorkflowEvent[];
  onFeedback: (status: FeedbackStatus) => void;
  overrideRole: OverrideRole;
  setOverrideRole: (role: OverrideRole) => void;
  professionalNote: string;
  setProfessionalNote: (note: string) => void;
  onRegenerateWithNotes: () => void;
  activeActionType: ActionType;
  setActiveActionType: (type: ActionType) => void;
  editorText: string;
  setEditorText: (text: string) => void;
  activeAction?: GeneratedAction;
  isGenerating: boolean;
  onGenerateAction: () => void;
  onSaveAction: () => void;
  onCreateAction: () => void;
}) {
  const growthCount = accounts.filter((account) => account.playType === "Growth").length;
  const riskCount = accounts.filter((account) => account.playType === "Risk").length;
  const greenfieldCount = accounts.filter((account) => account.playType === "Greenfield").length;
  const totalImpact = demoAccounts.reduce((sum, account) => sum + account.impactValue, 0);
  const selectedStatus = statusByAccount[selectedAccount.id] ?? selectedAccount.status;
  const selectedEvents = workflowEvents.filter(
    (event) => event.accountId === selectedAccount.id,
  );

  if (actionPlanOpen) {
    return (
      <div data-testid="account-action-plan" className="grid gap-5">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <button
                type="button"
                data-testid="back-to-queue"
                onClick={onBackToQueue}
                className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
              >
                Back to queue
              </button>
              <p className="mt-4 text-xs font-semibold uppercase text-zinc-500">
                Account action plan
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
                {selectedAccount.name}
              </h2>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
              <Image
                src={selectedAccount.logoUrl}
                alt={selectedAccount.logoAlt}
                width={120}
                height={42}
                className="h-9 w-auto"
                unoptimized
              />
              <div>
                <p className="text-sm font-semibold text-zinc-950">
                  Priority {selectedAccount.priorityScore}
                </p>
                <p className="text-xs text-zinc-500">
                  {selectedAccount.playType} · {selectedAccount.suggestedOwner}
                </p>
              </div>
            </div>
          </div>
        </section>

        <AgentInsightPanel
          account={selectedAccount}
          status={selectedStatus}
        />

        <AccountWorkflowPanel
          account={selectedAccount}
          status={selectedStatus}
          activeAction={activeAction}
        />

        <RecommendationDetail
          account={selectedAccount}
          status={selectedStatus}
          workflowEvents={selectedEvents}
          onFeedback={onFeedback}
          overrideRole={overrideRole}
          setOverrideRole={setOverrideRole}
          professionalNote={professionalNote}
          setProfessionalNote={setProfessionalNote}
          onRegenerateWithNotes={onRegenerateWithNotes}
          activeActionType={activeActionType}
          setActiveActionType={setActiveActionType}
          editorText={editorText}
          setEditorText={setEditorText}
          activeAction={activeAction}
          isGenerating={isGenerating}
          onGenerateAction={onGenerateAction}
          onSaveAction={onSaveAction}
          onCreateAction={onCreateAction}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">
            From cloud signals to customer growth.
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
            OrbitIQ prioritizes account actions from connector signals,
            evidence, and customer-safe next steps.
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard
          label="Accounts needing action"
          value={String(demoAccounts.length)}
          detail="Daily queue from local seed data"
        />
        <SummaryCard
          label="Growth plays"
          value={String(growthCount)}
          detail="Expansion and architecture-review motions"
          tone="green"
        />
        <SummaryCard
          label="Risk/save plays"
          value={String(riskCount)}
          detail="Retention and trust-first motions"
          tone="red"
        />
        <SummaryCard
          label="Greenfield hypotheses"
          value={String(greenfieldCount)}
          detail="Public research sourced opportunities"
          tone="purple"
        />
        <SummaryCard
          label="Pipeline/savings impact"
          value={formatCompactCurrency(totalImpact)}
          detail="Demo estimate for investor review"
          tone="blue"
        />
      </div>

      <ImpactMetricStrip />

      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        advancedOpen={advancedFiltersOpen}
        setAdvancedOpen={setAdvancedFiltersOpen}
        owners={owners}
        regions={regions}
        industries={industries}
        sources={sources}
      />

      <div className="grid gap-5">
        <AccountQueueTable
          accounts={accounts}
          statusByAccount={statusByAccount}
          selectedAccountId={selectedAccountId}
          onOpenActionPlan={onOpenActionPlan}
        />
      </div>
    </div>
  );
}

function AccountsView({
  statusByAccount,
  setSelectedAccountId,
  setActiveView,
}: {
  statusByAccount: Record<string, FeedbackStatus>;
  setSelectedAccountId: (accountId: string) => void;
  setActiveView: (view: ViewName) => void;
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Accounts
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Demo account portfolio
        </h2>
      </div>
      <div className="divide-y divide-zinc-100">
        {demoAccounts.map((account) => {
          const status = statusByAccount[account.id] ?? account.status;
          return (
            <button
              key={account.id}
              type="button"
              onClick={() => {
                setSelectedAccountId(account.id);
                setActiveView("Action Queue");
              }}
              className="grid w-full gap-4 px-5 py-5 text-left transition hover:bg-zinc-50 md:grid-cols-[220px_1fr_180px]"
            >
              <div className="flex items-center gap-3">
                <Image
                  src={account.logoUrl}
                  alt={account.logoAlt}
                  width={120}
                  height={42}
                  className="h-9 w-auto"
                  unoptimized
                />
                <div>
                  <p className="font-semibold text-zinc-950">{account.name}</p>
                  <p className="text-sm text-zinc-500">{account.industry}</p>
                </div>
              </div>
              <p className="text-sm leading-6 text-zinc-600">
                {account.whyNow}
              </p>
              <div className="flex flex-wrap items-start gap-2 md:justify-end">
                <Pill tone={playTone(account.playType)}>{account.playType}</Pill>
                <Pill tone={statusTone(status)}>{status}</Pill>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function SignalsView() {
  const signals = useMemo(() => getAllSignals(), []);
  const [accountFilter, setAccountFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState<"All" | SignalType>("All");
  const [connectorFilter, setConnectorFilter] = useState("All");

  const accounts = useMemo(
    () => Array.from(new Set(signals.map((signal) => signal.accountName))).sort(),
    [signals],
  );
  const types = useMemo(
    () => Array.from(new Set(signals.map((signal) => signal.type))).sort(),
    [signals],
  );
  const connectors = useMemo(
    () => Array.from(new Set(signals.map((signal) => signal.source))).sort(),
    [signals],
  );
  const filteredSignals = useMemo(
    () =>
      signals.filter((signal) => {
        if (accountFilter !== "All" && signal.accountName !== accountFilter) {
          return false;
        }
        if (typeFilter !== "All" && signal.type !== typeFilter) {
          return false;
        }
        if (connectorFilter !== "All" && signal.source !== connectorFilter) {
          return false;
        }
        return true;
      }),
    [accountFilter, connectorFilter, signals, typeFilter],
  );

  function resetSignalFilters() {
    setAccountFilter("All");
    setTypeFilter("All");
    setConnectorFilter("All");
  }

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Signal explorer
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Detected account signals
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          {filteredSignals.length} of {signals.length} signals shown
        </p>
      </div>

      <div className="border-b border-zinc-200 p-5">
        <div className="grid gap-4 md:grid-cols-3">
          <FilterSelect
            label="Account"
            value={accountFilter}
            onChange={setAccountFilter}
            options={["All", ...accounts]}
          />
          <FilterSelect
            label="Signal Type"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as "All" | SignalType)}
            options={["All", ...types]}
          />
          <FilterSelect
            label="Connector"
            value={connectorFilter}
            onChange={setConnectorFilter}
            options={["All", ...connectors]}
          />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={resetSignalFilters}
            className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
          >
            Reset
          </button>
          <p className="text-sm text-zinc-600">
            Narrow signals by account, type, or source system.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[980px] divide-y divide-zinc-200 text-left text-sm">
          <thead className="bg-zinc-50 text-xs font-semibold uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Signal</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Connector</th>
              <th className="px-4 py-3">Metric</th>
              <th className="px-4 py-3">Baseline</th>
              <th className="px-4 py-3">Change</th>
              <th className="px-4 py-3">Detected</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Recommendation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white">
            {filteredSignals.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-zinc-600">
                  No signals match the selected filters.
                </td>
              </tr>
            ) : (
              filteredSignals.map((signal) => (
                <tr key={signal.id} className="align-top">
                  <td className="min-w-64 px-4 py-4">
                    <p className="font-semibold text-zinc-950">{signal.title}</p>
                    <p className="mt-1 text-zinc-500">{signal.type}</p>
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {signal.accountName}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">{signal.source}</td>
                  <td className="px-4 py-4 text-zinc-600">
                    {signal.metricValue ?? "Snippet"}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {signal.baselineValue ?? "N/A"}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {signal.changePct ? `${signal.changePct}%` : "N/A"}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {formatDate(signal.detectedAt)}
                  </td>
                  <td className="px-4 py-4 text-zinc-600">
                    {signal.confidence}%
                  </td>
                  <td className="min-w-56 px-4 py-4 text-zinc-600">
                    {signal.linkedRecommendation}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function GeneratedActionsView({
  actions,
}: {
  actions: GeneratedAction[];
}) {
  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="border-b border-zinc-200 p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Generated actions
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Draft action history
        </h2>
      </div>
      {actions.length === 0 ? (
        <p className="p-5 text-sm leading-6 text-zinc-600">
          Generate an email, handoff, CRM task, Jira ticket, account brief, or
          discovery brief from the action queue.
        </p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {actions.map((action) => {
            const account = demoAccounts.find((item) => item.id === action.accountId);
            return (
              <article key={action.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-zinc-950">{action.title}</p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {account?.name} · {actionTypeLabels[action.type]} · {action.timestamp}
                    </p>
                  </div>
                  <Pill tone={action.status === "Created" ? "green" : "blue"}>
                    {action.status}
                  </Pill>
                </div>
                <pre className="mt-4 whitespace-pre-wrap rounded-md border border-zinc-200 bg-zinc-50 p-3 text-sm leading-6 text-zinc-700">
                  {action.body}
                </pre>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DemoScenariosView({
  setSelectedAccountId,
  setActiveView,
}: {
  setSelectedAccountId: (accountId: string) => void;
  setActiveView: (view: ViewName) => void;
}) {
  return (
    <div className="grid gap-5">
      <section className="grid gap-4 lg:grid-cols-3">
        {demoAccounts.map((account) => (
          <article
            key={account.id}
            className="rounded-lg border border-zinc-200 bg-white p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <Image
                src={account.logoUrl}
                alt={account.logoAlt}
                width={120}
                height={42}
                className="h-9 w-auto"
                unoptimized
              />
              <Pill tone={playTone(account.playType)}>{account.playType}</Pill>
            </div>
            <h2 className="mt-5 text-xl font-semibold text-zinc-950">
              {account.demoScenario.label}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              <span className="font-semibold text-zinc-900">Before: </span>
              {account.demoScenario.before}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-600">
              <span className="font-semibold text-zinc-900">After: </span>
              {account.demoScenario.after}
            </p>
            <ul className="mt-4 grid gap-2 text-sm leading-5 text-zinc-600">
              {account.demoScenario.demoProof.map((proof) => (
                <li key={proof} className="border-l-2 border-zinc-300 pl-3">
                  {proof}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => {
                setSelectedAccountId(account.id);
                setActiveView("Action Queue");
              }}
              className="mt-5 rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Open Scenario
            </button>
          </article>
        ))}
      </section>

      <WedgeProofPanel />

      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Rubric coverage
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Judge-ready proof points
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {rubricProofPoints.map((point) => (
            <div key={point.category} className="border-l-2 border-zinc-300 pl-3">
              <p className="font-semibold text-zinc-950">{point.category}</p>
              <p className="mt-2 text-sm leading-5 text-zinc-600">{point.proof}</p>
            </div>
          ))}
        </div>
      </section>

      <ReadinessPanel />
    </div>
  );
}

function SettingsView({
  thresholds,
  setThresholds,
  onRegenerateSignals,
  connectorEnabled,
  setConnectorEnabled,
}: {
  thresholds: DemoThresholds;
  setThresholds: (thresholds: DemoThresholds) => void;
  onRegenerateSignals: () => void;
  connectorEnabled: Record<string, boolean>;
  setConnectorEnabled: (connectorId: string, enabled: boolean) => void;
}) {
  const [expandedConnectorId, setExpandedConnectorId] = useState<string | null>(
    demoConnectors[0]?.id ?? null,
  );
  const [savedConnectorId, setSavedConnectorId] = useState<string | null>(null);

  function updateThreshold(key: keyof DemoThresholds, event: ChangeEvent<HTMLInputElement>) {
    setThresholds({ ...thresholds, [key]: Number(event.target.value) });
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase text-zinc-500">
          Connectors
        </p>
        <h2 className="mt-2 text-xl font-semibold text-zinc-950">
          Source systems
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600">
          OrbitIQ reads customer signals from configured systems and keeps
          downstream actions in draft mode for the demo.
        </p>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        {demoConnectors.map((connector) => {
          const enabled = connectorEnabled[connector.id] ?? false;
          const expanded = expandedConnectorId === connector.id;

          return (
            <article
              key={connector.id}
              className="rounded-lg border border-zinc-200 bg-white p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-zinc-500">
                    {connector.category}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-950">
                    {connector.name}
                  </h3>
                </div>
                <Pill tone={connectorStatusTone(connector.status, enabled)}>
                  {enabled ? connector.status : "Paused"}
                </Pill>
              </div>

              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {connector.description}
              </p>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-zinc-900">Mode</dt>
                  <dd className="mt-1 text-zinc-600">{connector.mode}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-900">Owner</dt>
                  <dd className="mt-1 text-zinc-600">{connector.owner}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-900">Sync</dt>
                  <dd className="mt-1 text-zinc-600">{connector.syncCadence}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-zinc-900">Last sync</dt>
                  <dd className="mt-1 text-zinc-600">{connector.lastSyncAt}</dd>
                </div>
              </dl>

              <div className="mt-4 flex flex-wrap gap-2">
                {connector.signalCoverage.map((signal) => (
                  <Pill key={signal}>{signal}</Pill>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-4">
                <button
                  type="button"
                  aria-pressed={enabled}
                  onClick={() => setConnectorEnabled(connector.id, !enabled)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
                    enabled
                      ? "border border-zinc-300 bg-white text-zinc-800 shadow-sm hover:bg-zinc-50"
                      : "bg-zinc-950 text-white hover:bg-zinc-800"
                  }`}
                >
                  {enabled ? "Pause" : "Enable"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setExpandedConnectorId(expanded ? null : connector.id)
                  }
                  className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50"
                >
                  {expanded ? "Hide config" : "Configure"}
                </button>
                {savedConnectorId === connector.id ? (
                  <Pill tone="green">Saved</Pill>
                ) : null}
              </div>

              {expanded ? (
                <div className="mt-4 grid gap-4 border-t border-zinc-100 pt-4 md:grid-cols-3">
                  <label className="grid gap-2 text-sm">
                    <span className="font-semibold text-zinc-900">
                      Endpoint
                    </span>
                    <input
                      defaultValue={connector.demoEndpoint}
                      className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span className="font-semibold text-zinc-900">
                      Auth
                    </span>
                    <select
                      defaultValue={connector.authMethod}
                      className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
                    >
                      <option>OAuth</option>
                      <option>Service account</option>
                      <option>API token</option>
                      <option>Managed crawler</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span className="font-semibold text-zinc-900">
                      Cadence
                    </span>
                    <input
                      defaultValue={connector.syncCadence}
                      className="h-10 rounded-md border border-zinc-300 px-3 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none"
                    />
                  </label>
                  <div className="md:col-span-3">
                    <button
                      type="button"
                      onClick={() => setSavedConnectorId(connector.id)}
                      className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
                    >
                      Save connector
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 p-5">
          <p className="text-xs font-semibold uppercase text-zinc-500">
            Signal tuning
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-950">
            Thresholds and demo controls
          </h2>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-2">
          {[
            ["spendGrowthPct", "Spend growth threshold", "%"],
            ["usageGrowthPct", "Usage growth threshold", "%"],
            ["commitmentUtilizationPct", "Commitment utilization floor", "%"],
            ["renewalWindowDays", "Renewal proximity window", "days"],
            ["greenfieldKeywordCount", "Greenfield keyword count", "keywords"],
          ].map(([key, label, suffix]) => (
            <label key={key} className="grid gap-2 text-sm">
              <span className="font-semibold text-zinc-900">{label}</span>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={key === "greenfieldKeywordCount" ? 1 : 0}
                  value={thresholds[key as keyof DemoThresholds]}
                  onChange={(event) =>
                    updateThreshold(key as keyof DemoThresholds, event)
                  }
                  className="h-10 w-28 rounded-md border border-zinc-300 px-3 text-sm focus:border-zinc-500 focus:outline-none"
                />
                <span className="text-zinc-600">{suffix}</span>
              </div>
            </label>
          ))}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={onRegenerateSignals}
              className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
            >
              Regenerate Signals
            </button>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
              This records a regeneration event using the visible thresholds
              while preserving the repeatable demo dataset.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function accountPassesFilters(
  account: OrbitAccount,
  filters: FilterState,
  status: FeedbackStatus,
) {
  if (filters.accountType !== "All" && account.accountType !== filters.accountType) {
    return false;
  }
  if (filters.playType !== "All" && account.playType !== filters.playType) {
    return false;
  }
  if (filters.status !== "All" && status !== filters.status) {
    return false;
  }
  if (filters.owner !== "All" && account.suggestedOwner !== filters.owner) {
    return false;
  }
  if (filters.region !== "All" && account.region !== filters.region) {
    return false;
  }
  if (filters.industry !== "All" && account.industry !== filters.industry) {
    return false;
  }
  if (filters.impact === "High" && account.impactValue < 500000) {
    return false;
  }
  if (
    filters.impact === "Medium" &&
    (account.impactValue < 200000 || account.impactValue >= 500000)
  ) {
    return false;
  }
  if (
    filters.renewal === "Within 90 Days" &&
    (!account.renewalDate || daysUntil(account.renewalDate) > 90)
  ) {
    return false;
  }
  if (filters.renewal === "No Renewal" && account.renewalDate) {
    return false;
  }
  if (
    filters.source !== "All" &&
    !account.evidence.some((evidence) => evidence.source === filters.source)
  ) {
    return false;
  }

  return account.scoreBreakdown.confidence >= filters.minConfidence;
}

function sortAccounts(accounts: OrbitAccount[], sort: SortKey) {
  return [...accounts].sort((a, b) => {
    if (sort === "impact") return b.impactValue - a.impactValue;
    if (sort === "urgency") return b.scoreBreakdown.urgency - a.scoreBreakdown.urgency;
    if (sort === "confidence") return b.scoreBreakdown.confidence - a.scoreBreakdown.confidence;
    if (sort === "newest") return b.lastSignalDate.localeCompare(a.lastSignalDate);
    if (sort === "renewal") {
      const aDays = a.renewalDate ? daysUntil(a.renewalDate) : Number.POSITIVE_INFINITY;
      const bDays = b.renewalDate ? daysUntil(b.renewalDate) : Number.POSITIVE_INFINITY;
      return aDays - bDays;
    }
    if (sort === "spend") return (b.spendGrowthPct ?? 0) - (a.spendGrowthPct ?? 0);
    return b.priorityScore - a.priorityScore;
  });
}

export default function Home() {
  const [activeView, setActiveView] = useState<ViewName>("Action Queue");
  const [selectedAccountId, setSelectedAccountId] = useState(demoAccounts[1].id);
  const [actionPlanOpen, setActionPlanOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [statusByAccount, setStatusByAccount] = useState<Record<string, FeedbackStatus>>({});
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>(initialWorkflowEvents);
  const [actions, setActions] = useState<GeneratedAction[]>([]);
  const [activeActionType, setActiveActionType] = useState<ActionType>("customer_email");
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [overrideRoleByAccount, setOverrideRoleByAccount] = useState<
    Record<string, OverrideRole>
  >({});
  const [professionalNotes, setProfessionalNotes] = useState<Record<string, string>>({});
  const [editorText, setEditorText] = useState(() =>
    getAccountArtifact(demoAccounts[1], "customer_email").body,
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [thresholds, setThresholds] = useState<DemoThresholds>(defaultThresholds);
  const [connectorEnabled, setConnectorEnabledState] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        demoConnectors.map((connector) => [
          connector.id,
          connector.status !== "Needs Auth",
        ]),
      ),
  );

  const selectedAccount =
    demoAccounts.find((account) => account.id === selectedAccountId) ?? demoAccounts[0];
  const selectedOverrideRole = overrideRoleByAccount[selectedAccount.id] ?? "Sales";
  const professionalNote = professionalNotes[selectedAccount.id] ?? "";

  const filteredAccounts = useMemo(() => {
    const matchingAccounts = demoAccounts.filter((account) =>
      accountPassesFilters(
        account,
        filters,
        statusByAccount[account.id] ?? account.status,
      ),
    );
    return sortAccounts(matchingAccounts, filters.sort);
  }, [filters, statusByAccount]);

  const owners = useMemo(
    () => Array.from(new Set(demoAccounts.map((account) => account.suggestedOwner))).sort(),
    [],
  );
  const regions = useMemo(
    () => Array.from(new Set(demoAccounts.map((account) => account.region))).sort(),
    [],
  );
  const industries = useMemo(
    () => Array.from(new Set(demoAccounts.map((account) => account.industry))).sort(),
    [],
  );
  const sources = useMemo(() => getSourceNames(), []);
  const activeAction =
    actions.find((action) => action.id === activeActionId) ?? undefined;

  function appendWorkflowEvent(accountId: string, label: string, detail: string) {
    setWorkflowEvents((current) => [
      {
        id: `${accountId}-${Date.now()}-${current.length}`,
        accountId,
        label,
        detail,
        timestamp: createTimestamp(),
      },
      ...current,
    ]);
  }

  function handleSelectAccount(accountId: string) {
    const nextAccount =
      demoAccounts.find((account) => account.id === accountId) ?? demoAccounts[0];
    setSelectedAccountId(nextAccount.id);
    setActiveActionId(null);
    setEditorText(getAccountArtifact(nextAccount, activeActionType).body);
  }

  function handleOpenActionPlan(accountId: string) {
    handleSelectAccount(accountId);
    setActiveView("Action Queue");
    setActionPlanOpen(true);
  }

  function handleSetActiveView(view: ViewName) {
    setActiveView(view);
    if (view === "Action Queue") {
      setActionPlanOpen(false);
    }
  }

  function handleSetActiveActionType(type: ActionType) {
    setActiveActionType(type);
    setActiveActionId(null);
    setEditorText(getAccountArtifact(selectedAccount, type).body);
  }

  function handleSetOverrideRole(role: OverrideRole) {
    setOverrideRoleByAccount((current) => ({
      ...current,
      [selectedAccount.id]: role,
    }));
  }

  function handleSetProfessionalNote(note: string) {
    setProfessionalNotes((current) => ({
      ...current,
      [selectedAccount.id]: note,
    }));
  }

  function handleFeedback(status: FeedbackStatus) {
    setStatusByAccount((current) => ({
      ...current,
      [selectedAccount.id]: status,
    }));
    appendWorkflowEvent(
      selectedAccount.id,
      `Recommendation ${status.toLowerCase()}`,
      statusDescriptions[status],
    );
  }

  function handleGenerateAction() {
    const artifact = getAccountArtifact(selectedAccount, activeActionType);
    setIsGenerating(true);
    window.setTimeout(() => {
      const generatedAction: GeneratedAction = {
        id: `${selectedAccount.id}-${activeActionType}-${Date.now()}`,
        accountId: selectedAccount.id,
        type: activeActionType,
        title: artifact.title,
        body: artifact.body,
        status: "Draft",
        timestamp: createTimestamp(),
      };

      setActions((current) => [generatedAction, ...current]);
      setActiveActionId(generatedAction.id);
      setEditorText(generatedAction.body);
      setIsGenerating(false);
      appendWorkflowEvent(
        selectedAccount.id,
        `${actionTypeLabels[activeActionType]} draft generated`,
        "Draft stored in local action history for human review.",
      );
    }, 450);
  }

  function handleRegenerateWithNotes() {
    const artifact = getAccountArtifact(selectedAccount, activeActionType);
    const note = professionalNote.trim();
    const overrideContext = note
      ? note
      : "No additional note supplied. Revalidated the autonomous plan against the selected role.";
    const regeneratedBody = `${artifact.body}

---
Professional override (${selectedOverrideRole}):
${overrideContext}

OrbitIQ adjustment:
Keep the recommendation grounded in the existing evidence, route the next step to ${selectedAccount.suggestedOwner}, and avoid unsupported claims.`;

    const generatedAction: GeneratedAction = {
      id: `${selectedAccount.id}-${activeActionType}-override-${Date.now()}`,
      accountId: selectedAccount.id,
      type: activeActionType,
      title: `${artifact.title} - override draft`,
      body: regeneratedBody,
      status: "Draft",
      timestamp: createTimestamp(),
    };

    setActions((current) => [generatedAction, ...current]);
    setActiveActionId(generatedAction.id);
    setEditorText(generatedAction.body);
    setStatusByAccount((current) => ({
      ...current,
      [selectedAccount.id]: "Edited",
    }));
    appendWorkflowEvent(
      selectedAccount.id,
      "Professional override applied",
      `${selectedOverrideRole} context regenerated the ${actionTypeLabels[activeActionType].toLowerCase()} draft.`,
    );
  }

  function handleSaveAction() {
    if (!activeAction) return;
    setActions((current) =>
      current.map((action) =>
        action.id === activeAction.id
          ? { ...action, body: editorText, status: "Saved" }
          : action,
      ),
    );
    appendWorkflowEvent(
      selectedAccount.id,
      `${actionTypeLabels[activeAction.type]} edited`,
      "Draft content saved locally before downstream creation.",
    );
  }

  function handleCreateAction() {
    if (!activeAction) return;
    setActions((current) =>
      current.map((action) =>
        action.id === activeAction.id
          ? { ...action, body: editorText, status: "Created" }
          : action,
      ),
    );
    appendWorkflowEvent(
      selectedAccount.id,
      `${actionTypeLabels[activeAction.type]} created`,
      "Created in demo mode. No external system was called.",
    );
  }

  function handleRegenerateSignals() {
    appendWorkflowEvent(
      selectedAccount.id,
      "Signals regenerated",
      `Thresholds applied: spend ${thresholds.spendGrowthPct}%, usage ${thresholds.usageGrowthPct}%, commitment floor ${thresholds.commitmentUtilizationPct}%, renewal window ${thresholds.renewalWindowDays} days, greenfield keywords ${thresholds.greenfieldKeywordCount}.`,
    );
  }

  function handleSetConnectorEnabled(connectorId: string, enabled: boolean) {
    setConnectorEnabledState((current) => ({
      ...current,
      [connectorId]: enabled,
    }));
  }

  return (
    <main className="min-h-screen bg-zinc-100 text-zinc-950">
      <div className="grid min-h-screen lg:grid-cols-[260px_1fr]">
        <Sidebar activeView={activeView} setActiveView={handleSetActiveView} />
        <div className="min-w-0">
          <div className="p-4 sm:p-6">
            {activeView === "Action Queue" ? (
              <QueueView
                accounts={filteredAccounts}
                statusByAccount={statusByAccount}
                selectedAccount={selectedAccount}
                selectedAccountId={selectedAccountId}
                actionPlanOpen={actionPlanOpen}
                onOpenActionPlan={handleOpenActionPlan}
                onBackToQueue={() => setActionPlanOpen(false)}
                filters={filters}
                setFilters={setFilters}
                advancedFiltersOpen={advancedFiltersOpen}
                setAdvancedFiltersOpen={setAdvancedFiltersOpen}
                owners={owners}
                regions={regions}
                industries={industries}
                sources={sources}
                workflowEvents={workflowEvents}
                onFeedback={handleFeedback}
                overrideRole={selectedOverrideRole}
                setOverrideRole={handleSetOverrideRole}
                professionalNote={professionalNote}
                setProfessionalNote={handleSetProfessionalNote}
                onRegenerateWithNotes={handleRegenerateWithNotes}
                activeActionType={activeActionType}
                setActiveActionType={handleSetActiveActionType}
                editorText={editorText}
                setEditorText={setEditorText}
                activeAction={activeAction}
                isGenerating={isGenerating}
                onGenerateAction={handleGenerateAction}
                onSaveAction={handleSaveAction}
                onCreateAction={handleCreateAction}
              />
            ) : null}

            {activeView === "Accounts" ? (
              <AccountsView
                statusByAccount={statusByAccount}
                setSelectedAccountId={handleOpenActionPlan}
                setActiveView={setActiveView}
              />
            ) : null}

            {activeView === "Signals" ? <SignalsView /> : null}

            {activeView === "Generated Actions" ? (
              <GeneratedActionsView actions={actions} />
            ) : null}

            {activeView === "Demo Scenarios" ? (
              <DemoScenariosView
                setSelectedAccountId={handleOpenActionPlan}
                setActiveView={setActiveView}
              />
            ) : null}

            {activeView === "Settings" ? (
              <SettingsView
                thresholds={thresholds}
                setThresholds={setThresholds}
                onRegenerateSignals={handleRegenerateSignals}
                connectorEnabled={connectorEnabled}
                setConnectorEnabled={handleSetConnectorEnabled}
              />
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
