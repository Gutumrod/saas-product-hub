import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def client(tmp_path, monkeypatch):
    db_path = tmp_path / "shortener-test.db"
    monkeypatch.setenv("SHORTENER_DB_PATH", str(db_path))

    from app.database import init_db
    from app.main import app

    init_db()
    with TestClient(app) as test_client:
        yield test_client


def test_create_short_link(client):
    response = client.post(
        "/api/shorten",
        json={"url": "https://example.com/articles/test", "custom_code": "test-link"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["short_code"] == "test-link"
    assert data["short_url"].endswith("/test-link")
    assert data["original_url"] == "https://example.com/articles/test"
    assert data["click_count"] == 0


def test_redirect_short_link(client):
    client.post(
        "/api/shorten",
        json={"url": "https://example.com/redirect-target", "custom_code": "go-here"},
    )

    response = client.get("/go-here", follow_redirects=False)

    assert response.status_code == 307
    assert response.headers["location"] == "https://example.com/redirect-target"


def test_analytics_increment(client):
    client.post(
        "/api/shorten",
        json={"url": "https://example.com/analytics", "custom_code": "stats"},
    )

    before = client.get("/api/analytics/stats").json()
    assert before["total_clicks"] == 0

    redirect_response = client.get(
        "/stats",
        headers={"referer": "https://ref.example/", "user-agent": "pytest"},
        follow_redirects=False,
    )
    assert redirect_response.status_code == 307

    after = client.get("/api/analytics/stats").json()
    assert after["total_clicks"] == 1
    assert after["last_clicked_at"] is not None
    assert after["referrers"] == [{"source": "https://ref.example/", "count": 1}]
    assert after["recent_clicks"][0]["user_agent"] == "pytest"


def test_invalid_url(client):
    response = client.post("/api/shorten", json={"url": "not-a-url"})

    assert response.status_code == 400
    assert response.json()["detail"] == "Invalid URL format"


def test_not_found(client):
    response = client.get("/nonexistent", follow_redirects=False)

    assert response.status_code == 404
    assert response.json()["detail"] == "Short code not found"


def test_list_links(client):
    client.post(
        "/api/shorten",
        json={"url": "https://example.com/list", "custom_code": "listed"},
    )

    response = client.get("/api/links")

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["short_code"] == "listed"
