# ─────────────────────────────────────────────
# Parser Service — FastAPI (Python 3.12 + uv)
# ─────────────────────────────────────────────
FROM python:3.12-slim

# Installer uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copier les fichiers de dépendances d'abord (cache Docker)
COPY pyproject.toml uv.lock ./

# Installer les dépendances (sans installer le projet lui-même)
RUN uv sync --frozen --no-install-project

# Copier le reste du code
COPY . .

# Installer le projet
RUN uv sync --frozen

EXPOSE 8000
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
