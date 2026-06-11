import { formatCurrency } from "@/lib/analyzeFinops";
import type { DemoCustomer } from "@/lib/types";

type CustomerSelectorProps = {
  customers: DemoCustomer[];
  selectedCustomer: DemoCustomer | undefined;
  selectedCustomerId: string | null;
  totalMonthlySpend: number;
  estimatedMonthlySavings: number;
  findingsCount: number;
  onSelectCustomer: (customerId: string) => void;
};

function CloudSignalVisual({
  customerName,
  totalSpend,
  totalSavings,
  findings,
}: {
  customerName: string;
  totalSpend: number;
  totalSavings: number;
  findings: number;
}) {
  const loaded = totalSpend > 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.055)_1px,transparent_1px)] bg-[size:36px_36px]" />
      <div className="relative">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Hyperscale signal map
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {customerName}
            </h2>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {loaded ? `${findings} findings` : "Ready"}
          </span>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-[0.8fr_1fr]">
          <div className="relative min-h-44 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <div className="absolute left-10 top-12 h-20 w-32 rounded-full border border-sky-300/60 bg-sky-100/70" />
            <div className="absolute left-20 top-7 h-20 w-20 rounded-full border border-sky-300/60 bg-sky-100/70" />
            <div className="absolute left-32 top-14 h-16 w-16 rounded-full border border-sky-300/60 bg-sky-100/70" />
            <div className="absolute left-12 top-24 h-14 w-40 rounded-full border border-sky-300/60 bg-sky-100/70" />
            <div className="absolute right-8 top-10 h-3 w-3 rounded-sm bg-emerald-400" />
            <div className="absolute bottom-10 right-16 h-2 w-2 rounded-sm bg-amber-300" />
            <div className="absolute bottom-16 left-8 h-2 w-2 rounded-sm bg-red-400" />
            <div className="absolute inset-x-8 bottom-8 h-px bg-gradient-to-r from-transparent via-sky-300/60 to-transparent" />
          </div>

          <div className="grid gap-3">
            {[
              {
                label: "Monthly run rate",
                value: loaded ? formatCurrency(totalSpend) : "Awaiting data",
                bar: loaded ? "w-4/5 bg-slate-300" : "w-2/5 bg-slate-500",
              },
              {
                label: "Savings potential",
                value: loaded ? formatCurrency(totalSavings) : "Not scored",
                bar: loaded ? "w-3/5 bg-emerald-400" : "w-1/3 bg-slate-500",
              },
              {
                label: "Executive artifact",
                value: loaded ? "Generated" : "Queued",
                bar: loaded ? "w-5/6 bg-red-400" : "w-1/2 bg-slate-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200 bg-slate-50/90 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className="text-sm font-semibold text-slate-950">
                    {item.value}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full rounded-full ${item.bar}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CustomerSelector({
  customers,
  selectedCustomer,
  selectedCustomerId,
  totalMonthlySpend,
  estimatedMonthlySavings,
  findingsCount,
  onSelectCustomer,
}: CustomerSelectorProps) {
  return (
    <div className="grid gap-5">
      <CloudSignalVisual
        customerName={selectedCustomer?.name ?? "No customer loaded"}
        totalSpend={totalMonthlySpend}
        totalSavings={estimatedMonthlySavings}
        findings={findingsCount}
      />

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Demo customer selector
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              {selectedCustomer?.name ?? "Choose a customer"}
            </h2>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            {selectedCustomer
              ? `${selectedCustomer.resources.length} resources`
              : "Standby"}
          </span>
        </div>
        <div className="mt-5 grid gap-3">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() => onSelectCustomer(customer.id)}
              className={`rounded-lg border p-4 text-left transition ${
                selectedCustomerId === customer.id
                  ? "border-red-300 bg-red-50 text-slate-950 shadow-sm"
                  : "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p
                    className={`mt-1 text-sm ${
                      selectedCustomerId === customer.id
                        ? "text-slate-600"
                        : "text-slate-500"
                    }`}
                  >
                    {customer.industry}
                  </p>
                </div>
                <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-600">
                  {formatCurrency(
                    customer.resources.reduce(
                      (sum, resource) => sum + resource.monthlyCost,
                      0,
                    ),
                  )}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
