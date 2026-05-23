"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, Minus, TrendingDown } from "lucide-react";

interface Props {
  score: number;
  semantic: number;
  keyword: number;
}

export default function ScoreCircle({ score, semantic, keyword }: Props) {
  const pathRef  = useRef<SVGCircleElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  const radius       = 72;
  const circumference = 2 * Math.PI * radius;

  const color =
    score >= 75 ? "#00e5a0" :
    score >= 50 ? "#ffb830" :
    "#ff5f6d";

  const tier =
    score >= 75
      ? { label: "Strong Match",  icon: <TrendingUp  size={13} />, bg: "rgba(0,229,160,0.1)",   border: "rgba(0,229,160,0.25)"   }
    : score >= 50
      ? { label: "Partial Match", icon: <Minus       size={13} />, bg: "rgba(255,184,48,0.1)",  border: "rgba(255,184,48,0.25)"  }
      : { label: "Weak Match",    icon: <TrendingDown size={13} />, bg: "rgba(255,95,109,0.1)",  border: "rgba(255,95,109,0.25)"  };

  useEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const target = circumference - (score / 100) * circumference;
    el.style.transition = "none";
    el.style.strokeDashoffset = String(circumference);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = "stroke-dashoffset 1.2s cubic-bezier(.22,1,.36,1)";
      el.style.strokeDashoffset = String(target);
    }));

    const span = labelRef.current;
    if (!span) return;
    let current = 0;
    const step = score / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, score);
      span.textContent = current.toFixed(current < score ? 0 : 1) + "%";
      if (current >= score) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [score, circumference]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>

      {/* Arc */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <div style={{
          position: "absolute", inset: "10px", borderRadius: "50%",
          border: `1px solid ${color}`, opacity: 0.18,
          animation: "pulse-ring 2.5s cubic-bezier(.22,1,.36,1) infinite",
        }} />
        <svg width="200" height="200" viewBox="0 0 200 200">
          {/* Gradient def */}
          <defs>
            <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor={color} />
              <stop offset="100%" stopColor={color === "#00e5a0" ? "#4d9fff" : color === "#ffb830" ? "#f472b6" : "#a78bfa"} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
          {/* Arc */}
          <circle
            ref={pathRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={`url(#arcGrad)`}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            transform="rotate(-90 100 100)"
            style={{ filter: `drop-shadow(0 0 10px ${color}88)` }}
          />
        </svg>

        {/* Centre */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <span ref={labelRef} style={{
            fontFamily: "'Syne', sans-serif", fontSize: 34,
            fontWeight: 800, color, lineHeight: 1,
            textShadow: `0 0 20px ${color}55`,
          }}>
            0%
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 5, letterSpacing: "0.1em" }}>
            MATCH SCORE
          </span>
        </div>
      </div>

      {/* Tier badge */}
      <div style={{
        display: "inline-flex", alignItems: "center", gap: 6,
        padding: "6px 16px", borderRadius: 99,
        background: tier.bg, border: `1px solid ${tier.border}`,
        color, fontSize: 13, fontWeight: 600, letterSpacing: "0.03em",
      }}>
        {tier.icon}
        {tier.label}
      </div>

      {/* Sub-scores */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
        <SubScore label="Semantic Match" value={semantic} color="#4d9fff"  gradient="linear-gradient(90deg,#4d9fff,#a78bfa)" />
        <SubScore label="Keyword Match"  value={keyword}  color="#ffb830"  gradient="linear-gradient(90deg,#ffb830,#f472b6)" />
      </div>
    </div>
  );
}

function SubScore({ label, value, color, gradient }: {
  label: string; value: number; color: string; gradient: string;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "var(--text-2)" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value.toFixed(1)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 99, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${value}%`,
          background: gradient, borderRadius: 99,
          transformOrigin: "left",
          animation: "slide-right 1s cubic-bezier(.22,1,.36,1) both",
          animationDelay: "0.3s",
          boxShadow: `0 0 8px ${color}66`,
        }} />
      </div>
    </div>
  );
}
