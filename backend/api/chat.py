from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.llm.stylist import create_session, chat

router = APIRouter()


class ChatRequest(BaseModel):
    session_id: str | None = None
    message: str
    context: dict = {}


@router.post("/chat")
def chat_endpoint(req: ChatRequest):
    try:
        session_id = req.session_id or create_session()
        result = chat(session_id, req.message, req.context)
        return result
    except RuntimeError as e:
        # ANTHROPIC_API_KEY not set
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat/new")
def new_session():
    return {"session_id": create_session()}
