"""
Recommendation rules engine.
Combines face-shape advice, season palette, body type rules, and catalog filtering
into a single structured response.
"""

import json
from pathlib import Path
from colormath.color_objects import sRGBColor, LabColor
from colormath.color_conversions import convert_color

DATA_DIR = Path(__file__).parent.parent.parent / "data"

_face_rules = None
_catalog = None
_palettes = None
_body_rules = None


def _load():
    global _face_rules, _catalog, _palettes, _body_rules
    if _face_rules is None:
        _face_rules = json.loads((DATA_DIR / "face_shape_rules.json").read_text(encoding="utf-8"))
        _catalog = json.loads((DATA_DIR / "catalog.json").read_text(encoding="utf-8"))
        _palettes = json.loads((DATA_DIR / "season_palettes.json").read_text(encoding="utf-8"))
        _body_rules = json.loads((DATA_DIR / "body_type_rules.json").read_text(encoding="utf-8"))


def _hex_to_lab(hex_color: str) -> tuple:
    """Convert #rrggbb to CIE LAB."""
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    srgb = sRGBColor(r / 255, g / 255, b / 255)
    lab = convert_color(srgb, LabColor)
    return lab.lab_l, lab.lab_a, lab.lab_b


def _color_distance(hex1: str, hex2: str) -> float:
    """Euclidean distance in LAB space between two hex colors."""
    L1, a1, b1 = _hex_to_lab(hex1)
    L2, a2, b2 = _hex_to_lab(hex2)
    return ((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2) ** 0.5


def _item_palette_score(item_hex: str, best_colors: list, avoid_colors: list) -> float:
    best_dist = min(_color_distance(item_hex, c) for c in best_colors)
    avoid_dist = min(_color_distance(item_hex, c) for c in avoid_colors)
    score = (100 - best_dist) - max(0, 50 - avoid_dist) * 0.5
    return score


def _get_dress_styles_for_occasion(body_rules: dict, occasion: str, gender_group: str, body_type: str) -> list:
    """Get recommended dress style names for given body type and occasion."""
    group_rules = body_rules.get(gender_group, {})

    # Pick the right body type key
    if gender_group == "children":
        bt_key = "child"
    elif gender_group == "seniors":
        bt_key = "comfortable"
    else:
        bt_key = body_type if body_type != "unknown" else list(group_rules.keys())[0]

    bt_rules = group_rules.get(bt_key, {})
    occasions_map = bt_rules.get("occasions", {})

    # Normalize occasion (work → office, casual → daily)
    occ = occasion.lower()
    if occ == "work":
        occ = "office"
    if occ == "casual":
        occ = "daily"

    return occasions_map.get(occ, occasions_map.get("daily", []))


def get_recommendations(face_shape: str, season: str, occasion: str,
                        body_type: str = "unknown", gender_group: str = "women") -> dict:
    _load()

    face_rules = _face_rules.get(face_shape, _face_rules["oval"])
    palette = _palettes.get(season, _palettes["Spring"])

    # Normalize occasion for catalog filtering
    occ_lower = occasion.lower() if occasion else ""
    # Map legacy occasion names
    if occ_lower == "work":
        occ_lower = "office"
    if occ_lower in ("casual", ""):
        occ_lower = "daily"

    # Get body type rules
    group_rules = _body_rules.get(gender_group, _body_rules.get("women", {}))
    if gender_group == "children":
        bt_key = "child"
    elif gender_group == "seniors":
        bt_key = "comfortable"
    else:
        bt_key = body_type if body_type != "unknown" and body_type in group_rules else (list(group_rules.keys())[0] if group_rules else "hourglass")

    body_type_info = group_rules.get(bt_key, {})

    # Get recommended dress styles for this occasion + body type
    dress_styles = _get_dress_styles_for_occasion(_body_rules, occ_lower, gender_group, bt_key)

    # Filter catalog by occasion and gender
    if occ_lower:
        filtered = [
            i for i in _catalog
            if (occ_lower in i.get("occasions", []) or
                occasion.lower() in i.get("occasions", []))
            and (i.get("gender", "all") in (gender_group, "all") or gender_group == "all")
        ]
    else:
        filtered = [i for i in _catalog if i.get("gender", "all") in (gender_group, "all")]

    # Further filter by body type compatibility if tags are available
    if body_type and body_type != "unknown":
        body_filtered = [
            i for i in filtered
            if not i.get("body_types") or body_type in i.get("body_types", [])
        ]
        if body_filtered:
            filtered = body_filtered

    # Rank by color palette score
    scored = [
        (item, _item_palette_score(item["dominant_color"], palette["best_colors"], palette["avoid_colors"]))
        for item in filtered
    ]
    scored.sort(key=lambda x: x[1], reverse=True)
    top_items = [item for item, _ in scored[:12]]

    return {
        "face_shape": face_shape,
        "season": season,
        "occasion": occasion,
        "gender_group": gender_group,
        "body_type": bt_key,
        "body_type_info": body_type_info,
        "dress_styles": dress_styles,
        "face_advice": face_rules,
        "palette": palette,
        "catalog_items": top_items,
    }
