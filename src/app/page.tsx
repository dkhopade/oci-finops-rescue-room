"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { CustomerSelector } from "@/components/CustomerSelector";
import { ExecutiveBrief } from "@/components/ExecutiveBrief";
import { KpiCard } from "@/components/KpiCard";
import {
  RecommendationCard,
  RecommendationTable,
  ResourceSnapshot,
} from "@/components/RecommendationTable";
import { RiskEffortSection, SavingsChart } from "@/components/SavingsChart";
import {
  analyzeResources,
  buildCsvTemplate,
  calculateEstimatedMonthlySavings,
  calculateTotalMonthlySpend,
  formatCurrency,
  formatPercent,
  groupRecommendations,
  parseCsvResources,
} from "@/lib/analyzeFinops";
import { demoCustomers } from "@/lib/demoData";
import { makeExecutiveBrief } from "@/lib/generateBrief";
import type { DemoCustomer } from "@/lib/types";

const defaultUploadMessage =
  "CSV import is optional. Demo customers are ready for the main flow.";

function EmptyDashboardState({ onLoadDemo }: { onLoadDemo: () => void }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="grid gap-8 p-6 lg:grid-cols-[0.85fr_1.15fr] lg:p-8">
        <div className="flex flex-col justify-center">
          <p className="text-xs font-semibold uppercase text-red-700">
            Demo-ready standby
          </p>
          <h2 className="mt-3 text-3xl font-semibold leading-tight text-slate-950">
            Load a customer to activate the rescue room.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-slate-600">
            The accelerator is staged for a live account-team walkthrough:
            select a demo customer, generate findings, and produce the
            executive brief without any external services.
          </p>
          <button
            type="button"
            onClick={onLoadDemo}
            className="mt-6 w-fit rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Load Demo Customer
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["01", "Signal intake", "Resource cost, utilization, tags"],
            ["02", "Rule analysis", "Savings, risk, confidence"],
            ["03", "Executive brief", "Plan, agenda, follow-up email"],
          ].map(([step, label, detail]) => (
            <div
              key={step}
              className="rounded-xl border border-slate-200 bg-slate-50 p-5"
            >
              <span className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                {step}
              </span>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">
                {label}
              </h3>
              <p className="mt-3 text-sm leading-5 text-slate-600">{detail}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full w-2/3 rounded-full bg-red-500" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [customers, setCustomers] = useState<DemoCustomer[]>(demoCustomers);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const [uploadMessage, setUploadMessage] = useState(defaultUploadMessage);
  const [copyMessage, setCopyMessage] = useState("");
  const [copyMessageTone, setCopyMessageTone] = useState<
    "success" | "warning"
  >("success");
  const workspaceRef = useRef<HTMLDivElement | null>(null);

  const selectedCustomer = customers.find(
    (customer) => customer.id === selectedCustomerId,
  );

  const recommendations = useMemo(
    () =>
      selectedCustomer ? analyzeResources(selectedCustomer.resources) : [],
    [selectedCustomer],
  );

  const totalMonthlySpend = useMemo(
    () =>
      selectedCustomer
        ? calculateTotalMonthlySpend(selectedCustomer.resources)
        : 0,
    [selectedCustomer],
  );

  const estimatedMonthlySavings = useMemo(
    () =>
      selectedCustomer
        ? calculateEstimatedMonthlySavings(recommendations)
        : 0,
    [selectedCustomer, recommendations],
  );

  const savingsPercentage =
    totalMonthlySpend > 0
      ? (estimatedMonthlySavings / totalMonthlySpend) * 100
      : 0;

  const highSeverityFindings = recommendations.filter(
    (recommendation) => recommendation.severity === "High",
  ).length;

  const recommendationsByCategory = groupRecommendations(recommendations);

  const executiveBrief = useMemo(
    () =>
      selectedCustomer
        ? makeExecutiveBrief(
            selectedCustomer,
            selectedCustomer.resources,
            recommendations,
            estimatedMonthlySavings,
          )
        : "",
    [selectedCustomer, recommendations, estimatedMonthlySavings],
  );

  function loadDemoCustomer() {
    setSelectedCustomerId(demoCustomers[0].id);
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetDemo() {
    setSelectedCustomerId(null);
    setUploadMessage(defaultUploadMessage);
    setCopyMessage("");
    setCopyMessageTone("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCsvUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const resources = parseCsvResources(text).filter(
        (resource) => resource.monthlyCost >= 0,
      );

      if (resources.length === 0) {
        setUploadMessage("No usable rows were found in that CSV.");
        return;
      }

      const importedCustomer: DemoCustomer = {
        id: `csv-${Date.now()}`,
        name: file.name.replace(/\.csv$/i, "") || "Imported OCI Resource Set",
        industry: "Imported CSV",
        accountTeam: "User supplied",
        executiveConcern:
          "Imported resource data is being analyzed with the same local rule engine.",
        resources,
      };

      setCustomers((currentCustomers) => [importedCustomer, ...currentCustomers]);
      setSelectedCustomerId(importedCustomer.id);
      setUploadMessage(
        `Loaded ${resources.length} resources from ${file.name}.`,
      );
    };
    reader.readAsText(file);
  }

  async function copyBrief() {
    if (!executiveBrief) {
      setCopyMessageTone("warning");
      setCopyMessage("Load a customer before copying the executive brief.");
      window.setTimeout(() => setCopyMessage(""), 2400);
      return;
    }

    try {
      if (!navigator.clipboard) {
        throw new Error("Clipboard API unavailable");
      }

      await navigator.clipboard.writeText(executiveBrief);
      setCopyMessageTone("success");
      setCopyMessage("Executive brief copied to clipboard.");
    } catch {
      setCopyMessageTone("warning");
      setCopyMessage(
        "Clipboard access is unavailable. Use Download Markdown Brief instead.",
      );
    }

    window.setTimeout(() => setCopyMessage(""), 2400);
  }

  function downloadBrief() {
    if (!selectedCustomer || !executiveBrief) return;

    const blob = new Blob([executiveBrief], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${selectedCustomer.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}-oci-finops-brief.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <header className="border-b border-slate-200 bg-white text-slate-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg border border-red-200 bg-red-50 text-sm font-semibold text-red-700">
              CR
            </div>
            <div>
              <p className="text-sm font-semibold text-red-700">OCI FinOps</p>
              <p className="text-lg font-semibold text-slate-950">
                Rescue Room
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              Local rules
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              No OCI API
            </span>
            <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              Vercel ready
            </span>
          </div>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-slate-50 text-slate-950">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold text-red-700">
              Enterprise cloud cost accelerator
            </p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-tight text-slate-950 sm:text-6xl">
              OCI FinOps Rescue Room
            </h1>
            <p className="mt-5 max-w-2xl text-xl leading-8 text-slate-600">
              Find OCI savings opportunities and generate a customer-ready
              action plan in 60 seconds.
            </p>
            <div className="mt-7 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ["Rule engine", "6 local checks"],
                ["Artifact", "Markdown brief"],
                ["Demo flow", "No login"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs uppercase text-slate-500">{label}</p>
                  <p className="mt-2 font-semibold text-slate-950">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={loadDemoCustomer}
                className="rounded-md bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Load Demo Customer
              </button>
              <button
                type="button"
                onClick={() =>
                  workspaceRef.current?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="rounded-md border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
              >
                View Workflow
              </button>
              {selectedCustomer ? (
                <button
                  type="button"
                  onClick={resetDemo}
                  className="rounded-md border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Reset Demo
                </button>
              ) : null}
            </div>
          </div>

          <CustomerSelector
            customers={customers}
            selectedCustomer={selectedCustomer}
            selectedCustomerId={selectedCustomerId}
            totalMonthlySpend={totalMonthlySpend}
            estimatedMonthlySavings={estimatedMonthlySavings}
            findingsCount={recommendations.length}
            onSelectCustomer={setSelectedCustomerId}
          />
        </div>
      </section>

      <section
        ref={workspaceRef}
        className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8"
      >
        {!selectedCustomer ? (
          <EmptyDashboardState onLoadDemo={loadDemoCustomer} />
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Active rescue room
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-slate-950">
                      {selectedCustomer.name}
                    </h2>
                    <button
                      type="button"
                      onClick={resetDemo}
                      className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Reset Demo
                    </button>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    {selectedCustomer.executiveConcern}
                  </p>
                </div>
                <div className="min-w-64 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                  <p className="text-xs font-semibold uppercase text-emerald-700">
                    Estimated Monthly Savings
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-emerald-950">
                    {formatCurrency(estimatedMonthlySavings)}
                  </p>
                  <p className="mt-2 text-sm text-emerald-800">
                    {formatPercent(savingsPercentage)} of sampled run rate
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-6">
              <KpiCard
                label="Total monthly spend"
                value={formatCurrency(totalMonthlySpend)}
                detail={`${selectedCustomer.resources.length} OCI resources in sample`}
                tone="slate"
              />
              <KpiCard
                label="Estimated monthly savings"
                value={formatCurrency(estimatedMonthlySavings)}
                detail="Rule-based estimate from current findings"
                tone="green"
                featured
              />
              <KpiCard
                label="Savings percentage"
                value={formatPercent(savingsPercentage)}
                detail="Of sampled run rate"
                tone="blue"
              />
              <KpiCard
                label="Number of findings"
                value={String(recommendations.length)}
                detail="Generated by local rules"
                tone="amber"
              />
              <KpiCard
                label="High-severity findings"
                value={String(highSeverityFindings)}
                detail="Prioritize in account review"
                tone="red"
              />
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Customer context
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  {selectedCustomer.name}
                </h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {selectedCustomer.executiveConcern}
                </p>
                <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-semibold text-slate-900">Industry</dt>
                    <dd className="mt-1 text-slate-600">
                      {selectedCustomer.industry}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">
                      Account team
                    </dt>
                    <dd className="mt-1 text-slate-600">
                      {selectedCustomer.accountTeam}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-900">Top owner</dt>
                    <dd className="mt-1 text-slate-600">
                      {recommendations[0]?.ownerSuggestion ?? "Customer FinOps"}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Optional CSV import
                    </p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950">
                      Bring a rough OCI resource export
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(buildCsvTemplate())
                    }
                    className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Copy CSV Header
                  </button>
                </div>
                <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
                  <input
                    type="file"
                    accept=".csv,text/csv"
                    onChange={handleCsvUpload}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-red-700 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-red-800"
                  />
                  <p className="mt-3 text-sm leading-5 text-slate-600">
                    {uploadMessage}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <SavingsChart recommendations={recommendations} />
              <RiskEffortSection recommendations={recommendations} />
            </div>

            <section className="mt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Recommendations by category
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                    Customer-ready optimization plan
                  </h2>
                </div>
              </div>
              <div className="grid gap-6">
                {Object.entries(recommendationsByCategory).map(
                  ([category, items]) => (
                    <section key={category}>
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-950">
                          {category}
                        </h3>
                        <span className="text-sm text-slate-600">
                          {items.length} findings
                        </span>
                      </div>
                      <div className="grid gap-4 xl:grid-cols-2">
                        {items.map((recommendation) => (
                          <RecommendationCard
                            key={recommendation.id}
                            recommendation={recommendation}
                          />
                        ))}
                      </div>
                    </section>
                  ),
                )}
              </div>
            </section>

            <div className="mt-8">
              <RecommendationTable recommendations={recommendations} />
            </div>

            <div className="mt-8">
              <ResourceSnapshot resources={selectedCustomer.resources} />
            </div>

            <ExecutiveBrief
              customer={selectedCustomer}
              totalMonthlySpend={totalMonthlySpend}
              estimatedMonthlySavings={estimatedMonthlySavings}
              recommendations={recommendations}
              executiveBrief={executiveBrief}
              copyMessage={copyMessage}
              copyMessageTone={copyMessageTone}
              onCopyBrief={copyBrief}
              onDownloadBrief={downloadBrief}
            />
          </>
        )}
      </section>
    </main>
  );
}
