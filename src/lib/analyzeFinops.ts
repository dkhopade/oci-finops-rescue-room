import type { Effort, OciResource, Recommendation, Severity } from "./types";

const severityRank: Record<Severity, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

const effortRank: Record<Effort, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 1,
});

export function formatCurrency(value: number) {
  return currencyFormatter.format(Math.round(value));
}

export function formatPercent(value: number) {
  return `${percentFormatter.format(value)}%`;
}

function nonProd(environment: string) {
  return ["Dev", "Test", "QA"].includes(environment);
}

function calculateRecommendationSavings(
  resource: OciResource,
  multiplier: number,
) {
  return Math.max(0, Math.round(resource.monthlyCost * multiplier));
}

function getSeverity(
  resource: OciResource,
  estimatedMonthlySavings: number,
): Severity {
  if (estimatedMonthlySavings > 1000 || resource.isPublic) return "High";
  if (estimatedMonthlySavings >= 250 && estimatedMonthlySavings <= 1000) {
    return "Medium";
  }
  return "Low";
}

export function analyzeResources(resources: OciResource[]) {
  const recommendations: Recommendation[] = [];

  resources.forEach((resource) => {
    if (resource.service === "Compute" && resource.utilizationPct < 15) {
      const estimatedMonthlySavings = calculateRecommendationSavings(
        resource,
        0.35,
      );

      recommendations.push({
        id: `${resource.id}-underutilized-compute`,
        category: "Underutilized compute",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Right-size or schedule ${resource.resourceName}`,
        businessImpact:
          "Idle compute is tying up budget that can be redirected to committed growth, resilience, or migration priorities.",
        technicalAction:
          "Review shape metrics, right-size to the observed baseline, and add an off-hours schedule for non-production use.",
        estimatedMonthlySavings,
        severity: getSeverity(resource, estimatedMonthlySavings),
        effort: "Medium",
        confidencePct: 86,
        ownerSuggestion: "Solution Architect",
      });
    }

    if (resource.service === "Block Volume" && !resource.isAttached) {
      const estimatedMonthlySavings = calculateRecommendationSavings(
        resource,
        0.9,
      );

      recommendations.push({
        id: `${resource.id}-unattached-volume`,
        category: "Unattached block volume",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Archive or delete unattached volume ${resource.resourceName}`,
        businessImpact:
          "Detached storage is recurring spend with no active workload value and is often a quick executive win.",
        technicalAction:
          "Confirm recovery requirements, snapshot if needed, then remove the unattached block volume.",
        estimatedMonthlySavings,
        severity: getSeverity(resource, estimatedMonthlySavings),
        effort: "Low",
        confidencePct: 96,
        ownerSuggestion: "Customer Platform Team",
      });
    }

    if (
      resource.service === "Object Storage" &&
      !resource.hasLifecyclePolicy
    ) {
      const estimatedMonthlySavings = calculateRecommendationSavings(
        resource,
        0.2,
      );

      recommendations.push({
        id: `${resource.id}-object-lifecycle`,
        category: "Object storage lifecycle",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Add lifecycle policy to ${resource.resourceName}`,
        businessImpact:
          "A tiering and expiration policy reduces storage run rate while preserving data for audit and operating needs.",
        technicalAction:
          "Define retention windows, tier cold objects to archive storage, and expire obsolete non-production data.",
        estimatedMonthlySavings,
        severity: getSeverity(resource, estimatedMonthlySavings),
        effort: "Low",
        confidencePct: 82,
        ownerSuggestion: "Customer FinOps",
      });
    }

    if (nonProd(resource.environment) && resource.monthlyCost > 500) {
      const estimatedMonthlySavings = calculateRecommendationSavings(
        resource,
        0.4,
      );

      recommendations.push({
        id: `${resource.id}-non-prod-always-on`,
        category: "Non-prod always-on high spend",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Introduce non-production controls for ${resource.resourceName}`,
        businessImpact:
          "Non-production spend above the governance threshold indicates an opportunity to reclaim budget without touching customer-facing systems.",
        technicalAction:
          "Apply work-hour schedules, quota alerts, and owner approval for exceptions above the monthly threshold.",
        estimatedMonthlySavings,
        severity: getSeverity(resource, estimatedMonthlySavings),
        effort: "Medium",
        confidencePct: 78,
        ownerSuggestion: "Customer FinOps",
      });
    }

    if (resource.costCenter.trim() === "") {
      recommendations.push({
        id: `${resource.id}-missing-cost-center`,
        category: "Missing cost center tag",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Assign cost center ownership for ${resource.resourceName}`,
        businessImpact:
          "Governance risk: resources without cost center attribution slow executive accountability and make chargeback conversations harder.",
        technicalAction:
          "Add the approved cost center tag and create a policy exception report for any untagged resources.",
        estimatedMonthlySavings: 0,
        severity: getSeverity(resource, 0),
        effort: "Low",
        confidencePct: 99,
        ownerSuggestion: "Sales Rep",
      });
    }

    if (resource.isPublic) {
      recommendations.push({
        id: `${resource.id}-public-exposure`,
        category: "Public exposure review",
        resourceId: resource.id,
        resourceName: resource.resourceName,
        service: resource.service,
        compartment: resource.compartment,
        recommendationTitle: `Review public access for ${resource.resourceName}`,
        businessImpact:
          "Security/governance risk: public-facing resources can create avoidable exposure if they are not tied to a current business requirement.",
        technicalAction:
          "Validate the access path, restrict source ranges where possible, and document the business owner and approval.",
        estimatedMonthlySavings: 0,
        severity: getSeverity(resource, 0),
        effort: "Medium",
        confidencePct: 74,
        ownerSuggestion: "Solution Architect",
      });
    }
  });

  return recommendations.sort((a, b) => {
    const severityDelta = severityRank[b.severity] - severityRank[a.severity];
    if (severityDelta !== 0) return severityDelta;
    const savingsDelta = b.estimatedMonthlySavings - a.estimatedMonthlySavings;
    if (savingsDelta !== 0) return savingsDelta;
    return effortRank[a.effort] - effortRank[b.effort];
  });
}

export function calculateTotalMonthlySpend(resources: OciResource[]) {
  return resources.reduce((sum, resource) => sum + resource.monthlyCost, 0);
}

export function calculateEstimatedMonthlySavings(
  recommendations: Recommendation[],
) {
  return recommendations.reduce(
    (total, recommendation) =>
      total + recommendation.estimatedMonthlySavings,
    0,
  );
}

export function groupRecommendations(recommendations: Recommendation[]) {
  return recommendations.reduce<Record<string, Recommendation[]>>(
    (groups, recommendation) => {
      groups[recommendation.category] = [
        ...(groups[recommendation.category] ?? []),
        recommendation,
      ];
      return groups;
    },
    {},
  );
}

export function getCategorySavings(recommendations: Recommendation[]) {
  const grouped = groupRecommendations(recommendations);
  return Object.entries(grouped)
    .map(([category, items]) => ({
      category,
      savings: items.reduce(
        (sum, item) => sum + item.estimatedMonthlySavings,
        0,
      ),
      count: items.length,
    }))
    .sort((a, b) => b.savings - a.savings);
}

function parseBoolean(value: string | undefined) {
  if (!value) return false;
  return ["true", "yes", "y", "1"].includes(value.trim().toLowerCase());
}

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === "\"" && quoted && nextCharacter === "\"") {
      current += "\"";
      index += 1;
    } else if (character === "\"") {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      values.push(current.trim());
      current = "";
    } else {
      current += character;
    }
  }

  values.push(current.trim());
  return values;
}

export function parseCsvResources(csvText: string) {
  const rows = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (rows.length < 2) return [];

  const headers = parseCsvLine(rows[0]).map((header) => header.trim());

  return rows.slice(1).map((row, index) => {
    const values = parseCsvLine(row);
    const record = headers.reduce<Record<string, string>>(
      (accumulator, header, headerIndex) => {
        accumulator[header] = values[headerIndex] ?? "";
        return accumulator;
      },
      {},
    );

    return {
      id: record.id || `csv-${index + 1}`,
      resourceName: record.resourceName || `Imported resource ${index + 1}`,
      service: record.service || "Compute",
      compartment: record.compartment || "imported",
      environment: record.environment || "Dev",
      region: record.region || "us-ashburn-1",
      monthlyCost: Number(record.monthlyCost || 0),
      utilizationPct: Number(record.utilizationPct || 0),
      owner: record.owner || "Unassigned",
      costCenter: record.costCenter || "",
      hasLifecyclePolicy: parseBoolean(record.hasLifecyclePolicy),
      isAttached: parseBoolean(record.isAttached),
      isPublic: parseBoolean(record.isPublic),
      notes: record.notes || "Imported from CSV upload.",
    };
  });
}

export function buildCsvTemplate() {
  const headers = [
    "id",
    "resourceName",
    "service",
    "compartment",
    "environment",
    "region",
    "monthlyCost",
    "utilizationPct",
    "owner",
    "costCenter",
    "hasLifecyclePolicy",
    "isAttached",
    "isPublic",
    "notes",
  ];

  return headers.join(",");
}
