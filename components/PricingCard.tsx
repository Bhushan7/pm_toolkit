"use client";

interface PricingCardProps {
  tier: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

export default function PricingCard({
  tier,
  price,
  period = "/mo",
  features,
  highlighted = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-2xl p-6 flex flex-col gap-4 ${
        highlighted
          ? "bg-blue-600 text-white ring-2 ring-blue-400 shadow-2xl scale-105"
          : "bg-white/5 text-slate-200 ring-1 ring-white/10"
      }`}
    >
      {badge && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">
          {badge}
        </span>
      )}
      <div>
        <p className={`text-sm font-semibold uppercase tracking-wider ${highlighted ? "text-blue-100" : "text-slate-400"}`}>
          {tier}
        </p>
        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-4xl font-bold">{price}</span>
          {price !== "$0" && (
            <span className={`text-sm ${highlighted ? "text-blue-200" : "text-slate-400"}`}>{period}</span>
          )}
        </div>
      </div>
      <ul className="flex flex-col gap-2 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <span className={`mt-0.5 text-lg leading-none ${highlighted ? "text-blue-200" : "text-blue-400"}`}>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        className={`mt-2 w-full py-2.5 rounded-lg font-semibold text-sm transition-colors ${
          highlighted
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "bg-white/10 text-white hover:bg-white/20"
        }`}
      >
        {price === "$0" ? "Get started free" : "Start free trial"}
      </button>
    </div>
  );
}
