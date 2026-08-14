import secrets
import string
from urllib.parse import urlparse


BASE62_ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase
CUSTOM_CODE_ALPHABET = set(BASE62_ALPHABET + "-_")


def generate_short_code(length: int = 6) -> str:
    return "".join(secrets.choice(BASE62_ALPHABET) for _ in range(length))


def is_valid_url(url: str) -> bool:
    parsed = urlparse(url.strip())
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def normalize_referrer(referrer: str | None) -> str:
    return referrer.strip() if referrer and referrer.strip() else "Direct / None"


def is_valid_custom_code(code: str) -> bool:
    return 3 <= len(code) <= 64 and all(char in CUSTOM_CODE_ALPHABET for char in code)
