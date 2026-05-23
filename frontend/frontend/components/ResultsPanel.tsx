"use client";

import { useState, useEffect, useRef } from "react";
import { CheckCircle2, XCircle, Lightbulb, ChevronRight, BarChart2, Copy, Check } from "lucide-react";
import type { AnalysisResult } from "./UploadSection";

interface Props { results: AnalysisResult; }

type Tab = "overview" | "strengths" | "gaps" | "suggestions";

const TABS: { id: Tab; label: string; icon: React.ReactNode; color: string }[] = [
  { id: "overview",    label: "Overview",    icon: <BarChart2    size={13} />, color: "var(--violet)" },
  { id: "strengths",   label: "Strengths",   icon: <CheckCircle2 size={13} />, color: "var(--accent)" },
  { id: "gaps",        label: "Skill Gaps",  icon: <XCircle      size={13} />, color: "var(--red)"    },
  { id: "suggestions", label: "Suggestions", icon: <Lightbulb    size={13} />, color: "var(--amber)"  },
];

export default function ResultsPanel({ results }: Props) {
  const [active, setActive] = useState<Tab>("overview");

  const counts: Record<Tab, number> = {
    overview:    0,
    strengths:   results.strengths.length,
    gaps:        results.missing_skills.length,
    suggestions: results.suggestions.length,
  };

  return (
    <div className="anim-fade-up" style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 20, overflow: "hidden", animationDelay: "0.2s",
    }}>
      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 1rem" }}>
        {TABS.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button key={tab.id} onClick={() => setActive(tab.id)} style={{
              flex: 1, padding: "0.9rem 0.25rem", background: "none", border: "none",
              borderBottom: isActive ? `2px solid ${tab.color}` : "2px solid transparent",
              color: isActive ? tab.color : "var(--text-2)", cursor: "pointer",
              fontSize: 12, fontWeight: isActive ? 600 : 400, fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
              transition: "all 0.18s", marginBottom: -1, whiteSpace: "nowrap",
            }}>
              {tab.icon}
              {tab.label}
              {counts[tab.id] > 0 && (
                <span style={{
                  background: isActive ? `${tab.color}22` : "var(--surface-2)",
                  color: isActive ? tab.color : "var(--text-3)",
                  borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700,
                }}>
                  {counts[tab.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={{ padding: "1.5rem" }}>
        {active === "overview"    && <OverviewChart results={results} />}
        {active === "strengths"   && <TagGrid items={results.strengths} color="var(--accent)" bg="var(--accent-dim)" empty="No matching skills detected — try a more detailed resume." />}
        {active === "gaps"        && <>
          <SkillCoverage matched={results.matched_skills} total={results.total_jd_skills} />
          <TagGrid items={results.missing_skills} color="var(--red)" bg="var(--red-dim)" empty="No skill gaps found — great match!" />
        </>}
        {active === "suggestions" && <SuggestionList suggestions={results.suggestions} missing={results.missing_skills} />}
      </div>
    </div>
  );
}

/* ── Overview chart ─────────────────────────────────────────────────────── */
function OverviewChart({ results }: { results: AnalysisResult }) {
  const bars = [
    { label: "Overall",  value: results.match_score,    color: "#00e5a0", glow: "rgba(0,229,160,0.4)"   },
    { label: "Semantic", value: results.semantic_score,  color: "#a78bfa", glow: "rgba(167,139,250,0.4)" },
    { label: "Keyword",  value: results.keyword_score,   color: "#4d9fff", glow: "rgba(77,159,255,0.4)"  },
    {
      label: "Coverage",
      value: results.total_jd_skills > 0 ? Math.round((results.matched_skills / results.total_jd_skills) * 100) : 0,
      color: "#ffb830", glow: "rgba(255,184,48,0.4)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

      {/* Vertical bar chart */}
      <div style={{
        background: "var(--surface-2)", borderRadius: 16,
        padding: "1.5rem", border: "1px solid var(--border)",
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--text-2)", textTransform: "uppercase", marginBottom: "1.25rem" }}>
          Score Breakdown
        </p>
        <div style={{
          display: "flex", alignItems: "flex-end", justifyContent: "space-around",
          height: 160, gap: 12, padding: "0 8px", position: "relative",
        }}>
          {[25, 50, 75, 100].map((v) => (
            <div key={v} style={{
              position: "absolute", left: 0, right: 0, bottom: `${v}%`,
              borderTop: "1px dashed rgba(255,255,255,0.04)",
            }}>
              <span style={{ fontSize: 9, color: "var(--text-3)", position: "absolute", top: -8 }}>{v}</span>
            </div>
          ))}
          {bars.map((bar) => <AnimatedBar key={bar.label} bar={bar} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 10, padding: "0 8px" }}>
          {bars.map((bar) => (
            <span key={bar.label} style={{ fontSize: 11, color: "var(--text-2)", textAlign: "center", flex: 1 }}>
              {bar.label}
            </span>
          ))}
        </div>
      </div>

      {/* 2x2 summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SummaryCard label="Skills Matched"  value={`${results.matched_skills} / ${results.total_jd_skills}`} sub="Required skills found" color="#00e5a0" bg="rgba(0,229,160,0.07)"   border="rgba(0,229,160,0.18)" />
        <SummaryCard label="Skill Gaps"      value={String(results.missing_skills.length)}                    sub="Skills to add"        color="#ff5f6d" bg="rgba(255,95,109,0.07)"  border="rgba(255,95,109,0.18)" />
        <SummaryCard label="Semantic Score"  value={`${results.semantic_score.toFixed(1)}%`}                  sub="Context & meaning"    color="#a78bfa" bg="rgba(167,139,250,0.07)" border="rgba(167,139,250,0.18)" />
        <SummaryCard label="Keyword Score"   value={`${results.keyword_score.toFixed(1)}%`}                   sub="Hard skill overlap"   color="#4d9fff" bg="rgba(77,159,255,0.07)"  border="rgba(77,159,255,0.18)" />
      </div>

      {/* Stacked coverage bar */}
      {results.total_jd_skills > 0 && (
        <div style={{ background: "var(--surface-2)", borderRadius: 14, padding: "1.25rem", border: "1px solid var(--border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", color: "var(--text-2)", textTransform: "uppercase" }}>Skill Coverage</p>
            <span style={{ fontSize: 12, color: "var(--text-2)" }}>{results.matched_skills} matched · {results.missing_skills.length} missing</span>
          </div>
          <div style={{ height: 10, borderRadius: 99, background: "rgba(255,95,109,0.15)", overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${(results.matched_skills / results.total_jd_skills) * 100}%`,
              background: "linear-gradient(90deg, #00e5a0, #4d9fff)",
              borderRadius: 99,
              boxShadow: "0 0 10px rgba(0,229,160,0.4)",
              transition: "width 1.2s cubic-bezier(.22,1,.36,1)",
            }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
            <span style={{ fontSize: 11, color: "#00e5a0", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: "#00e5a0", display: "inline-block" }} /> Matched
            </span>
            <span style={{ fontSize: 11, color: "#ff5f6d", display: "flex", alignItems: "center", gap: 5 }}>
              Missing <span style={{ width: 8, height: 8, borderRadius: 2, background: "#ff5f6d", display: "inline-block" }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function AnimatedBar({ bar }: { bar: { label: string; value: number; color: string; glow: string } }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = "height 1s cubic-bezier(.22,1,.36,1)";
      el.style.height = `${bar.value}%`;
    }));
    return () => cancelAnimationFrame(raf);
  }, [bar.value]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: bar.color }}>{bar.value.toFixed(0)}%</span>
      <div ref={ref} style={{
        width: "100%", maxWidth: 44, height: 0,
        borderRadius: "6px 6px 2px 2px",
        background: `linear-gradient(to top, ${bar.color}, ${bar.color}88)`,
        boxShadow: `0 0 12px ${bar.glow}`,
      }} />
    </div>
  );
}

function SummaryCard({ label, value, sub, color, bg, border }: {
  label: string; value: string; sub: string; color: string; bg: string; border: string;
}) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "14px" }}>
      <p style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 500, marginBottom: 4, letterSpacing: "0.04em" }}>{label}</p>
      <p style={{ fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: "var(--text-3)", marginTop: 4 }}>{sub}</p>
    </div>
  );
}

/* ── Shared ─────────────────────────────────────────────────────────────── */
function TagGrid({ items, color, bg, empty }: { items: string[]; color: string; bg: string; empty: string }) {
  if (items.length === 0)
    return <p style={{ color: "var(--text-2)", fontSize: 14, textAlign: "center", padding: "1.5rem 0" }}>{empty}</p>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {items.map((item, i) => (
        <span key={i} className="anim-fade-up" style={{
          background: bg, color, border: `1px solid ${color}25`,
          padding: "5px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500,
          animationDelay: `${i * 0.04}s`,
        }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillCoverage({ matched, total }: { matched: number; total: number }) {
  if (total === 0) return null;
  const pct = Math.round((matched / total) * 100);
  return (
    <div style={{
      background: pct >= 60 ? "rgba(0,229,160,0.07)" : "rgba(255,184,48,0.07)",
      border: `1px solid ${pct >= 60 ? "rgba(0,229,160,0.2)" : "rgba(255,184,48,0.2)"}`,
      borderRadius: 12, padding: "12px 16px", marginBottom: "1rem",
      display: "flex", alignItems: "center", gap: 12,
    }}>
      <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800, color: pct >= 60 ? "var(--accent)" : "var(--amber)" }}>
        {pct}%
      </span>
      <div>
        <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>Skill Coverage</p>
        <p style={{ fontSize: 12, color: "var(--text-2)" }}>{matched} of {total} required skills found in your resume</p>
      </div>
    </div>
  );
}

function SuggestionList({ suggestions, missing }: { suggestions: string[]; missing: string[] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = suggestions
      .map((s, i) => `${missing[i] ? `[${missing[i].toUpperCase()}] ` : ""}${s}`)
      .join("\n\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (suggestions.length === 0)
    return <p style={{ color: "var(--text-2)", fontSize: 14, textAlign: "center", padding: "1.5rem 0" }}>No suggestions — your resume looks well-aligned!</p>;

  const colors = ["var(--amber)", "var(--violet)", "var(--blue)", "var(--pink)", "var(--accent)"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

      {/* Copy all button */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 4 }}>
        <button
          onClick={handleCopy}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: copied ? "rgba(0,229,160,0.1)" : "var(--surface-2)",
            border: `1px solid ${copied ? "rgba(0,229,160,0.3)" : "var(--border)"}`,
            borderRadius: 8, padding: "5px 12px",
            color: copied ? "var(--accent)" : "var(--text-2)",
            fontSize: 12, fontWeight: 500, cursor: "pointer",
            transition: "all 0.2s", fontFamily: "inherit",
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy all"}
        </button>
      </div>

      {suggestions.map((s, i) => {
        const c = colors[i % colors.length];
        return (
          <div key={i} className="anim-fade-up" style={{
            background: "var(--surface-2)",
            border: `1px solid ${c}18`,
            borderLeft: `3px solid ${c}`,
            borderRadius: 12, padding: "12px 14px",
            display: "flex", gap: 12, alignItems: "flex-start",
            animationDelay: `${i * 0.05}s`,
          }}>
            <ChevronRight size={15} color={c} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              {missing[i] && (
                <span style={{
                  display: "inline-block", background: `${c}18`, color: c,
                  borderRadius: 6, padding: "1px 8px", fontSize: 10, fontWeight: 700,
                  marginBottom: 5, letterSpacing: "0.06em", textTransform: "uppercase",
                }}>
                  {missing[i]}
                </span>
              )}
              <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.65 }}>{s}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
