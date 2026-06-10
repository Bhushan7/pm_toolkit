"use client";

import { useState } from "react";
import SpecResult, { SpecSkeleton } from "@/components/SpecResult";
import PricingCard from "@/components/PricingCard";

interface SpecData {
  problemStatement: string;
  userStories: Array<{
    title: string;
    story: string;
    acceptanceCriteria: string[];
  }>;
  edgeCases: string[];
  outOfScope: string[];
  openQuestions: string[];
}

const OUTPUT_TYPES = [
  { icon: "🎯", title: "Problem Statement", desc: "Crisp articulation of the core problem and who it affects." },
  { icon: "👤", title: "User Stories", desc: "As a / I want / So that format — ready to paste into Jira." },
  { icon: "✅", title: "Acceptance Criteria", desc: "Given/When/Then scenarios your QA team can test against." },
  { icon: "⚠️", title: "Edge Cases", desc: "The scenarios that break things — caught before you ship." },
  { icon: "🚫", title: "Out of Scope", desc: "Explicit boundaries that prevent scope creep mid-sprint." },
  { icon: "❓", title: "Open Questions", desc: "Unresolved decisions flagged for the team to align on." },
];

const PRICING = [
  {
    tier: "Free",
    price: "$0",
    features: ["5 specs/month", "All 6 output sections", "Copy to clipboard", "No exports"],
  },
  {
    tier: "Pro",
    price: "$12",
    features: ["Unlimited specs", "All exports (MD, Jira, Notion)", "Spec history", "Priority generation"],
    highlighted: true,
    badge: "Most popular",
  },
  {
    tier: "Team",
    price: "$49",
    features: ["5 seats", "Shared workspace", "Team templates", "Everything in Pro"],
  },
  {
    tier: "Business",
    price: "$99",
    features: ["15 seats", "Jira / Confluence API", "Custom templates", "SSO + admin controls"],
  },
];

export default function Home() {
  const [brief, setBrief] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState({
    productType: "",
    audience: "",
    platform: "",
    constraints: "",
  });
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<SpecData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brief.trim()) return;
    setLoading(true);
    setSpec(null);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, context }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        return;
      }

      setSpec(data);
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSpec(null);
    setError(null);
    setBrief("");
    setContext({ productType: "", audience: "", platform: "", constraints: "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-[#0F172A] text-white">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-bold text-lg tracking-tight">
            PM <span className="text-blue-400">Toolkit</span>
          </span>
          <a
            href="#pricing"
            className="text-sm text-slate-400 hover:text-white transition-colors"
          >
            Pricing
          </a>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-12 text-center">
        <div className="inline-block bg-blue-600/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6 ring-1 ring-blue-500/30">
          AI-powered spec generator for PMs
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight tracking-tight mb-4">
          Turn a vague idea into a{" "}
          <span className="text-blue-400">full spec</span> in 60 seconds
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          PM Toolkit generates user stories, acceptance criteria, and edge cases
          from a rough brief — so you can stop writing boilerplate and start
          shipping.
        </p>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/5 ring-1 ring-white/10 rounded-2xl p-6 text-left space-y-4"
        >
          <textarea
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="Paste your rough idea here... (e.g. 'We need a way for users to invite teammates to their workspace via email or link')"
            rows={4}
            className="w-full bg-white/5 rounded-xl ring-1 ring-white/10 p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            required
            minLength={10}
          />

          <button
            type="button"
            onClick={() => setShowContext((v) => !v)}
            className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <span>{showContext ? "▼" : "▶"}</span>
            {showContext ? "Hide" : "Add"} optional context
          </button>

          {showContext && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { key: "productType", label: "Product type", placeholder: "e.g. SaaS, mobile app, API" },
                { key: "audience", label: "Target audience", placeholder: "e.g. enterprise developers" },
                { key: "platform", label: "Platform", placeholder: "e.g. web, iOS, API" },
                { key: "constraints", label: "Tech constraints", placeholder: "e.g. must use existing auth" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs text-slate-400 mb-1">{label}</label>
                  <input
                    type="text"
                    value={context[key as keyof typeof context]}
                    onChange={(e) =>
                      setContext((c) => ({ ...c, [key]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="w-full bg-white/5 rounded-lg ring-1 ring-white/10 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              type="submit"
              disabled={loading || !brief.trim()}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-colors text-sm"
            >
              {loading ? "Generating..." : "Generate Spec →"}
            </button>
            <p className="text-xs text-slate-500">
              Free · No signup required · 5 specs/month
            </p>
          </div>
        </form>
      </section>

      {/* Results */}
      {(loading || spec) && (
        <section id="results" className="max-w-3xl mx-auto px-6 pb-20">
          {loading ? <SpecSkeleton /> : spec && <SpecResult data={spec} onReset={handleReset} />}
        </section>
      )}

      {/* How it works */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-white/10">
        <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            { step: "1", title: "Paste your rough brief", desc: "One paragraph is enough. No need for structured input." },
            { step: "2", title: "AI generates your spec", desc: "Claude produces a complete, structured spec in seconds." },
            { step: "3", title: "Export anywhere", desc: "Download as Markdown or export to Jira, Confluence, or Notion." },
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex flex-col items-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-lg">
                {step}
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* What you get */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-white/10">
        <h2 className="text-2xl font-bold text-center mb-4">What you get</h2>
        <p className="text-center text-slate-400 mb-12 text-sm">
          Every spec includes all six sections — nothing to configure.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {OUTPUT_TYPES.map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-white/5 rounded-xl ring-1 ring-white/10 p-5 space-y-2"
            >
              <div className="text-2xl">{icon}</div>
              <h3 className="font-semibold text-white">{title}</h3>
              <p className="text-sm text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Social proof */}
      <section className="border-y border-white/10 py-6 px-6">
        <p className="text-center text-sm text-slate-400">
          Built by a 9-year Senior PM · Trusted by IC PMs at startups and scale-ups
        </p>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-4">Simple pricing</h2>
        <p className="text-center text-slate-400 mb-16 text-sm">
          Start free. Upgrade when you need more.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {PRICING.map((plan) => (
            <PricingCard key={plan.tier} {...plan} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 px-6 text-center text-sm text-slate-500">
        PM Toolkit · Made for PMs, by a PM
      </footer>
    </main>
  );
}
