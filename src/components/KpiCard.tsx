type KpiCardProps = {
  label: string;
  value: string;
  detail: string;
  tone: "slate" | "green" | "red" | "blue" | "amber";
  featured?: boolean;
};

export function KpiCard({
  label,
  value,
  detail,
  tone,
  featured = false,
}: KpiCardProps) {
  const toneClasses = {
    slate: {
      card: "border-slate-200 bg-white",
      accent: "bg-slate-900",
      value: "text-slate-950",
    },
    green: {
      card: featured
        ? "border-emerald-300 bg-emerald-50"
        : "border-emerald-200 bg-emerald-50",
      accent: "bg-emerald-500",
      value: "text-emerald-900",
    },
    red: {
      card: "border-red-200 bg-red-50",
      accent: "bg-red-600",
      value: "text-red-950",
    },
    blue: {
      card: "border-sky-200 bg-sky-50",
      accent: "bg-sky-600",
      value: "text-sky-950",
    },
    amber: {
      card: "border-amber-200 bg-amber-50",
      accent: "bg-amber-500",
      value: "text-amber-950",
    },
  };
  const classes = toneClasses[tone];

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-5 shadow-sm ${
        featured ? "md:col-span-2 xl:col-span-2" : ""
      } ${classes.card}`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-1 ${classes.accent}`}
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p
        className={`mt-3 font-semibold leading-none ${
          featured ? "text-5xl" : "text-3xl"
        } ${classes.value}`}
      >
        {value}
      </p>
      <p className="mt-3 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  );
}
