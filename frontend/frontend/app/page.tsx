"use client";

import { useState } from "react";
import { Zap, GitBranch, Brain, Target, TrendingUp, Clock, Trash2 } from "lucide-react";
import UploadSection, { type AnalysisResult } from "@/components/UploadSection";
import ScoreCircle from "@/components/ScoreCircle";
import ResultsPanel from "@/components/ResultsPanel";

interface HistoryEntry {
  id: number;
  score: number;
  semantic: number;
  keyword: number;
  strengths: number;
  gaps: number;
  timestamp: string;
  results: AnalysisResult;
}

export default function Home() {
  const [results, setResults]   = useState<AnalysisResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const handleResults = (data: AnalysisResult) => {
    setResults(data);
    const entry: HistoryEntry = {
      id:        Date.now(),
      score:     data.match_score,
      semantic:  data.semantic_score,
      keyword:   data.keyword_score,
      strengths: data.strengths.length,
      gaps:      data.missing_skills.length,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      results:   data,
    };
    setHistory((prev) => [entry, ...prev].slice(0, 5)); // keep last 5
  };

  return (
    <main style={{ minHeight: "100vh", position: "relative", zIndex: 1, padding: "0 1rem" }}>

      {/* Nav */}
      <nav style={{
        maxWidth: 1100, margin: "0 auto", padding: "1.5rem 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "0.75rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: "linear-gradient(135deg, rgba(0,229,160,0.2), rgba(167,139,250,0.2))",
            border: "1px solid rgba(0,229,160,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color="var(--accent)" />
          </div>
          <span style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 18, color: "var(--text)", letterSpacing: "-0.02em",
          }}>
            Resume<span style={{ color: "var(--accent)" }}>IQ</span>
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* History toggle — only show if there's history */}
          {history.length > 0 && (
            <button
              onClick={() => setShowHistory((v) => !v)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: showHistory ? "rgba(167,139,250,0.12)" : "transparent",
                border: `1px solid ${showHistory ? "rgba(167,139,250,0.3)" : "var(--border)"}`,
                color: showHistory ? "var(--violet)" : "var(--text-2)",
                fontSize: 13, padding: "6px 14px", borderRadius: 99,
                cursor: "pointer", transition: "all 0.18s", fontFamily: "inherit",
              }}
            >
              <Clock size={13} />
              History
              <span style={{
                background: "rgba(167,139,250,0.2)", color: "var(--violet)",
                borderRadius: 99, padding: "1px 6px", fontSize: 10, fontWeight: 700,
              }}>
                {history.length}
              </span>
            </button>
          )}

          <a href="https://github.com" target="_blank" rel="noreferrer"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              color: "var(--text-2)", fontSize: 13, textDecoration: "none",
              padding: "6px 14px", border: "1px solid var(--border)",
              borderRadius: 99, transition: "all 0.18s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.color = "var(--text)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
          >
            <GitBranch size={14} /> View on GitHub
          </a>
        </div>
      </nav>

      {/* History panel */}
      {showHistory && history.length > 0 && (
        <div className="anim-fade-up" style={{ maxWidth: 1100, margin: "0 auto 1.5rem" }}>
          <div style={{
            background: "var(--surface)", border: "1px solid rgba(167,139,250,0.2)",
            borderRadius: 16, padding: "1.25rem",
          }}>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", color: "var(--violet)", textTransform: "uppercase", marginBottom: "1rem" }}>
              Recent Analyses
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((entry, idx) => {
                const color = entry.score >= 75 ? "#00e5a0" : entry.score >= 50 ? "#ffb830" : "#ff5f6d";
                const isCurrent = idx === 0 && results !== null;
                return (
                  <div key={entry.id} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: isCurrent ? "rgba(167,139,250,0.06)" : "var(--surface-2)",
                    border: `1px solid ${isCurrent ? "rgba(167,139,250,0.2)" : "var(--border)"}`,
                    borderRadius: 12, padding: "10px 14px",
                    cursor: "pointer", transition: "all 0.18s",
                  }}
                  onClick={() => { setResults(entry.results); setShowHistory(false); }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.3)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = isCurrent ? "rgba(167,139,250,0.2)" : "var(--border)"; }}
                  >
                    {/* Score pill */}
                    <div style={{
                      minWidth: 52, textAlign: "center",
                      fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800,
                      color, textShadow: `0 0 12px ${color}44`,
                    }}>
                      {entry.score.toFixed(0)}%
                    </div>

                    {/* Mini bar */}
                    <div style={{ flex: 1, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                      <div style={{
                        height: "100%", width: `${entry.score}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}88)`,
                        borderRadius: 99,
                      }} />
                    </div>

                    {/* Meta */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#00e5a0" }}>{entry.strengths} strengths</span>
                      <span style={{ fontSize: 11, color: "#ff5f6d" }}>{entry.gaps} gaps</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)" }}>{entry.timestamp}</span>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setHistory((prev) => prev.filter((h) => h.id !== entry.id));
                      }}
                      style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "var(--text-3)", padding: 4, borderRadius: 6,
                        display: "flex", alignItems: "center", transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ff5f6d"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "var(--text-3)"; }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Hero — hidden once results are showing */}
      {!results && !loading && (
        <section className="anim-fade-up" style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 0 2rem", textAlign: "center" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg, rgba(0,229,160,0.12), rgba(167,139,250,0.12))",
            border: "1px solid rgba(0,229,160,0.2)",
            borderRadius: 99, padding: "5px 16px", marginBottom: "1.5rem",
          }}>
            <Brain size={12} color="var(--accent)" />
            <span style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: "0.07em" }}>
              AI-POWERED · INSTANT ANALYSIS
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            lineHeight: 1.1, letterSpacing: "-0.03em",
            color: "var(--text)", marginBottom: "1.25rem",
          }}>
            Know exactly how well
            <br />
            <span style={{
              background: "linear-gradient(135deg, #00e5a0 0%, #a78bfa 50%, #4d9fff 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              your resume matches
            </span>
          </h1>

          <p style={{
            color: "var(--text-2)", fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            maxWidth: 560, margin: "0 auto 2rem", lineHeight: 1.7,
          }}>
            Upload your resume, paste a job description, and get an AI-powered
            match score with skill gap analysis and tailored suggestions — in seconds.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "3rem", flexWrap: "wrap" }}>
            {[
              { icon: <Target size={13} />,     label: "80+ Skills Tracked",      color: "var(--accent)" },
              { icon: <Brain size={13} />,       label: "Semantic AI Matching",    color: "var(--violet)" },
              { icon: <TrendingUp size={13} />,  label: "Actionable Suggestions",  color: "var(--blue)"   },
            ].map(({ icon, label, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--text-2)", fontSize: 13 }}>
                <span style={{ color }}>{icon}</span>
                {label}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: "5rem" }}>
        {!results && !loading ? (
          <div style={{ maxWidth: 620, margin: "0 auto" }}>
            <UploadSection onResults={handleResults} onLoading={setLoading} />
          </div>
        ) : loading ? (
          <LoadingSkeleton />
        ) : results ? (
          /* ── Responsive grid: single col on mobile, two col on desktop ── */
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
            gap: "1.5rem",
            alignItems: "start",
          }}>
            {/* Score col — naturally 1 unit */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="anim-fade-up" style={{
                background: "var(--surface)",
                border: "1px solid rgba(0,229,160,0.15)",
                borderRadius: 20, padding: "2rem",
                boxShadow: "0 0 40px rgba(0,229,160,0.04)",
              }}>
                <ScoreCircle
                  score={results.match_score}
                  semantic={results.semantic_score}
                  keyword={results.keyword_score}
                />
              </div>

              <button
                onClick={() => setResults(null)}
                style={{
                  width: "100%", padding: "12px", borderRadius: 14,
                  border: "1px solid var(--border)", background: "var(--surface)",
                  color: "var(--text-2)", fontFamily: "inherit", fontSize: 13,
                  cursor: "pointer", transition: "all 0.18s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(0,229,160,0.3)"; e.currentTarget.style.color = "var(--accent)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-2)"; }}
              >
                ← Analyze Another Resume
              </button>
            </div>

            {/* Results col — gets more space on wide screens via the auto-fit */}
            <div style={{ minWidth: 0 }}>
              <ResultsPanel results={results} />
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
      gap: "1.5rem", alignItems: "start",
    }}>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, padding: "2rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
        <div className="skeleton" style={{ width: 200, height: 200, borderRadius: "50%" }} />
        <div className="skeleton" style={{ width: 120, height: 28 }} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="skeleton" style={{ height: 36 }} />
          <div className="skeleton" style={{ height: 36 }} />
        </div>
      </div>
      <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", padding: "0 1rem", gap: 8 }}>
          {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ flex: 1, height: 44, margin: "0.7rem 0", borderRadius: 8 }} />)}
        </div>
        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="skeleton" style={{ height: 160, borderRadius: 14 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[1,2,3,4].map((i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
