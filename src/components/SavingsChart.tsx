import {
  formatCurrency,
  getCategorySavings,
} from "@/lib/analyzeFinops";
import type { Recommendation } from "@/lib/types";

export function SavingsChart({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const categorySavings = getCategorySavings(recommendations);
  const maxSavings = Math.max(
    1,
    ...categorySavings.map((category) => category.savings),
  );

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Savings concentration
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Monthly savings by category
          </h2>
        </div>
        <p className="text-sm text-slate-500">
          {categorySavings.length} active categories
        </p>
      </div>
      <div className="mt-6 space-y-4">
        {categorySavings.map((category) => (
          <div key={category.category}>
            <div className="mb-2 flex items-center justify-between gap-4 text-sm">
              <span className="font-medium text-slate-700">
                {category.category}
              </span>
              <span className="text-slate-600">
                {formatCurrency(category.savings)}
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-md bg-slate-100">
              <div
                className="h-full rounded-md bg-emerald-600"
                style={{
                  width: `${Math.max(4, (category.savings / maxSavings) * 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RiskEffortSection({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  const quadrants = [
    {
      label: "Executive quick wins",
      matcher: (item: Recommendation) =>
        item.severity === "High" && item.effort !== "High",
      tone: "border-emerald-200 bg-emerald-50",
    },
    {
      label: "Architected remediation",
      matcher: (item: Recommendation) =>
        item.severity === "High" && item.effort === "High",
      tone: "border-red-200 bg-red-50",
    },
    {
      label: "Governance cleanup",
      matcher: (item: Recommendation) =>
        item.severity !== "High" && item.effort === "Low",
      tone: "border-sky-200 bg-sky-50",
    },
    {
      label: "Backlog candidates",
      matcher: (item: Recommendation) =>
        item.severity !== "High" && item.effort !== "Low",
      tone: "border-slate-200 bg-slate-50",
    },
  ];

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Risk vs effort
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Prioritization view
          </h2>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {quadrants.map((quadrant) => {
          const items = recommendations.filter(quadrant.matcher);
          const savings = items.reduce(
            (sum, item) => sum + item.estimatedMonthlySavings,
            0,
          );

          return (
            <div
              key={quadrant.label}
              className={`min-h-36 rounded-lg border p-4 ${quadrant.tone}`}
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-slate-950">
                  {quadrant.label}
                </h3>
                <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-slate-700 shadow-sm">
                  {items.length}
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold text-slate-950">
                {formatCurrency(savings)}
              </p>
              <p className="mt-2 text-sm leading-5 text-slate-600">
                {items.length > 0
                  ? items
                      .slice(0, 2)
                      .map((item) => item.resourceName)
                      .join(", ")
                  : "No current findings in this quadrant."}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
