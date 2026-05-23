# ─────────────────────────────────────────────────────────────────────────────
#  skills.py  —  ResumeIQ skill extraction
#
#  80+ skills across 7 categories, each with common aliases.
#  Uses word-boundary regex so "rust" won't match inside "frustrated".
# ─────────────────────────────────────────────────────────────────────────────

import re

# (canonical_name, [aliases/variants])
SKILLS_DB: list[tuple[str, list[str]]] = [
    # ── Programming Languages ─────────────────────────────────────────────────
    ("python",          ["python3", "python2"]),
    ("javascript",      ["js", "es6", "es2015", "ecmascript"]),
    ("typescript",      ["ts"]),
    ("java",            ["java 8", "java 11", "java 17", "java8", "java11"]),
    ("c++",             ["cpp", "c plus plus"]),
    ("c#",              ["csharp", "c sharp", "dotnet", ".net"]),
    ("go",              ["golang"]),
    ("rust",            []),
    ("kotlin",          []),
    ("swift",           []),
    ("ruby",            ["ruby on rails", "rails"]),
    ("php",             []),
    ("scala",           []),
    ("r",               ["r language"]),

    # ── Web & Frameworks ──────────────────────────────────────────────────────
    ("react",           ["reactjs", "react.js", "react js"]),
    ("next.js",         ["nextjs", "next js"]),
    ("vue",             ["vue.js", "vuejs", "vue js"]),
    ("angular",         ["angularjs", "angular js"]),
    ("svelte",          []),
    ("fastapi",         ["fast api"]),
    ("flask",           []),
    ("django",          []),
    ("express",         ["express.js", "expressjs"]),
    ("node.js",         ["nodejs", "node js"]),
    ("graphql",         []),
    ("rest api",        ["restful api", "restful apis", "rest apis"]),
    ("tailwind",        ["tailwindcss", "tailwind css"]),
    ("html",            ["html5"]),
    ("css",             ["css3", "sass", "scss"]),

    # ── Data & ML ─────────────────────────────────────────────────────────────
    ("machine learning",["ml", "supervised learning", "unsupervised learning", "random forest", "xgboost"]),
    ("deep learning",   ["dl", "neural network", "neural networks", "cnn", "rnn", "lstm", "transformer"]),
    ("nlp",             ["natural language processing", "text mining", "text classification", "named entity recognition", "ner"]),
    ("computer vision", ["cv", "image recognition", "object detection", "image segmentation"]),
    ("tensorflow",      ["tf", "tf2", "tensorflow2"]),
    ("pytorch",         ["torch"]),
    ("scikit-learn",    ["sklearn", "scikit learn"]),
    ("pandas",          []),
    ("numpy",           []),
    ("hugging face",    ["huggingface", "transformers library"]),
    ("langchain",       ["lang chain"]),
    ("openai",          ["gpt", "gpt-4", "gpt-3", "chatgpt", "openai api"]),
    ("data analysis",   ["data analytics", "exploratory data analysis", "eda"]),
    ("data visualization", ["matplotlib", "seaborn", "plotly", "tableau", "power bi", "dashboards"]),
    ("statistics",      ["statistical analysis", "statistical modeling", "regression", "hypothesis testing"]),
    ("spark",           ["apache spark", "pyspark"]),
    ("llm",             ["large language model", "large language models", "foundation model"]),

    # ── Databases ─────────────────────────────────────────────────────────────
    ("sql",             ["mysql", "postgresql", "postgres", "sqlite", "t-sql", "pl/sql", "database queries"]),
    ("mongodb",         ["mongo", "mongoose"]),
    ("redis",           []),
    ("elasticsearch",   ["elastic search", "opensearch"]),
    ("dynamodb",        ["dynamo db", "dynamo"]),
    ("cassandra",       []),
    ("firebase",        ["firestore"]),
    ("supabase",        []),
    ("vector database", ["pinecone", "chroma", "chromadb", "weaviate", "faiss", "qdrant"]),

    # ── Cloud & DevOps ────────────────────────────────────────────────────────
    ("aws",             ["amazon web services", "ec2", "s3", "lambda", "sagemaker", "cloudwatch", "rds", "eks"]),
    ("azure",           ["microsoft azure", "azure devops", "azure functions"]),
    ("gcp",             ["google cloud", "google cloud platform", "bigquery", "gke", "cloud run"]),
    ("docker",          ["containerisation", "containerization", "containers", "dockerfile", "docker-compose"]),
    ("kubernetes",      ["k8s", "helm", "container orchestration"]),
    ("terraform",       ["infrastructure as code", "iac"]),
    ("ci/cd",           ["github actions", "gitlab ci", "jenkins", "circleci", "continuous integration", "continuous deployment", "continuous delivery", "devops pipeline"]),
    ("linux",           ["unix", "bash", "shell scripting", "command line"]),
    ("git",             ["github", "gitlab", "bitbucket", "version control"]),
    ("monitoring",      ["datadog", "prometheus", "grafana", "new relic", "observability"]),

    # ── Soft Skills & Practices ───────────────────────────────────────────────
    ("leadership",      ["team lead", "team leadership", "people management", "managing teams", "tech lead", "technical lead"]),
    ("communication",   ["written communication", "verbal communication", "presentations", "stakeholder communication"]),
    ("agile",           ["scrum", "kanban", "sprint planning", "sprint", "jira", "confluence"]),
    ("system design",   ["distributed systems", "scalability", "high availability", "architecture", "microservices architecture"]),
    ("testing",         ["unit testing", "integration testing", "pytest", "jest", "tdd", "bdd", "test driven development", "e2e testing"]),
    ("microservices",   ["micro services", "service mesh", "service oriented"]),
    ("security",        ["cybersecurity", "oauth", "jwt", "authentication", "authorisation", "authorization", "encryption", "zero trust"]),
    ("problem solving", ["algorithms", "data structures", "competitive programming", "algorithmic thinking"]),
    ("product management", ["product thinking", "roadmap", "user stories", "product strategy"]),
]

# ── Flat alias lookup: alias → canonical ─────────────────────────────────────
_ALIAS_MAP: dict[str, str] = {}
for _canonical, _aliases in SKILLS_DB:
    _ALIAS_MAP[_canonical] = _canonical
    for _alias in _aliases:
        _ALIAS_MAP[_alias] = _canonical


def extract_skills(text: str) -> list[str]:
    """
    Return sorted, deduplicated canonical skill names found in *text*.
    Uses word-boundary regex so partial matches inside other words are avoided.
    """
    text_lower = text.lower()
    found: set[str] = set()

    for alias, canonical in _ALIAS_MAP.items():
        # Escape special regex chars in alias (e.g. "c++", "next.js")
        escaped = re.escape(alias)
        pattern = r"(?<![a-z0-9\-])" + escaped + r"(?![a-z0-9\-])"
        if re.search(pattern, text_lower):
            found.add(canonical)

    return sorted(found)
