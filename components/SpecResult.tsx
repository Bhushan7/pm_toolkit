"use client";

import { useState } from "react";

interface UserStory {
  title: string;
  story: string;
  acceptanceCriteria: string[];
}

interface SpecData {
  problemStatement: string;
  userStories: UserStory[];
  edgeCases: string[];
  outOfScope: string[];
  openQuestions: string[];
}

interface SpecResultProps {
  data: SpecData;
  onReset: () => void;
}

function Section({
  title,
  children,
  onCopy,
  copyText,
}: {
  title: string;
  children: React.ReactNode;
  onCopy: () => void;
  copyText: string;
}) {
  const [open, setOpen] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 rounded-xl ring-1 ring-white/10 overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-colors"
      >
        <span className="font-semibold text-white">{title}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-xs px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <span className="text-slate-400 text-sm">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white/5 rounded-xl ring-1 ring-white/10 p-5">
          <div className="h-5 bg-white/10 rounded w-1/3 mb-4" />
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded w-full" />
            <div className="h-3 bg-white/10 rounded w-5/6" />
            <div className="h-3 bg-white/10 rounded w-4/6" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SpecSkeleton() {
  return <LoadingSkeleton />;
}

export default function SpecResult({ data, onReset }: SpecResultProps) {
  const generateMarkdown = (): string => {
    const lines: string[] = ["# Product Spec\n"];

    lines.push("## Problem Statement\n");
    lines.push(data.problemStatement + "\n");

    lines.push("## User Stories\n");
    for (const s of data.userStories) {
      lines.push(`### ${s.title}\n`);
      lines.push(s.story + "\n");
      lines.push("**Acceptance Criteria:**\n");
      for (const ac of s.acceptanceCriteria) {
        lines.push(`- ${ac}`);
      }
      lines.push("");
    }

    lines.push("## Edge Cases\n");
    for (const e of data.edgeCases) lines.push(`- ${e}`);
    lines.push("");

    lines.push("## Out of Scope\n");
    for (const o of data.outOfScope) lines.push(`- ${o}`);
    lines.push("");

    lines.push("## Open Questions\n");
    for (const q of data.openQuestions) lines.push(`- ${q}`);

    return lines.join("\n");
  };

  const exportMarkdown = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "spec.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  const storiesText = data.userStories
    .map(
      (s) =>
        `${s.title}\n${s.story}\n\nAcceptance Criteria:\n${s.acceptanceCriteria.map((c) => `- ${c}`).join("\n")}`
    )
    .join("\n\n---\n\n");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Your Spec</h2>
        <div className="flex gap-2">
          <button
            onClick={exportMarkdown}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Export as Markdown
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Start over
          </button>
        </div>
      </div>

      <Section
        title="Problem Statement"
        onCopy={() => {}}
        copyText={data.problemStatement}
      >
        <p className="text-slate-300 leading-relaxed">{data.problemStatement}</p>
      </Section>

      <Section title="User Stories" onCopy={() => {}} copyText={storiesText}>
        <div className="space-y-5">
          {data.userStories.map((story, i) => (
            <div key={i} className="space-y-2">
              <p className="font-semibold text-blue-400">{story.title}</p>
              <p className="text-slate-300 italic">{story.story}</p>
              <ul className="space-y-1 mt-2">
                {story.acceptanceCriteria.map((ac, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>{ac}</span>
                  </li>
                ))}
              </ul>
              {i < data.userStories.length - 1 && (
                <hr className="border-white/10 mt-4" />
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Edge Cases"
        onCopy={() => {}}
        copyText={data.edgeCases.map((e) => `- ${e}`).join("\n")}
      >
        <ul className="space-y-2">
          {data.edgeCases.map((e, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-yellow-400 mt-0.5">⚠</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Out of Scope"
        onCopy={() => {}}
        copyText={data.outOfScope.map((o) => `- ${o}`).join("\n")}
      >
        <ul className="space-y-2">
          {data.outOfScope.map((o, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-red-400 mt-0.5">✕</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        title="Open Questions"
        onCopy={() => {}}
        copyText={data.openQuestions.map((q) => `- ${q}`).join("\n")}
      >
        <ul className="space-y-2">
          {data.openQuestions.map((q, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="text-purple-400 mt-0.5">?</span>
              <span>{q}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
}
