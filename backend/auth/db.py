import sqlite3
import threading
from pathlib import Path

DB_PATH = Path(__file__).parent.parent.parent / "data" / "app.db"
_lock = threading.Lock()


def _connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=10000")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = _connect()
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TEXT NOT NULL,
            default_gender_group TEXT,
            default_occasion TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id TEXT NOT NULL REFERENCES users(id),
            created_at TEXT NOT NULL
        )
    """)
    # Migrate older DBs created before preference columns existed.
    existing_cols = {row["name"] for row in conn.execute("PRAGMA table_info(users)").fetchall()}
    if "default_gender_group" not in existing_cols:
        conn.execute("ALTER TABLE users ADD COLUMN default_gender_group TEXT")
    if "default_occasion" not in existing_cols:
        conn.execute("ALTER TABLE users ADD COLUMN default_occasion TEXT")
    conn.commit()
    conn.close()


def get_user_by_email(email: str) -> dict | None:
    conn = _connect()
    row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
    conn.close()
    return dict(row) if row else None


def create_user(user_id: str, email: str, name: str, password_hash: str, salt: str, created_at: str):
    conn = _connect()
    with _lock:
        conn.execute(
            "INSERT INTO users (id, email, name, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)",
            (user_id, email, name, password_hash, salt, created_at),
        )
        conn.commit()
    conn.close()


def create_session(token: str, user_id: str, created_at: str):
    conn = _connect()
    with _lock:
        conn.execute(
            "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
            (token, user_id, created_at),
        )
        conn.commit()
    conn.close()


def get_user_by_token(token: str) -> dict | None:
    conn = _connect()
    row = conn.execute(
        "SELECT users.* FROM sessions JOIN users ON sessions.user_id = users.id WHERE sessions.token = ?",
        (token,),
    ).fetchone()
    conn.close()
    return dict(row) if row else None


def delete_session(token: str):
    conn = _connect()
    with _lock:
        conn.execute("DELETE FROM sessions WHERE token = ?", (token,))
        conn.commit()
    conn.close()


def update_user_name(user_id: str, name: str):
    conn = _connect()
    with _lock:
        conn.execute("UPDATE users SET name = ? WHERE id = ?", (name, user_id))
        conn.commit()
    conn.close()


def update_user_password(user_id: str, password_hash: str, salt: str):
    conn = _connect()
    with _lock:
        conn.execute("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?", (password_hash, salt, user_id))
        conn.commit()
    conn.close()


def update_user_preferences(user_id: str, default_gender_group: str | None, default_occasion: str | None):
    conn = _connect()
    with _lock:
        conn.execute(
            "UPDATE users SET default_gender_group = ?, default_occasion = ? WHERE id = ?",
            (default_gender_group, default_occasion, user_id),
        )
        conn.commit()
    conn.close()


def delete_user(user_id: str):
    conn = _connect()
    with _lock:
        conn.execute("DELETE FROM sessions WHERE user_id = ?", (user_id,))
        conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
        conn.commit()
    conn.close()
