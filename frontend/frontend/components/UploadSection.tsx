"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X, Loader2, Sparkles } from "lucide-react";
import API from "@/lib/api";

interface Props {
  onResults: (data: AnalysisResult) => void;
  onLoading: (v: boolean) => void;
}

export interface AnalysisResult {
  match_score: number;
  semantic_score: number;
  keyword_score: number;
  strengths: string[];
  missing_skills: string[];
  suggestions: string[];
  matched_skills: number;
  total_jd_skills: number;
}

export default function UploadSection({ onResults, onLoading }: Props) {
  const [file, setFile]         = useState<File | null>(null);
  const [jd, setJd]             = useState("");
  const [loading, setLoading]   = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const fileInputRef            = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped?.type === "application/pdf") { setFile(dropped); setError(null); }
    else setError("Please drop a PDF file.");
  }, []);

  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const handleSubmit = async () => {
    if (!file)                    return setError("Please upload your resume (PDF).");
    if (jd.trim().length < 30)   return setError("Please paste the full job description.");

    setError(null);
    setLoading(true);
    onLoading(true);

    const form = new FormData();
    form.append("resume", file);
    form.append("job_description", jd);

    try {
      const { data } = await API.post<AnalysisResult>("/analyze", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onResults(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail ?? "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
      onLoading(false);
    }
  };

  return (
    <div className="anim-fade-up" style={{ animationDelay: "0.1s" }}>
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}>

        {/* PDF Drop Zone */}
        <div>
          <Label>Resume · PDF</Label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            style={{
              marginTop: 8,
              border: `2px dashed ${dragging || file ? "var(--accent)" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 14,
              padding: "1.5rem",
              cursor: "pointer",
              transition: "all 0.2s",
              background: dragging || file ? "var(--accent-dim)" : "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              style={{ display: "none" }}
              onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
            />
            {file ? (
              <>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: "var(--accent-glow)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileText size={18} color="var(--accent)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, color: "var(--text)", fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {file.name}
                  </p>
                  <p style={{ color: "var(--text-2)", fontSize: 12, marginTop: 2 }}>
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}
                  style={{
                    background: "rgba(255,255,255,0.06)", border: "none", borderRadius: 8,
                    width: 30, height: 30, cursor: "pointer", display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}
                >
                  <X size={14} color="var(--text-2)" />
                </button>
              </>
            ) : (
              <div style={{ flex: 1, textAlign: "center" }}>
                <Upload size={22} color="var(--text-3)" style={{ margin: "0 auto 8px" }} />
                <p style={{ color: "var(--text-2)", fontSize: 14 }}>
                  <span style={{ color: "var(--accent)", fontWeight: 500 }}>Click to upload</span>
                  {" "}or drag and drop
                </p>
                <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 4 }}>PDF · max 5 MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <Label>Job Description</Label>
          <textarea
            value={jd}
            onChange={(e) => { setJd(e.target.value); setError(null); }}
            placeholder="Paste the full job description here — requirements, responsibilities, qualifications…"
            rows={7}
            style={{
              marginTop: 8,
              width: "100%",
              background: "var(--surface-2)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 14,
              padding: "14px 16px",
              color: "var(--text)",
              fontSize: 14,
              lineHeight: 1.65,
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
              fontFamily: "inherit",
            }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(0,229,160,0.4)")}
            onBlur={(e)  => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)")}
          />
          <p style={{ color: "var(--text-3)", fontSize: 12, marginTop: 6 }}>
            {jd.length.toLocaleString()} characters
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "var(--red-dim)",
            border: "1px solid rgba(255,95,109,0.25)",
            borderRadius: 10,
            padding: "10px 14px",
            color: "var(--red)",
            fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Submit — explicit white bg so it's always visible */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 14,
            border: "none",
            background: loading
              ? "rgba(0,229,160,0.25)"
              : "linear-gradient(135deg, #00e5a0 0%, #00bfff 100%)",
            color: loading ? "rgba(255,255,255,0.5)" : "#040d08",
            fontFamily: "'Syne', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: "0.03em",
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "opacity 0.2s, transform 0.15s",
            boxShadow: loading ? "none" : "0 0 24px rgba(0,229,160,0.3)",
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {loading ? (
            <>
              <Loader2 size={16} style={{ animation: "spin-slow 1s linear infinite" }} />
              Analyzing…
            </>
          ) : (
            <>
              <Sparkles size={15} />
              Analyze My Resume
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ color: "var(--text-2)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
      {children}
    </p>
  );
}
