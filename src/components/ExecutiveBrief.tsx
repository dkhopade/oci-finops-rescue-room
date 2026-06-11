import { formatCurrency, formatPercent } from "@/lib/analyzeFinops";
import { makeSalesFollowUpEmail } from "@/lib/generateBrief";
import type { DemoCustomer, Recommendation } from "@/lib/types";

type ExecutiveBriefProps = {
  customer: DemoCustomer;
  totalMonthlySpend: number;
  estimatedMonthlySavings: number;
  recommendations: Recommendation[];
  executiveBrief: string;
  copyMessage: string;
  copyMessageTone: "success" | "warning";
  onCopyBrief: () => void;
  onDownloadBrief: () => void;
};

function ExecutiveBriefArtifact({
  customer,
  totalSpend,
  totalSavings,
  recommendations,
}: {
  customer: DemoCustomer;
  totalSpend: number;
  totalSavings: number;
  recommendations: Recommendation[];
}) {
  const topSavings = recommendations
    .filter((recommendation) => recommendation.estimatedMonthlySavings > 0)
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
    .slice(0, 3);
  const savingsPct = totalSpend > 0 ? (totalSavings / totalSpend) * 100 : 0;
  const salesFollowUpEmail = makeSalesFollowUpEmail(
    customer,
    recommendations,
    totalSavings,
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-red-700">
              Customer-facing brief
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">
              {customer.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              OCI cost optimization action plan
            </p>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-600">
            Working draft
          </span>
        </div>
      </div>

      <div className="grid gap-4 border-b border-slate-200 bg-slate-50 px-6 py-5 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Run rate reviewed
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {formatCurrency(totalSpend)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Savings target
          </p>
          <p className="mt-2 text-xl font-semibold text-emerald-700">
            {formatCurrency(totalSavings)}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Opportunity rate
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-950">
            {formatPercent(savingsPct)}
          </p>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6">
        <section>
          <h4 className="text-sm font-semibold uppercase text-slate-500">
            Opening summary
          </h4>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {customer.name} can pursue a focused 30-day OCI FinOps sprint that
            targets {formatCurrency(totalSavings)} in estimated monthly savings
            while improving ownership, cost attribution, and exposure review
            discipline.
          </p>
        </section>

        <section>
          <h4 className="text-sm font-semibold uppercase text-slate-500">
            Top savings opportunities
          </h4>
          <div className="mt-3 space-y-3">
            {topSavings.map((recommendation, index) => (
              <div
                key={recommendation.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      Opportunity {index + 1}
                    </p>
                    <p className="mt-1 font-semibold text-slate-950">
                      {recommendation.recommendationTitle}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {formatCurrency(recommendation.estimatedMonthlySavings)}/mo
                  </p>
                </div>
                <p className="mt-2 text-sm leading-5 text-slate-600">
                  {recommendation.technicalAction}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-500">
              30-day action plan
            </h4>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li>1. Validate resource owners and business criticality.</li>
              <li>2. Approve low-effort cleanup and lifecycle changes.</li>
              <li>3. Right-size compute and schedule non-production workloads.</li>
              <li>4. Launch recurring FinOps governance checkpoints.</li>
            </ol>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase text-slate-500">
              Next meeting agenda
            </h4>
            <ol className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
              <li>1. Confirm executive savings target.</li>
              <li>2. Review high-severity and quick-win findings.</li>
              <li>3. Assign technical owners and due dates.</li>
              <li>4. Agree on reporting cadence and success metrics.</li>
            </ol>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <h4 className="text-sm font-semibold uppercase text-slate-500">
            Sales follow-up email
          </h4>
          <div className="mt-3 rounded-md border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase text-slate-500">
              Subject
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">
              {salesFollowUpEmail.subject}
            </p>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <p className="text-xs font-semibold uppercase text-slate-500">
                Email body
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
                {salesFollowUpEmail.body}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export function ExecutiveBrief({
  customer,
  totalMonthlySpend,
  estimatedMonthlySavings,
  recommendations,
  executiveBrief,
  copyMessage,
  copyMessageTone,
  onCopyBrief,
  onDownloadBrief,
}: ExecutiveBriefProps) {
  return (
    <section
      id="executive-brief"
      className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Executive brief
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            Professional customer artifact
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onCopyBrief}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            Copy Executive Brief
          </button>
          <button
            type="button"
            onClick={onDownloadBrief}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-800"
          >
            Download Markdown Brief
          </button>
          {copyMessage ? (
            <p
              className={`basis-full text-sm font-medium ${
                copyMessageTone === "success"
                  ? "text-emerald-700"
                  : "text-amber-700"
              }`}
              role="status"
              aria-live="polite"
            >
              {copyMessage}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <ExecutiveBriefArtifact
          customer={customer}
          totalSpend={totalMonthlySpend}
          totalSavings={estimatedMonthlySavings}
          recommendations={recommendations}
        />
        <pre className="max-h-[760px] overflow-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-700 shadow-xl">
          {executiveBrief}
        </pre>
      </div>
    </section>
  );
}
