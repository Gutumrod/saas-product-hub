from pydantic import BaseModel, Field


class ShortenRequest(BaseModel):
    url: str = Field(..., min_length=1)
    custom_code: str | None = Field(default=None, min_length=3, max_length=64)


class ShortLinkResponse(BaseModel):
    short_code: str
    short_url: str
    original_url: str
    created_at: str
    click_count: int


class LinkListResponse(BaseModel):
    total: int
    items: list[ShortLinkResponse]


class ReferrerStat(BaseModel):
    source: str
    count: int


class RecentClick(BaseModel):
    clicked_at: str
    ip_address: str | None
    user_agent: str | None
    referrer: str


class AnalyticsResponse(BaseModel):
    short_code: str
    original_url: str
    created_at: str
    is_active: bool
    total_clicks: int
    last_clicked_at: str | None
    referrers: list[ReferrerStat]
    recent_clicks: list[RecentClick]
