# ResumeIQ — AI-Powered resume Match Analyser

> Upload your resume. Paste a job description. Know exactly where you stand.

![ResumeIQ Screenshot](docs/screenshot.png)

---

## Problem Statement

Job seekers often apply to roles without knowing how well their resume actually aligns with the job description. This leads to missed opportunities, generic applications, and wasted time. ResumeIQ solves this by giving candidates an instant, objective, AI-powered match score — along with the specific skills they're missing and actionable steps to fix the gap.

---

## Approach & Architecture

ResumeIQ uses a **two-signal scoring model**:

```
Final Score = 60% × Semantic Similarity + 40% × Keyword Overlap
```

**Semantic similarity** uses `sentence-transformers` (`all-MiniLM-L6-v2`) to encode both documents into vector embeddings and compute cosine similarity. This captures meaning and context — a resume that says "built distributed pipelines" still gets credit for "Apache Kafka experience."

**Keyword overlap** uses a curated skills database of 80+ skills with alias expansion (e.g. "reactjs" → "react", "k8s" → "kubernetes") and word-boundary regex matching to avoid false positives. It computes the Jaccard overlap between skills found in the resume versus the JD.

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  Next.js 16  ·  React 19  ·  Tailwind CSS 4                 │
│                                                             │
│  UploadSection ──→ /analyze (POST)  ──→ ResultsPanel        │
│  (drag-and-drop PDF + JD textarea)      (tabs: strengths /  │
│                                          gaps / suggestions) │
└────────────────────────┬────────────────────────────────────┘
                         │ multipart/form-data
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                           │
│                                                             │
│  main.py                                                    │
│   ├─ Input validation (file type, size, JD length)          │
│   ├─ UUID-based temp file storage                           │
│   └─ Cleanup after extraction                               │
│                                                             │
│  parser.py  ──  PyMuPDF (fitz) text extraction + cleanup    │
│                                                             │
│  scorer.py  ──  SentenceTransformer + cosine similarity     │
│                 Weighted score formula                       │
│                 Dynamic suggestions per missing skill        │
│                                                             │
│  skills.py  ──  80+ skills, aliases, word-boundary regex    │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

- **Match Score (0–100%)** — weighted blend of semantic and keyword signals
- **Semantic Score** — captures context and meaning beyond exact keywords
- **Keyword Score** — hard skill coverage against JD requirements
- **Strengths tab** — skills present in both resume and JD
- **Skill Gaps tab** — skills the JD requires that are missing from the resume, with coverage %
- **Suggestions tab** — one actionable improvement tip per missing skill
- **Drag-and-drop PDF upload** with file size validation
- **Loading skeleton** UI while analysing
- **Animated score arc** with colour thresholds (green / amber / red)

---

## Tech Stack

| Layer        | Technology                          | Why                                                      |
|-------------|--------------------------------------|----------------------------------------------------------|
| AI / NLP    | `sentence-transformers` (MiniLM-L6)  | Fast, offline, no API cost, strong semantic understanding|
| PDF Parsing | PyMuPDF (`fitz`)                     | Fast, robust, handles complex resume layouts             |
| Backend     | FastAPI                              | Async, auto-docs, great DX, production-ready             |
| Frontend    | Next.js 16 + React 19                | App Router, TypeScript, great performance                |
| Styling     | Tailwind CSS v4 + CSS variables      | Design tokens, no runtime overhead                       |
| HTTP Client | Axios                                | Interceptors, multipart form support                     |

---

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or pnpm

### Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --port 8000
```

The API will be live at `http://127.0.0.1:8000`.
Auto-generated docs: `http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend

# Copy environment variables
cp ../.env.example .env.local
# Edit .env.local if your backend runs on a different port

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Environment Variables

Copy `.env.example` to `.env.local` in the frontend directory:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

No API keys are required — the model runs fully locally via `sentence-transformers`.

---

## Project Structure

```
ResumeIQ/
├── .env.example
├── .gitignore
├── README.md
├── REFLECTION.md
│
├── backend/
│   ├── main.py          # FastAPI app, routing, validation
│   ├── parser.py        # PDF extraction + text cleanup
│   ├── scorer.py        # Scoring logic, suggestions
│   ├── skills.py        # 80+ skills database with aliases
│   └── requirements.txt
│
└── frontend/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx         # Main page, hero, layout orchestration
    │   └── globals.css      # Design system, animations
    ├── components/
    │   ├── UploadSection.tsx  # Drag-drop upload + JD input
    │   ├── ScoreCircle.tsx    # Animated SVG arc score
    │   └── ResultsPanel.tsx   # Tabbed results display
    ├── lib/
    │   └── api.ts             # Axios instance
    ├── package.json
    ├── next.config.ts
    └── tsconfig.json
```

---

## API Reference

### `POST /analyze`

**Form fields:**

| Field             | Type   | Description                   |
|------------------|--------|-------------------------------|
| `resume`         | File   | PDF resume (max 5 MB)         |
| `job_description`| string | Full job description text     |

**Response:**

```json
{
  "match_score":     78.4,
  "semantic_score":  81.2,
  "keyword_score":   73.3,
  "strengths":       ["python", "react", "docker", "machine learning"],
  "missing_skills":  ["aws", "kubernetes", "system design"],
  "suggestions":     [
    "Add AWS experience — even a personal project on EC2/S3/Lambda demonstrates cloud fluency.",
    "Add Kubernetes / k8s experience or mention you've managed containerised workloads at scale.",
    "Include system design work — architecture decisions, scalability trade-offs, or distributed systems."
  ],
  "matched_skills":  4,
  "total_jd_skills": 7
}
```

### `GET /health`

Returns `{ "status": "ok" }` — useful for deployment liveness probes.

---

## Video Walkthrough

[📹 Watch on Loom](#) *(add your link here)*

---

## Written Reflection

See [REFLECTION.md](./REFLECTION.md)

---

## What I'd Add With More Time

- **Bulk upload** — upload multiple resumes and get a ranked shortlist for hiring managers
- **Tailored rewrite suggestions** — "Rewrite this bullet to highlight impact on X"
- **Section-level analysis** — score each resume section (Experience, Skills, Projects) independently
- **ATS simulation** — flag formatting issues that trip up Applicant Tracking Systems
- **Auth + history** — save past analyses and track improvement over time
