# OrbitIQ Submission Draft

## What did you build?

We built OrbitIQ, an action-first workspace for cloud sales and pre-sales engineering teams. OrbitIQ turns cloud spend, usage, commitment, CRM, support, renewal, and public-research signals into a ranked daily account-action queue. The demo shows three account journeys: an existing-customer growth play, an existing-customer risk/save play, and a greenfield discovery hypothesis. For each account, the app shows why the account needs attention now, the evidence behind the recommendation, the impact estimate, the human decision controls, and an editable downstream draft for email, CRM, Jira, internal handoff, account brief, or discovery brief.

## Who has this problem?

The first users are cloud account executives and solution engineers who manage expansion, renewal confidence, and architecture-review motions. Today they manually inspect billing exports, usage dashboards, commitment utilization, CRM notes, support tickets, renewal dates, and public account research before deciding which customer to contact and what to say. That takes roughly 90-120 minutes per account in the modeled workflow and often leads to missed expansion timing, late risk intervention, generic outreach, and poor sales-to-engineering handoffs.

This problem extends beyond one team: customer success managers, FinOps advisors, partner/MSP teams, and cloud GTM leaders all need the same account-level synthesis. The first wedge is the daily sales + pre-sales action queue because those teams already own the customer conversation and can immediately turn a signal into pipeline, renewal protection, or an architecture review.

## How does your app solve it?

Before OrbitIQ, the user has to ask, "Which account should I look at, which signal matters, and what action should I take?" After OrbitIQ, the user opens one queue, sees ranked accounts, opens an account action plan, reviews the evidence, approves or adjusts the recommendation, and creates a draft handoff without leaving the workflow.

The deepest demo path is Beta Health: open the Action Queue, choose Beta Health, review the risk/save recommendation, inspect evidence from cloud spend, utilization, support, renewal, and CRM signals, click Adjust to reveal the professional override panel, add sales or engineering context, regenerate the draft, then create the downstream record in demo mode. This shows the product experience beyond a dashboard: signal triage, evidence-backed reasoning, human decision, professional override, draft generation, and approval-gated downstream creation.

The measurable demo impact is $1.18M of modeled pipeline, renewal protection, and savings across the three seeded accounts. The workflow also demonstrates 9 signals across 5 connector categories: cloud spend, commitment management, CRM, Jira service management, and public web research.

## How did you build it?

We built the MVP with Next.js 16, React, TypeScript, and local deterministic seed data. The core model is typed around accounts, signals, evidence, connectors, score breakdowns, impact estimates, generated artifacts, and workflow events. The UI is intentionally product-first: the first screen is the action queue, not a landing page, and the account plan contains the full workflow from recommendation to downstream draft.

Production-shaped parts: typed domain model, deterministic seed validation, connector configuration surface, no external writes, local workflow state, lint passing, and production build passing. Hackathon-grade parts: demo data is local, scoring and generation are deterministic, workflow state is browser-local, and real authentication, persistence, connector OAuth, audit logs, evaluation traces, and CRM/Jira/Slack writes are not enabled yet.

## Demo URL

http://localhost:3000

## Repo URL

https://github.com/dkhopade/oci-finops-rescue-room

## Verification Instructions

1. Run `npm install` if dependencies are not already installed.
2. Run `npm run seed:demo` to validate the deterministic seed dataset.
3. Run `npm run dev` and open `http://localhost:3000`.
4. In Action Queue, confirm the impact model shows `$1.18M`, `90-120 min/account`, `9 signals / 5 connectors`, and the sales + pre-sales wedge.
5. Open Beta Health from the queue. Confirm the account action plan opens with autonomous recommendation, account workflow, evidence drawer, impact estimate, decision controls, and prepared downstream draft.
6. Click `Adjust`, add a professional note, and regenerate with notes. Confirm Professional Override appears only after Adjust and the generated draft includes the override context.
7. Click `Prepare Draft`, then `Create`. Confirm the action history records a created demo-mode downstream handoff without calling an external system.
8. Open Signals and filter by account and signal type. Confirm signal counts update from the connector-backed signal explorer.
9. Open Settings and confirm connector configuration exists for Cloud Spend Platform, Commitment Management, CRM, Jira Service Management, and Public Web Research.

## Extra Notes

OrbitIQ is deliberately positioned as an action system rather than another FinOps dashboard. The durable loop is that every accepted, adjusted, created, dismissed, and converted recommendation becomes feedback data for future ranking and workflow learning. Once the sales + pre-sales wedge works, the same action graph expands naturally into customer success, FinOps, partner/MSP operations, and leadership reporting.
