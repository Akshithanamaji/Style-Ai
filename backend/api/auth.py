import re
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, field_validator

from backend.auth.db import (
    init_db, get_user_by_email, create_user,
    create_session, get_user_by_token, delete_session,
    update_user_name, update_user_password,
    update_user_preferences, delete_user,
)
from backend.auth.security import hash_password, verify_password, generate_token

init_db()

router = APIRouter()

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def valid_email(cls, v):
        if not EMAIL_RE.match(v):
            raise ValueError("Invalid email address")
        return v.lower()

    @field_validator("password")
    @classmethod
    def valid_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v

    @field_validator("name")
    @classmethod
    def valid_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str


class UpdateProfileRequest(BaseModel):
    name: str

    @field_validator("name")
    @classmethod
    def valid_name(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def valid_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v


GENDER_GROUPS = {"women", "men", "children", "seniors"}
OCCASIONS = {"daily", "office", "college", "party", "wedding", "festive", "formal", "night_wear", "functions"}


class PreferencesRequest(BaseModel):
    default_gender_group: str | None = None
    default_occasion: str | None = None

    @field_validator("default_gender_group")
    @classmethod
    def valid_gender_group(cls, v):
        if v is not None and v not in GENDER_GROUPS:
            raise ValueError(f"Invalid gender group: {v}")
        return v

    @field_validator("default_occasion")
    @classmethod
    def valid_occasion(cls, v):
        if v is not None and v not in OCCASIONS:
            raise ValueError(f"Invalid occasion: {v}")
        return v


def _user_out(user: dict) -> dict:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "default_gender_group": user.get("default_gender_group"),
        "default_occasion": user.get("default_occasion"),
    }


def _issue_session(user_id: str) -> str:
    token = generate_token()
    create_session(token, user_id, datetime.now(timezone.utc).isoformat())
    return token


def _require_user(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ").strip()
    user = get_user_by_token(token)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return user


@router.post("/signup")
def signup(req: SignupRequest):
    if get_user_by_email(req.email):
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    password_hash, salt = hash_password(req.password)
    user_id = str(uuid.uuid4())
    create_user(user_id, req.email, req.name, password_hash, salt, datetime.now(timezone.utc).isoformat())

    token = _issue_session(user_id)
    return {"token": token, "user": _user_out({"id": user_id, "name": req.name, "email": req.email})}


@router.post("/login")
def login(req: LoginRequest):
    user = get_user_by_email(req.email.strip().lower())
    if not user or not verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = _issue_session(user["id"])
    return {"token": token, "user": _user_out(user)}


@router.get("/me")
def me(authorization: str | None = Header(default=None)):
    user = _require_user(authorization)
    return {"user": _user_out(user)}


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)):
    if authorization and authorization.startswith("Bearer "):
        delete_session(authorization.removeprefix("Bearer ").strip())
    return {"ok": True}


@router.patch("/me")
def update_profile(req: UpdateProfileRequest, authorization: str | None = Header(default=None)):
    user = _require_user(authorization)
    update_user_name(user["id"], req.name)
    user["name"] = req.name
    return {"user": _user_out(user)}


@router.post("/change-password")
def change_password(req: ChangePasswordRequest, authorization: str | None = Header(default=None)):
    user = _require_user(authorization)
    if not verify_password(req.current_password, user["password_hash"], user["salt"]):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    password_hash, salt = hash_password(req.new_password)
    update_user_password(user["id"], password_hash, salt)
    return {"ok": True}


@router.patch("/preferences")
def update_preferences(req: PreferencesRequest, authorization: str | None = Header(default=None)):
    user = _require_user(authorization)
    update_user_preferences(user["id"], req.default_gender_group, req.default_occasion)
    user["default_gender_group"] = req.default_gender_group
    user["default_occasion"] = req.default_occasion
    return {"user": _user_out(user)}


@router.delete("/me")
def delete_account(authorization: str | None = Header(default=None)):
    user = _require_user(authorization)
    delete_user(user["id"])
    return {"ok": True}
