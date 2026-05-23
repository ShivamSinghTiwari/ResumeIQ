# ─────────────────────────────────────────────────────────────────────────────
#  scorer.py  —  Core matching logic for ResumeIQ
#
#  Score formula:
#    60% semantic similarity  (sentence-transformers cosine)
#    40% keyword overlap      (Jaccard on extracted skills)
#
#  Returns: match_score, semantic_score, keyword_score,
#           strengths, missing_skills, suggestions,
#           matched_skills, total_jd_skills
# ─────────────────────────────────────────────────────────────────────────────

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity

from skills import extract_skills

# Loaded once at import — kept in memory across requests
_model = SentenceTransformer("all-MiniLM-L6-v2")

# ── Per-skill actionable suggestions ─────────────────────────────────────────
_SUGGESTIONS: dict[str, str] = {
    "aws":              "Add AWS experience — even a personal project on EC2/S3/Lambda demonstrates cloud fluency.",
    "azure":            "Mention Microsoft Azure usage or certifications (AZ-900 is a fast credential to earn).",
    "gcp":              "Include Google Cloud projects or GCP certifications.",
    "docker":           "Containerisation is expected here. Add Docker usage — Dockerfile, docker-compose, or deployed containers.",
    "kubernetes":       "Add Kubernetes / k8s experience or mention you've managed containerised workloads at scale.",
    "terraform":        "Infrastructure-as-Code is listed. Add Terraform or CloudFormation experience.",
    "ci/cd":            "Mention CI/CD pipelines — GitHub Actions, GitLab CI, or Jenkins. Even automating tests qualifies.",
    "linux":            "Add Linux/Unix command-line or shell-scripting experience.",
    "git":              "Ensure Git and version-control workflows (branching strategy, PRs, code reviews) are visible.",
    "monitoring":       "Mention observability tools: Datadog, Prometheus, Grafana, or similar.",
    "leadership":       "Add leadership examples — mentoring juniors, owning a feature end-to-end, or leading sprints.",
    "communication":    "Highlight communication: presentations given, technical docs written, or cross-team collaboration.",
    "agile":            "Mention Agile/Scrum experience — sprint planning, stand-ups, retros, or Jira.",
    "system design":    "Include system design work — architecture decisions, scalability trade-offs, or distributed systems.",
    "testing":          "Add testing practices: unit/integration tests, TDD, or frameworks like pytest or Jest.",
    "microservices":    "Mention microservices or service-oriented architecture experience.",
    "security":         "Include security knowledge — OAuth, JWT, authentication flows, or security audits.",
    "sql":              "Highlight SQL skills with specific databases (PostgreSQL, MySQL) and complex query examples.",
    "mongodb":          "Add NoSQL/MongoDB experience or data modelling for unstructured data.",
    "redis":            "Mention Redis for caching, pub/sub, or session management.",
    "vector database":  "Vector databases (Pinecone, ChromaDB, FAISS) are key in modern AI stacks — worth adding if you've used them.",
    "machine learning": "Showcase ML work — model training, evaluation metrics, or production deployments.",
    "deep learning":    "Add deep learning projects with TensorFlow or PyTorch.",
    "nlp":              "Include NLP work — text classification, embeddings, NER, or RAG pipelines.",
    "computer vision":  "Add CV projects — object detection, image segmentation, or model deployment.",
    "tensorflow":       "Mention TensorFlow projects or saved model deployments.",
    "pytorch":          "Include PyTorch model training or research experiments.",
    "hugging face":     "Reference Hugging Face Transformers — fine-tuning, inference pipelines, or model cards.",
    "langchain":        "Add LangChain or LLM orchestration experience — increasingly expected in AI roles.",
    "openai":           "Mention OpenAI API integrations or GPT-based projects.",
    "llm":              "Highlight any LLM experience — prompt engineering, fine-tuning, RAG, or deployment.",
    "spark":            "Include Apache Spark / PySpark for large-scale data processing.",
    "data analysis":    "Add data analysis work — EDA, dashboards, or deriving insights from datasets.",
    "statistics":       "Show statistical knowledge — regression, hypothesis testing, A/B experiments.",
    "react":            "Add React project experience — components, hooks, state management.",
    "next.js":          "Mention Next.js experience — SSR, SSG, App Router, or API routes.",
    "typescript":       "Add TypeScript — it's standard in modern frontend and Node.js stacks.",
    "graphql":          "Include GraphQL API consumption or schema design.",
    "python":           "Ensure Python is prominent with concrete project examples.",
    "go":               "Add Go/Golang experience — it's specifically listed in this JD.",
    "rust":             "Mention Rust projects — it's a differentiator and signals systems expertise.",
    "java":             "Include Java experience or JVM-ecosystem work.",
    "problem solving":  "Highlight algorithmic thinking — system optimisation, complex bugs solved, or competitive programming.",
    "product management": "Add product thinking — user stories, roadmap contributions, or impact metrics.",
}

_DEFAULT = (
    "The job description mentions '{skill}'. "
    "Consider adding relevant experience, a personal project, or a certification in this area."
)


def calculate_match(resume_text: str, jd_text: str) -> dict:
    """Main entry point — analyse resume against job description."""

    if not resume_text.strip():
        return _err("Could not extract text from the PDF.")
    if not jd_text.strip():
        return _err("Job description is empty.")

    # ── 1. Semantic similarity ────────────────────────────────────────────────
    r_emb = _model.encode(resume_text, convert_to_numpy=True)
    j_emb = _model.encode(jd_text,     convert_to_numpy=True)
    semantic = float(cosine_similarity([r_emb], [j_emb])[0][0]) * 100

    # ── 2. Keyword / skill overlap ────────────────────────────────────────────
    resume_skills = set(extract_skills(resume_text))
    jd_skills     = set(extract_skills(jd_text))

    strengths      = sorted(resume_skills & jd_skills)
    missing_skills = sorted(jd_skills - resume_skills)

    keyword = (len(strengths) / len(jd_skills) * 100) if jd_skills else semantic

    # ── 3. Weighted final score ───────────────────────────────────────────────
    match_score = round(0.60 * semantic + 0.40 * keyword, 1)

    # ── 4. Dynamic suggestions ────────────────────────────────────────────────
    suggestions = [
        _SUGGESTIONS.get(skill, _DEFAULT.format(skill=skill))
        for skill in missing_skills
    ]

    return {
        "match_score":     match_score,
        "semantic_score":  round(semantic, 1),
        "keyword_score":   round(keyword, 1),
        "strengths":       strengths,
        "missing_skills":  missing_skills,
        "suggestions":     suggestions,
        "matched_skills":  len(strengths),
        "total_jd_skills": len(jd_skills),
    }


def _err(message: str) -> dict:
    return {
        "error": message,
        "match_score": 0, "semantic_score": 0, "keyword_score": 0,
        "strengths": [], "missing_skills": [], "suggestions": [],
        "matched_skills": 0, "total_jd_skills": 0,
    }
