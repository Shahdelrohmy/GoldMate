# GoldMate AI service

Python 3.11+ and FastAPI. Rules: `../../AGENTS.md` (AI never calculates money, every output has a confidence, prompts live in `prompts/`).

```bash
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000/health
pytest
```
