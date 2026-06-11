import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const demoDir = path.join(root, "data", "demo");

const requiredFiles = [
  "accounts.csv",
  "usage_daily.csv",
  "commitments.csv",
  "support_tickets.csv",
  "crm_notes.csv",
  "research_snippets.csv",
];

const requiredAccounts = ["Acme Retail", "Beta Health", "Nova Logistics"];

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const [headerLine, ...rowLines] = lines;
  const headers = headerLine.split(",");

  return rowLines.map((line) => {
    const values = line.split(",");
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
}

const loaded = {};

for (const file of requiredFiles) {
  const filePath = path.join(demoDir, file);
  const text = await readFile(filePath, "utf8");
  const rows = parseCsv(text);
  loaded[file] = rows;

  if (rows.length === 0) {
    throw new Error(`${file} has no data rows`);
  }
}

const accountNames = new Set(loaded["accounts.csv"].map((row) => row.name));

for (const account of requiredAccounts) {
  if (!accountNames.has(account)) {
    throw new Error(`Missing required demo account: ${account}`);
  }
}

const usageAccounts = new Set(loaded["usage_daily.csv"].map((row) => row.account_name));
const researchAccounts = new Set(
  loaded["research_snippets.csv"].map((row) => row.account_name),
);

if (!usageAccounts.has("Acme Retail") || !usageAccounts.has("Beta Health")) {
  throw new Error("Usage demo data must cover Acme Retail and Beta Health");
}

if (!researchAccounts.has("Nova Logistics")) {
  throw new Error("Research demo data must cover Nova Logistics");
}

console.log("OrbitIQ demo seed validated");
console.log(`Accounts: ${loaded["accounts.csv"].length}`);
console.log(`Usage rows: ${loaded["usage_daily.csv"].length}`);
console.log(`Commitments: ${loaded["commitments.csv"].length}`);
console.log(`Support tickets: ${loaded["support_tickets.csv"].length}`);
console.log(`CRM notes: ${loaded["crm_notes.csv"].length}`);
console.log(`Research snippets: ${loaded["research_snippets.csv"].length}`);
