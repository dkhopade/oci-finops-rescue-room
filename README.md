# OCI FinOps Rescue Room

## One-Line Pitch

OCI FinOps Rescue Room turns rough OCI resource and cost signals into an executive-ready cost optimization plan in under 60 seconds.

## Demo URL

- Demo URL: [https://oci-finops-rescue-room.vercel.app/](https://oci-finops-rescue-room.vercel.app/)
- GitHub Repo: [dkhopade/oci-finops-rescue-room](https://github.com/dkhopade/oci-finops-rescue-room)

## Problem Statement

OCI account teams often discover cost optimization signals during planning or discovery calls: idle compute, unattached storage, missing lifecycle policies, non-production sprawl, missing cost center tags, and public exposure risk. Those signals are valuable, but they are usually scattered across notes, exports, and technical conversations instead of packaged into a clear business action plan.

## Target Users

- OCI IaaS sales reps
- OCI sales solution architects

## What The App Does

The app provides a demo-ready workspace where a rep or solution architect can load a mock customer, review OCI resource signals, identify savings and governance findings, and generate a customer-facing executive brief.

Core capabilities:

- Loads three demo customers with realistic OCI IaaS resource samples.
- Runs local rule-based analysis for cost, utilization, tagging, lifecycle, attachment, environment, and exposure signals.
- Calculates estimated monthly savings, severity, effort, confidence, and owner suggestions.
- Shows KPI cards, grouped recommendations, a recommendation table, a simple Tailwind savings chart, and a risk vs effort view.
- Generates an Executive Brief with top opportunities, a 30-day action plan, next meeting agenda, and concise sales follow-up email.
- Supports copying the brief and downloading it as Markdown.
- Includes optional CSV upload for similarly shaped mock data.

## Why It Matters

For a sales team, speed matters. This MVP helps an account team move from "we noticed some cost issues" to a credible executive conversation: quantified savings, clear owners, low-effort next steps, and a professional follow-up artifact. It helps position OCI as a cloud partner focused on optimization, governance, and customer outcomes.

## Core Demo Flow

1. Open the app and click `Load Demo Customer`.
2. Review the selected customer's total monthly spend, estimated savings, savings percentage, finding count, and high-severity count.
3. Switch between `RetailCo Expansion`, `HealthSys Modernization`, and `FinServ Non-Prod Sprawl` to show how findings adapt.
4. Walk through recommendation categories, severity badges, effort badges, and technical actions.
5. Use the savings chart and risk vs effort section to explain prioritization.
6. Open the Executive Brief and show the customer-facing summary.
7. Highlight the dedicated `Sales Follow-Up Email` section.
8. Click `Copy Executive Brief` or `Download Markdown Brief`.
9. Click `Reset Demo` to return to the landing state.

## Architecture

The MVP is intentionally local and lightweight.

- `src/app/page.tsx`: app state, customer selection, CSV upload, copy/download handlers, and page layout.
- `src/lib/demoData.ts`: all mock customer and OCI resource data.
- `src/lib/analyzeFinops.ts`: local rule engine, savings calculations, formatting helpers, CSV parsing, grouping, and category savings.
- `src/lib/generateBrief.ts`: Executive Brief and sales follow-up email generation.
- `src/lib/types.ts`: shared TypeScript types.
- `src/components/*`: reusable dashboard, selector, table, chart, KPI, and Executive Brief components.

There is no backend service, database, authentication layer, or real OCI API integration.

## Tech Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- Local mock data
- Local deterministic rule engine
- Browser Clipboard API for copy actions

## Local Setup Commands

Install dependencies:

```bash
npm install
```

Start the local dev server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run lint:

```bash
npm run lint
```

Run a production build:

```bash
npm run build
```

## Deployment Instructions

The app is designed to deploy cleanly to Vercel as a standard Next.js project.

1. Push the repository to GitHub or another Vercel-supported Git provider.
2. Import the project into Vercel.
3. Keep the default Next.js build settings.
4. Use `npm run build` as the build command.
5. Deploy.

No environment variables, secrets, OCI credentials, database, or authentication setup are required.

## Limitations

- Mock data only.
- No real OCI API integration.
- No authentication.
- No database or persistence.
- CSV upload is intentionally simple and expects fields similar to the mock data model.
- Savings estimates are rule-based approximations for demo purposes, not financial commitments.

## Future Enhancements

1. OCI Cost Reports import
2. Cloud Advisor recommendation import
3. Real tenancy read-only scan
4. CRM opportunity integration
5. Auto-generated customer workshop deck
