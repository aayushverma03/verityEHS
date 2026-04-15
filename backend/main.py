# FastAPI application entry point for EHS AI Platform
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.auth import router as auth_router
from routes.documents import router as documents_router
from routes.search import router as search_router
from routes.ai import router as ai_router
from routes.approvals import router as approvals_router
from routes.submissions import router as submissions_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")

app = FastAPI(title="EHS AI Platform API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Compliance-Gaps", "X-Submission-Id", "X-Compliance-Status"],
)

app.include_router(auth_router)
app.include_router(documents_router)
app.include_router(search_router)
app.include_router(ai_router)
app.include_router(approvals_router)
app.include_router(submissions_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
