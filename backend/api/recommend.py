from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.rules.engine import get_recommendations

router = APIRouter()


class RecommendRequest(BaseModel):
    face_shape: str
    season: str
    occasion: str = "daily"
    body_type: str = "unknown"
    gender_group: str = "women"


@router.post("/recommend")
def recommend(req: RecommendRequest):
    allowed_shapes = {"oval", "round", "square", "heart", "diamond", "long"}
    allowed_seasons = {"Spring", "Summer", "Autumn", "Winter"}
    allowed_occasions = {"daily", "office", "college", "party", "wedding", "festive", "formal", "night_wear", "functions", "casual", "work", ""}
    allowed_gender_groups = {"women", "men", "children", "seniors"}

    if req.face_shape not in allowed_shapes:
        raise HTTPException(status_code=400, detail=f"Invalid face shape: {req.face_shape}")
    if req.season not in allowed_seasons:
        raise HTTPException(status_code=400, detail=f"Invalid season: {req.season}")
    if req.occasion not in allowed_occasions:
        raise HTTPException(status_code=400, detail=f"Invalid occasion: {req.occasion}")
    if req.gender_group not in allowed_gender_groups:
        raise HTTPException(status_code=400, detail=f"Invalid gender group: {req.gender_group}")

    return get_recommendations(req.face_shape, req.season, req.occasion, req.body_type, req.gender_group)
