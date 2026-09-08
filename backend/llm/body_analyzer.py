import os
import json
import base64


def _encode_image(image_data: str) -> str:
    """Return raw base64 string from a data URL or raw base64."""
    if image_data.startswith("data:"):
        _, encoded = image_data.split(",", 1)
        return encoded
    return image_data


def analyze_body_type(image_data: str) -> dict:
    """
    Use Gemini Vision to detect person category and body type from a photo.
    Returns dict with person_category, body_type, confidence, and description.
    """
    try:
        import google.generativeai as genai
    except ImportError:
        return _fallback()

    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return _fallback()

    genai.configure(api_key=api_key)

    raw_b64 = _encode_image(image_data)
    image_bytes = base64.b64decode(raw_b64)

    model = genai.GenerativeModel("gemini-flash-latest")

    prompt = """Analyze the person in this photo and respond ONLY with a valid JSON object (no markdown, no extra text).

Determine:
1. person_category: one of "adult_woman", "adult_man", "teen_girl", "teen_boy", "child", "senior_woman", "senior_man"
2. body_type:
   - For women/teen girls: one of "hourglass", "pear", "apple", "rectangle", "inverted_triangle"
   - For men/teen boys: one of "athletic", "rectangle", "oval"
   - For children: "child"
   - For seniors: "comfortable"
   - If body is not fully visible: "unknown"
3. confidence: one of "high", "medium", "low"
4. description: 1 sentence describing what you observed (body proportions, not face)
5. face_shape_hint: brief note about visible face shape features if helpful (or empty string)

Rules:
- Base body_type purely on visible body proportions (shoulders, waist, hips)
- If only face is visible, set body_type to "unknown" and confidence to "low"
- Be respectful and neutral in description
- Focus on clothing recommendations relevance, not physical judgement

Respond with ONLY this JSON (no markdown code blocks):
{"person_category": "...", "body_type": "...", "confidence": "...", "description": "...", "face_shape_hint": "..."}"""

    try:
        response = model.generate_content([
            prompt,
            {"mime_type": "image/jpeg", "data": image_bytes}
        ])
        text = response.text.strip()
        # Strip markdown code blocks if present
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        result = json.loads(text)
        return _normalize(result)
    except Exception as e:
        print(f"[body_analyzer] Error: {e}")
        return _fallback()


def _normalize(result: dict) -> dict:
    valid_women_types = {"hourglass", "pear", "apple", "rectangle", "inverted_triangle"}
    valid_men_types = {"athletic", "rectangle", "oval"}
    valid_categories = {"adult_woman", "adult_man", "teen_girl", "teen_boy", "child", "senior_woman", "senior_man"}

    person_cat = result.get("person_category", "adult_woman")
    if person_cat not in valid_categories:
        person_cat = "adult_woman"

    body_type = result.get("body_type", "unknown")
    if person_cat in ("adult_woman", "teen_girl", "senior_woman"):
        if body_type not in valid_women_types:
            body_type = "hourglass"
        gender_group = "women" if person_cat != "senior_woman" else "seniors"
    elif person_cat in ("adult_man", "teen_boy", "senior_man"):
        if body_type not in valid_men_types:
            body_type = "rectangle"
        gender_group = "men" if person_cat != "senior_man" else "seniors"
    else:
        body_type = "child"
        gender_group = "children"

    if gender_group == "seniors":
        body_type = "comfortable"

    return {
        "person_category": person_cat,
        "gender_group": gender_group,
        "body_type": body_type,
        "confidence": result.get("confidence", "low"),
        "description": result.get("description", "Analysis complete."),
        "face_shape_hint": result.get("face_shape_hint", ""),
    }


def _fallback() -> dict:
    return {
        "person_category": "adult_woman",
        "gender_group": "women",
        "body_type": "unknown",
        "confidence": "low",
        "description": "Could not analyze body type automatically. Please select manually.",
        "face_shape_hint": "",
    }
