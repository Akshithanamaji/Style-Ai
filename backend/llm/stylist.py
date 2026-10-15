import os
import uuid

_sessions: dict[str, list[dict]] = {}  # session_id → message history


def _get_model(system_prompt: str):
    try:
        import google.generativeai as genai
    except ImportError:
        raise RuntimeError("google-generativeai package not installed. Run: pip install google-generativeai")
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY environment variable not set")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel(
        model_name="gemini-flash-latest",
        system_instruction=system_prompt,
    )


def _build_system_prompt(context: dict) -> str:
    face_shape = context.get("faceShape", "")
    season = context.get("season", "")
    undertone = context.get("undertone", "")
    depth = context.get("depth", "")
    occasion = context.get("occasion", "daily")
    palette = context.get("palette", {})
    body_type = context.get("bodyType", "")
    gender_group = context.get("genderGroup", "")
    person_category = context.get("personCategory", "")
    hair_length = context.get("hairLength", "")

    profile_lines = []
    if person_category:
        profile_lines.append(f"- Person type: {person_category.replace('_', ' ')}")
    if gender_group:
        profile_lines.append(f"- Styling category: {gender_group}")
    if body_type and body_type not in ("unknown", "child", "comfortable"):
        profile_lines.append(f"- Body type: {body_type.replace('_', ' ')}")
    if face_shape:
        profile_lines.append(f"- Face shape: {face_shape}")
    if hair_length and hair_length != "unknown":
        profile_lines.append(f"- Hair length: {hair_length}")
    if season:
        profile_lines.append(f"- Color season: {season} ({undertone} undertone, {depth} depth)")
    if occasion:
        profile_lines.append(f"- Current occasion focus: {occasion}")
    if palette:
        best = ", ".join(palette.get("best_colors", [])[:5])
        metal = palette.get("metal_tone", "gold")
        profile_lines.append(f"- Best palette colors (hex): {best}")
        profile_lines.append(f"- Recommended metal tone: {metal}")

    profile_section = "\n".join(profile_lines) if profile_lines else "- Profile not yet complete"

    return f"""You are a friendly, knowledgeable personal fashion stylist with 15 years of experience.

Your client's profile:
{profile_section}

Your role:
1. Give warm, specific, actionable fashion advice tailored to this exact profile.
2. If the profile is incomplete, give helpful general fashion tips and encourage them to complete the analysis.
3. When the user asks for something different (new occasion, color preferences), naturally adapt.
4. Reference their face shape and season naturally — don't repeat the full profile every message.
5. Keep responses concise (2-4 sentences or a short bulleted list) unless asked for detail.
6. Be encouraging and body-positive — frame advice as what flatters, not what to hide.

Be warm and welcoming. Jump straight to helpful advice."""


def create_session() -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = []
    return session_id


def chat(session_id: str, user_message: str, context: dict) -> dict:
    if session_id not in _sessions:
        _sessions[session_id] = []

    history = _sessions[session_id]
    model = _get_model(_build_system_prompt(context))

    gemini_history = [
        {"role": "user" if m["role"] == "user" else "model", "parts": [m["content"]]}
        for m in history
    ]

    chat_session = model.start_chat(history=gemini_history)
    response = chat_session.send_message(user_message)
    reply = response.text

    history.append({"role": "user", "content": user_message})
    history.append({"role": "assistant", "content": reply})

    if len(history) > 40:
        _sessions[session_id] = history[-40:]

    return {"reply": reply, "session_id": session_id}
