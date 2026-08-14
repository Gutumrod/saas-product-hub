import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


DEFAULT_DB_PATH = Path("shortener.db")


def get_db_path() -> Path:
    return Path(os.getenv("SHORTENER_DB_PATH", str(DEFAULT_DB_PATH)))


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(get_db_path(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


@contextmanager
def db_connection() -> Iterator[sqlite3.Connection]:
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db() -> None:
    db_path = get_db_path()
    if db_path.parent and str(db_path.parent) != ".":
        db_path.parent.mkdir(parents=True, exist_ok=True)

    with db_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                short_code TEXT UNIQUE NOT NULL,
                original_url TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                is_active INTEGER DEFAULT 1 NOT NULL,
                click_count INTEGER DEFAULT 0 NOT NULL
            );

            CREATE TABLE IF NOT EXISTS click_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                url_id INTEGER NOT NULL,
                clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                referrer TEXT,
                FOREIGN KEY (url_id) REFERENCES urls(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
            CREATE INDEX IF NOT EXISTS idx_click_logs_url_id ON click_logs(url_id);
            CREATE INDEX IF NOT EXISTS idx_click_logs_clicked_at ON click_logs(clicked_at);
            """
        )
