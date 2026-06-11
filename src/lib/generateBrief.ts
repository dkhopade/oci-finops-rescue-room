import {
  calculateTotalMonthlySpend,
  formatCurrency,
  formatPercent,
} from "./analyzeFinops";
import type { DemoCustomer, OciResource, Recommendation } from "./types";

export function makeSalesFollowUpEmail(
  customer: DemoCustomer,
  recommendations: Recommendation[],
  totalSavings: number,
) {
  const topSavings = recommendations
    .filter((recommendation) => recommendation.estimatedMonthlySavings > 0)
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
    .slice(0, 3);
  const opportunitySummary =
    topSavings.length > 0
      ? topSavings
          .map((recommendation) => recommendation.category.toLowerCase())
          .join(", ")
      : "cost optimization and governance opportunities";

  return {
    subject: `${customer.name} OCI optimization next steps`,
    body: `Hi team,

Thank you for the discovery call. Based on the current OCI resource sample, we identified ${formatCurrency(totalSavings)} in estimated monthly savings potential, led by ${opportunitySummary}.

As a next step, I recommend a 45-minute working session with your platform, FinOps, and application owners to validate the top findings, approve quick wins, and align on a 30-day action plan.

Best,
OCI account team`,
  };
}

export function makeExecutiveBrief(
  customer: DemoCustomer,
  resources: OciResource[],
  recommendations: Recommendation[],
  totalSavings: number,
) {
  const totalSpend = calculateTotalMonthlySpend(resources);
  const topSavings = recommendations
    .filter((recommendation) => recommendation.estimatedMonthlySavings > 0)
    .sort((a, b) => b.estimatedMonthlySavings - a.estimatedMonthlySavings)
    .slice(0, 3);
  const highSeverity = recommendations.filter(
    (recommendation) => recommendation.severity === "High",
  ).length;
  const savingsPct = totalSpend > 0 ? (totalSavings / totalSpend) * 100 : 0;
  const salesFollowUpEmail = makeSalesFollowUpEmail(
    customer,
    recommendations,
    totalSavings,
  );

  const topSavingsText = topSavings
    .map(
      (item, index) =>
        `${index + 1}. ${item.recommendationTitle}: ${formatCurrency(
          item.estimatedMonthlySavings,
        )}/month estimated savings. ${item.technicalAction}`,
    )
    .join("\n");

  return `# OrbitIQ Brief: ${customer.name}

${customer.name} has an estimated ${formatCurrency(totalSpend)} in monthly OCI run rate across the sampled resources. The rule-based review identified ${recommendations.length} optimization findings, including ${highSeverity} high-severity items, with an estimated savings opportunity of ${formatCurrency(totalSavings)} per month (${formatPercent(savingsPct)} of sampled spend). The strongest near-term path is to combine quick storage cleanup, non-production controls, and targeted compute right-sizing while preserving migration and modernization momentum.

## Top 3 Savings Opportunities
${topSavingsText}

## Recommended 30-Day Action Plan
1. Week 1: Validate owners, cost centers, and business criticality for the flagged resources.
2. Week 2: Execute low-effort storage lifecycle and unattached volume actions after snapshot or retention approval.
3. Week 3: Run compute right-sizing reviews with OCI metrics and agree on off-hours schedules for non-production workloads.
4. Week 4: Establish recurring FinOps governance with cost center hygiene, public exposure review, and exception reporting.

## Suggested Next Meeting Agenda
1. Confirm the executive savings target and acceptable risk boundaries.
2. Review the top findings by business owner and environment.
3. Approve immediate low-effort actions and assign technical owners.
4. Align on a 30-day governance cadence and success metrics.

## Sales Follow-Up Email
Subject: ${salesFollowUpEmail.subject}

${salesFollowUpEmail.body}`;
}
