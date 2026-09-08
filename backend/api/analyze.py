import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.vision.skin_tone import analyze_skin_tone_img, decode_base64_image
from backend.llm.body_analyzer import analyze_body_type

router = APIRouter()

DATA_DIR = Path(__file__).parent.parent.parent / "data"


class SkinAnalysisRequest(BaseModel):
    image_data: str   # data URL or base64
    landmarks: list[dict]


class BodyAnalysisRequest(BaseModel):
    image_data: str   # data URL or base64


@router.post("/analyze-skin")
def analyze_skin(req: SkinAnalysisRequest):
    try:
        img = decode_base64_image(req.image_data)
        result = analyze_skin_tone_img(img, req.landmarks)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/analyze-body")
def analyze_body(req: BodyAnalysisRequest):
    try:
        result = analyze_body_type(req.image_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/palette/{season}")
def get_palette(season: str):
    allowed = {"Spring", "Summer", "Autumn", "Winter"}
    if season not in allowed:
        raise HTTPException(status_code=400, detail="Invalid season")
    palettes = json.loads((DATA_DIR / "season_palettes.json").read_text(encoding="utf-8"))
    return palettes[season]


@router.get("/body-type-rules")
def get_body_type_rules():
    rules = json.loads((DATA_DIR / "body_type_rules.json").read_text(encoding="utf-8"))
    return rules
