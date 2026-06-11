import { formatCurrency } from "@/lib/analyzeFinops";
import type { Effort, OciResource, Recommendation, Severity } from "@/lib/types";

const severityStyles: Record<Severity, string> = {
  High: "border-red-300 bg-red-100 text-red-800",
  Medium: "border-amber-300 bg-amber-100 text-amber-900",
  Low: "border-slate-300 bg-slate-100 text-slate-700",
};

const effortStyles: Record<Effort, string> = {
  Low: "border-emerald-300 bg-emerald-100 text-emerald-800",
  Medium: "border-sky-300 bg-sky-100 text-sky-800",
  High: "border-violet-300 bg-violet-100 text-violet-800",
};

function Pill({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export function RecommendationCard({
  recommendation,
}: {
  recommendation: Recommendation;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            {recommendation.category}
          </p>
          <h3 className="mt-2 text-lg font-semibold leading-6 text-slate-950">
            {recommendation.recommendationTitle}
          </h3>
        </div>
        <p className="text-right text-lg font-semibold text-emerald-700">
          {formatCurrency(recommendation.estimatedMonthlySavings)}
        </p>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        {recommendation.businessImpact}
      </p>
      <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600 md:grid-cols-2">
        <div>
          <p className="font-semibold text-slate-800">Technical action</p>
          <p className="mt-1 leading-5">{recommendation.technicalAction}</p>
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Pill className={severityStyles[recommendation.severity]}>
              {recommendation.severity}
            </Pill>
            <Pill className={effortStyles[recommendation.effort]}>
              {recommendation.effort} effort
            </Pill>
            <Pill className="border-slate-200 bg-slate-50 text-slate-700">
              {recommendation.confidencePct}% confidence
            </Pill>
          </div>
          <p>
            <span className="font-semibold text-slate-800">Owner:</span>{" "}
            {recommendation.ownerSuggestion}
          </p>
          <p>
            <span className="font-semibold text-slate-800">Resource:</span>{" "}
            {recommendation.resourceName}
          </p>
        </div>
      </div>
    </article>
  );
}

export function RecommendationTable({
  recommendations,
}: {
  recommendations: Recommendation[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Recommendation register
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          All recommended actions
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Savings</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Effort</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {recommendations.map((recommendation) => (
              <tr key={recommendation.id} className="align-top">
                <td className="min-w-72 px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {recommendation.recommendationTitle}
                  </p>
                  <p className="mt-1 text-slate-500">
                    {recommendation.resourceName} in{" "}
                    {recommendation.compartment}
                  </p>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {recommendation.category}
                </td>
                <td className="px-4 py-4 font-semibold text-emerald-700">
                  {formatCurrency(recommendation.estimatedMonthlySavings)}
                </td>
                <td className="px-4 py-4">
                  <Pill className={severityStyles[recommendation.severity]}>
                    {recommendation.severity}
                  </Pill>
                </td>
                <td className="px-4 py-4">
                  <Pill className={effortStyles[recommendation.effort]}>
                    {recommendation.effort}
                  </Pill>
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {recommendation.ownerSuggestion}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {recommendation.confidencePct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResourceSnapshot({ resources }: { resources: OciResource[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <p className="text-xs font-semibold uppercase text-slate-500">
          Resource signal sample
        </p>
        <h2 className="mt-2 text-xl font-semibold text-slate-950">
          OCI resources analyzed
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Resource</th>
              <th className="px-4 py-3">Service</th>
              <th className="px-4 py-3">Environment</th>
              <th className="px-4 py-3">Monthly cost</th>
              <th className="px-4 py-3">Utilization</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Cost center</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td className="min-w-64 px-4 py-4">
                  <p className="font-semibold text-slate-950">
                    {resource.resourceName}
                  </p>
                  <p className="mt-1 text-slate-500">{resource.region}</p>
                </td>
                <td className="px-4 py-4 text-slate-600">{resource.service}</td>
                <td className="px-4 py-4 text-slate-600">
                  {resource.environment}
                </td>
                <td className="px-4 py-4 font-semibold text-slate-800">
                  {formatCurrency(resource.monthlyCost)}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {resource.utilizationPct}%
                </td>
                <td className="px-4 py-4 text-slate-600">{resource.owner}</td>
                <td className="px-4 py-4 text-slate-600">
                  {resource.costCenter || "Missing"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
