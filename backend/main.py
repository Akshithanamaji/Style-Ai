from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException
from dotenv import load_dotenv
from pathlib import Path
from backend.api.analyze import router as analyze_router
from backend.api.recommend import router as recommend_router
from backend.api.chat import router as chat_router
from backend.api.auth import router as auth_router

load_dotenv()

app = FastAPI(title="AI Fashion Stylist API", version="1.0.0")

app.include_router(analyze_router, prefix="/api")
app.include_router(recommend_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")


@app.get("/health")
def health():
    return {"status": "ok"}


DIST = Path(__file__).parent.parent / "frontend" / "dist"


@app.exception_handler(StarletteHTTPException)
async def spa_fallback(request: Request, exc: StarletteHTTPException):
    if exc.status_code == 404 and not request.url.path.startswith("/api"):
        return FileResponse(DIST / "index.html")
    return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)


app.mount("/models", StaticFiles(directory=DIST / "models"), name="models")
app.mount("/", StaticFiles(directory=DIST, html=True), name="frontend")
