from fastapi import FastAPI
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str


app = FastAPI(title="GoldMate AI service")


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Liveness check. Same shape as the Node API: {"status": "ok"}."""
    return HealthResponse(status="ok")
