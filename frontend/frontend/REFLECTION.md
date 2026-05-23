# Reflection — ResumeIQ

## Why I Chose This Stack

The brief gave full freedom, so every decision was deliberate.

For the AI layer I chose `sentence-transformers` with the `all-MiniLM-L6-v2` model rather than calling a hosted API like OpenAI. The reason is twofold: it runs entirely offline with no API cost or latency from a third-party, and it demonstrates an understanding of how embeddings and cosine similarity actually work — not just wrapping an API call. The model is small enough to load in under two seconds on a standard laptop and achieves strong results on semantic textual similarity benchmarks.

For the backend I chose FastAPI over Flask because it gives async request handling out of the box, auto-generates interactive API docs at `/docs`, and enforces type-safe request/response schemas with Pydantic. For PDF parsing I chose PyMuPDF because it is the fastest Python PDF library, handles multi-column resume layouts well, and gives direct access to page-level text without third-party cloud calls.

On the frontend, Next.js 16 with the App Router is the right default for anything beyond a single page — it handles routing, metadata, and font optimisation cleanly. I used Tailwind CSS v4 with raw CSS variables rather than relying on a component library. This kept the bundle lean and gave me full control over the visual identity.

## Biggest Challenge

The hardest part was making keyword matching accurate without being brittle. A naive `if skill in text` check produces false positives — "rust" inside "frustrated", "r" matching every sentence. The fix was a word-boundary regex pattern applied per alias, with an alias expansion map so "reactjs", "react.js", and "react js" all resolve to the same canonical skill. Getting this right for 80+ skills, including skills with special characters (`c++`, `next.js`, `ci/cd`), required careful escaping and testing.

## What I'd Do Differently

With more time I would replace the static skills database with dynamic keyword extraction from the JD itself using TF-IDF or KeyBERT. This would make the gap analysis work for any niche role — not just the 80+ skills I hand-curated. I'd also add a section-level breakdown: instead of one overall score, score each resume section (Experience, Projects, Skills, Education) individually and show where the resume is strongest and weakest. Finally, I'd add support for DOCX resumes alongside PDF, since many candidates use Word.
