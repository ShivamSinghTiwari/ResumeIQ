# ResumeIQ — AI-Powered Resume Match Analyzer

Upload your resume, paste a job description, and instantly understand how well your profile matches the role.

---

## Demo

ResumeIQ is a full-stack AI-powered web application that evaluates resumes against job descriptions using semantic similarity, keyword overlap, and NLP-based skill extraction.

The application provides:

* Match Score (0–100%)
* Resume strengths
* Missing skills
* Actionable improvement suggestions

---

## Problem Statement

Job seekers often apply to roles without knowing how well their resume actually aligns with the job description. This leads to:

* Generic applications
* Missed opportunities
* Poor ATS compatibility
* Weak skill targeting

ResumeIQ solves this by providing an instant AI-powered resume analysis system that compares resumes against job descriptions and identifies strengths, gaps, and improvement areas.

---

## Features

### AI Resume Matching

* Semantic similarity scoring using transformer embeddings
* Keyword overlap scoring using curated skill matching
* Weighted scoring model for more accurate evaluation

### Resume Analysis

* Detects matching skills
* Identifies missing skills
* Generates actionable suggestions

### Modern UI

* Drag-and-drop PDF upload
* Animated score visualisation
* Responsive dashboard
* Dark-themed modern interface

### Performance & Validation

* File size validation
* PDF-only upload support
* Fast local inference using Sentence Transformers
* Temporary file cleanup after processing

---

## Scoring Logic

ResumeIQ uses a two-signal scoring model:

Final Score = 60% × Semantic Similarity + 40% × Keyword Overlap

### Semantic Similarity

Uses `sentence-transformers/all-MiniLM-L6-v2` to generate embeddings for:

* Resume text
* Job description text

Cosine similarity is then computed between the embeddings to understand contextual similarity beyond exact keywords.

Example:
A resume mentioning:

* “built scalable REST APIs”

can still match:

* “backend engineering experience”

even if wording differs.

### Keyword Overlap

Uses:

* Curated skills database
* Alias expansion
* Regex-based skill extraction

Example:

* `reactjs → react`
* `k8s → kubernetes`

A Jaccard overlap score is computed between:

* Resume skills
* Job description skills

---

## Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│          Next.js 16 · React 19 · Tailwind CSS              │
│                                                             │
│  Upload Resume + Paste JD                                  │
│            ↓                                                │
│      Axios API Request                                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     FastAPI Backend                         │
│                                                             │
│  main.py                                                    │
│   ├─ Input validation                                       │
│   ├─ File handling                                          │
│   └─ API routes                                             │
│                                                             │
│  parser.py                                                  │
│   └─ PDF text extraction using PyMuPDF                      │
│                                                             │
│  scorer.py                                                  │
│   ├─ SentenceTransformer embeddings                         │
│   ├─ Cosine similarity                                      │
│   └─ Weighted scoring                                       │
│                                                             │
│  skills.py                                                  │
│   └─ Skill extraction + alias mapping                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer       | Technology            | Why                          |
| ----------- | --------------------- | ---------------------------- |
| AI / NLP    | sentence-transformers | Fast semantic embeddings     |
| PDF Parsing | PyMuPDF               | Reliable PDF text extraction |
| Backend     | FastAPI               | High-performance async APIs  |
| Frontend    | Next.js + React       | Modern frontend architecture |
| Styling     | Tailwind CSS          | Fast and scalable UI styling |
| HTTP Client | Axios                 | API communication            |
| Language    | Python + TypeScript   | AI + frontend integration    |

---

## Project Structure

```text
ResumeIQ/
│
├── backend/
│   ├── main.py
│   ├── parser.py
│   ├── scorer.py
│   ├── skills.py
│   └── requirements.txt
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore
├── README.md
└── REFLECTION.md
```

---

## Setup Instructions

### Prerequisites

* Python 3.10+
* Node.js 18+
* npm

---

# Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run backend server
python -m uvicorn main:app --reload
```

Backend runs at:

```text
http://127.0.0.1:8000
```

---

# Frontend Setup

```bash
cd frontend/frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend runs at:

```text
http://localhost:3000
```

---

## API Reference

### POST `/analyze`

#### Form Data

| Field           | Type   | Description          |
| --------------- | ------ | -------------------- |
| resume          | File   | PDF resume           |
| job_description | String | Job description text |

### Example Response

```json
{
  "match_score": 78.4,
  "strengths": [
    "python",
    "react",
    "machine learning"
  ],
  "missing_skills": [
    "aws",
    "docker",
    "system design"
  ],
  "suggestions": [
    "Add AWS cloud experience.",
    "Include Docker-based projects.",
    "Mention scalable architecture work."
  ]
}
```

---

## Challenges Faced

One of the biggest challenges was balancing:

* semantic understanding
* keyword matching

A pure keyword-based approach produced inaccurate results, while semantic similarity alone sometimes ignored critical required skills.

To solve this, ResumeIQ combines:

* transformer-based embeddings
* structured keyword overlap

into a weighted scoring system.

Another challenge was handling PDF extraction reliably across different resume formats. PyMuPDF was chosen due to its speed and consistent extraction quality.

---

## Future Improvements

If given more time, I would add:

* Multi-resume ranking system
* ATS compatibility analysis
* Resume rewrite suggestions
* Section-wise scoring
* Recruiter dashboard
* Cloud deployment
* Authentication & history tracking

---

## Video Walkthrough

Video walkthrough link will be added here.

---

## Author

Built with Python, FastAPI, Next.js, and NLP technologies as an AI-powered internship project.
