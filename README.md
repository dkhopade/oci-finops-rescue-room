# OrbitIQ

OrbitIQ turns cloud consumption, customer health, and market research signals into prioritized account-growth actions.

The MVP is built as a deterministic investor demo. It does not connect to real billing, CRM, support, Slack, Jira, Teams, or email systems. Every generated artifact is an editable draft or demo-mode created record.

## Why This Exists

Cloud account teams waste hours stitching together usage exports, spend trends, support tickets, CRM notes, renewal dates, and public account research. The current workflow is slow, inconsistent, and easy to miss until expansion or retention timing has already passed.

OrbitIQ makes the workflow action-first:

- Rank accounts by urgency, impact, fit, momentum, and confidence.
- Explain why each account is recommended today.
- Show source-backed evidence for every recommendation.
- Present autonomous next-best actions before manual prompting.
- Let sales and engineering professionals add field context and regenerate the action plan.
- Prepare customer-safe draft actions.
- Capture feedback outcomes for future learning.

## Target Users

- Cloud account executives
- Solution engineers
- Customer success managers
- FinOps advisors
- Partner and MSP account teams

Likely buyers include sales leadership, customer success leadership, solution engineering leadership, FinOps leadership, and cloud GTM operations.

## Demo Journeys

1. **Acme Retail: existing customer growth**
   - Object Storage spend is up 38%.
   - GPU Compute appears for the first time.
   - CRM notes mention a personalization initiative.
   - The app recommends a data and AI architecture review.

2. **Beta Health: existing customer risk/save**
   - Spend is up 31%.
   - Utilization is 45%.
   - Support tickets mention latency and cost surprise.
   - Renewal is on 2026-08-23.
   - The app recommends a rightsizing and renewal confidence review.

3. **Nova Logistics: greenfield discovery**
   - Public snippets mention regional expansion, route optimization, data/platform hiring, Kubernetes, and cloud migration.
   - The app creates a lower-confidence discovery hypothesis without implying internal usage data.

## What The App Includes

- Left navigation with Action Queue, Accounts, Signals, Generated Actions, Demo Scenarios, and Settings.
- Ranked account-action queue with required PRD columns.
- Autonomous recommendation panel with top evidence, confidence, owner, and recommended next action.
- Professional override workflow for sales, engineering, customer success, and FinOps notes.
- Filters for account type, play type, confidence, impact, owner, region, industry, renewal window, connector, and status.
- Sorting by priority, impact, urgency, confidence, newest signal, renewal proximity, and spend growth.
- Account detail panel with why-now explanation, evidence drawer, score breakdown, impact estimate, action plan, simplified decision controls, and action history.
- Action composer for customer email, internal handoff, CRM task, Jira ticket, account brief, and discovery brief.
- Created action state that proves no external system is called in demo mode.
- Signal explorer with connector, metric, baseline, change, detected date, confidence, and linked recommendation.
- Settings view for connector configuration and deterministic signal threshold controls.

## Local Setup

Install dependencies:

```bash
npm install
```

Validate the local seed dataset:

```bash
npm run seed:demo
```

Start the app:

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

## Repository Map

- `src/app/page.tsx`: interactive MVP workspace and local workflow state.
- `src/lib/orbitiq.ts`: typed demo account data, connector metadata, signals, evidence, scoring helpers, generated artifact templates, and formatting helpers.
- `data/demo/*.csv`: inspectable local seed files behind the demo connector story.
- `scripts/seed-demo.mjs`: deterministic seed-data validation command.
- `public/logos/*.svg`: local demo account visual assets.

## Rubric Alignment

- **Demand reality and problem severity:** specific cloud GTM workflow pain is shown in the product narrative and demo journeys.
- **Target customer and market scope:** multiple cloud account-team roles are represented, not one isolated user.
- **Solution fit and product design:** the first screen is the action queue, and each recommendation flows into draft actions.
- **Technical execution and demo proof:** the app runs locally, models source-system connectors, validates seed files, and supports interactive feedback/action state.
- **Differentiation and investment readiness:** OrbitIQ combines FinOps, RevOps, customer success, and solution engineering into a closed loop from signal detection to action outcome.

## MVP Limitations

- Mock data only.
- Local browser state only.
- No real integrations or external writes.
- Rule and recommendation content is deterministic for demo reliability.
- Financial values are directional estimates, not forecasts or commitments.
