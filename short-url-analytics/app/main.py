import sqlite3
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import FileResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from app.database import db_connection, init_db
from app.models import (
    AnalyticsResponse,
    LinkListResponse,
    ShortenRequest,
    ShortLinkResponse,
)
from app.utils import (
    generate_short_code,
    is_valid_custom_code,
    is_valid_url,
    normalize_referrer,
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="Short URL + Analytics System", version="2.0.0", lifespan=lifespan)
app.mount("/static", StaticFiles(directory="app/static"), name="static")


def build_short_url(request: Request, short_code: str) -> str:
    return str(request.base_url).rstrip("/") + f"/{short_code}"


def row_to_short_link(row: sqlite3.Row, request: Request) -> ShortLinkResponse:
    return ShortLinkResponse(
        short_code=row["short_code"],
        short_url=build_short_url(request, row["short_code"]),
        original_url=row["original_url"],
        created_at=row["created_at"],
        click_count=row["click_count"],
    )


def short_code_exists(short_code: str) -> bool:
    with db_connection() as conn:
        row = conn.execute(
            "SELECT 1 FROM urls WHERE short_code = ? LIMIT 1",
            (short_code,),
        ).fetchone()
    return row is not None


def create_unique_short_code() -> str:
    for _ in range(5):
        short_code = generate_short_code()
        if not short_code_exists(short_code):
            return short_code
    raise HTTPException(status_code=500, detail="Unable to generate unique short code")


@app.get("/", include_in_schema=False)
async def index() -> FileResponse:
    return FileResponse("app/static/index.html")


@app.post("/api/shorten", response_model=ShortLinkResponse, status_code=201)
async def shorten_url(payload: ShortenRequest, request: Request) -> ShortLinkResponse:
    original_url = payload.url.strip()
    if not is_valid_url(original_url):
        raise HTTPException(status_code=400, detail="Invalid URL format")

    if payload.custom_code:
        short_code = payload.custom_code.strip()
        if not is_valid_custom_code(short_code):
            raise HTTPException(status_code=400, detail="Invalid custom short code")
        if short_code_exists(short_code):
            raise HTTPException(status_code=400, detail="Custom short code already exists")
    else:
        short_code = create_unique_short_code()

    with db_connection() as conn:
        try:
            cursor = conn.execute(
                """
                INSERT INTO urls (short_code, original_url)
                VALUES (?, ?)
                RETURNING short_code, original_url, created_at, click_count
                """,
                (short_code, original_url),
            )
            row = cursor.fetchone()
        except sqlite3.IntegrityError as exc:
            raise HTTPException(
                status_code=400,
                detail="Custom short code already exists",
            ) from exc

    return row_to_short_link(row, request)


@app.get("/api/links", response_model=LinkListResponse)
async def list_links(
    request: Request,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
) -> LinkListResponse:
    with db_connection() as conn:
        total = conn.execute("SELECT COUNT(*) AS total FROM urls").fetchone()["total"]
        rows = conn.execute(
            """
            SELECT short_code, original_url, created_at, click_count
            FROM urls
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        ).fetchall()

    return LinkListResponse(
        total=total,
        items=[row_to_short_link(row, request) for row in rows],
    )


@app.get("/api/analytics/{short_code}", response_model=AnalyticsResponse)
async def get_analytics(short_code: str) -> AnalyticsResponse:
    with db_connection() as conn:
        url_row = conn.execute(
            """
            SELECT id, short_code, original_url, created_at, is_active, click_count
            FROM urls
            WHERE short_code = ?
            """,
            (short_code,),
        ).fetchone()
        if url_row is None:
            raise HTTPException(status_code=404, detail="Short code not found")

        referrers = conn.execute(
            """
            SELECT COALESCE(NULLIF(TRIM(referrer), ''), 'Direct / None') AS source,
                   COUNT(*) AS count
            FROM click_logs
            WHERE url_id = ?
            GROUP BY source
            ORDER BY count DESC, source ASC
            """,
            (url_row["id"],),
        ).fetchall()
        recent_clicks = conn.execute(
            """
            SELECT clicked_at, ip_address, user_agent,
                   COALESCE(NULLIF(TRIM(referrer), ''), 'Direct / None') AS referrer
            FROM click_logs
            WHERE url_id = ?
            ORDER BY datetime(clicked_at) DESC, id DESC
            LIMIT 20
            """,
            (url_row["id"],),
        ).fetchall()
        last_clicked_at = conn.execute(
            """
            SELECT MAX(clicked_at) AS last_clicked_at
            FROM click_logs
            WHERE url_id = ?
            """,
            (url_row["id"],),
        ).fetchone()["last_clicked_at"]

    return AnalyticsResponse(
        short_code=url_row["short_code"],
        original_url=url_row["original_url"],
        created_at=url_row["created_at"],
        is_active=bool(url_row["is_active"]),
        total_clicks=url_row["click_count"],
        last_clicked_at=last_clicked_at,
        referrers=[
            {"source": row["source"], "count": row["count"]} for row in referrers
        ],
        recent_clicks=[
            {
                "clicked_at": row["clicked_at"],
                "ip_address": row["ip_address"],
                "user_agent": row["user_agent"],
                "referrer": row["referrer"],
            }
            for row in recent_clicks
        ],
    )


@app.get("/{short_code}", include_in_schema=False)
async def redirect_short_link(short_code: str, request: Request) -> RedirectResponse:
    with db_connection() as conn:
        url_row = conn.execute(
            """
            SELECT id, original_url
            FROM urls
            WHERE short_code = ? AND is_active = 1
            """,
            (short_code,),
        ).fetchone()
        if url_row is None:
            raise HTTPException(status_code=404, detail="Short code not found")

        conn.execute(
            """
            INSERT INTO click_logs (url_id, ip_address, user_agent, referrer)
            VALUES (?, ?, ?, ?)
            """,
            (
                url_row["id"],
                request.client.host if request.client else None,
                request.headers.get("user-agent"),
                normalize_referrer(request.headers.get("referer")),
            ),
        )
        conn.execute(
            "UPDATE urls SET click_count = click_count + 1 WHERE id = ?",
            (url_row["id"],),
        )

    return RedirectResponse(url=url_row["original_url"], status_code=307)
