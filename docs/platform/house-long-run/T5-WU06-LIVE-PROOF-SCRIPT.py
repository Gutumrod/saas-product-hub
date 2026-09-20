"""T5-WU06 live proof + recovery check — PREPARED, run only after WU05 deploy.

Read-only against production. Prints a compact PASS/FAIL table. Never prints a secret:
the checks assert presence/absence of behaviour, and the config checks use presence-only
indicators.
"""
import json
import ssl
import sys
import urllib.error
import urllib.request

TIMEOUT = 25
APEX = "wstera.com"
PLATFORM = "platform.wstera.com"


def head(url: str, follow: bool = False):
    """Return (status, headers, final_url) for a HEAD/GET without following redirects by default."""
    ctx = ssl.create_default_context()
    req = urllib.request.Request(url, method="GET", headers={"User-Agent": "hermes-wu06-smoke"})
    opener_args = {}
    if not follow:
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *a, **k):
                return None
        opener_args["handlers"] = [NoRedirect]
    opener = urllib.request.build_opener(*opener_args.get("handlers", [])) if opener_args else urllib.request.build_opener()
    try:
        with opener.open(req, timeout=TIMEOUT) as r:
            return r.status, dict(r.headers), r.geturl()
    except urllib.error.HTTPError as e:
        return e.code, dict(e.headers or {}), url
    except Exception as e:
        return None, {"error": f"{type(e).__name__}: {e}"}, url


def post_json(url: str, payload: dict, headers: dict | None = None):
    """POST JSON with a realistic User-Agent.

    A bare Python urllib UA is blocked at the Cloudflare edge (HTTP 403, `error code: 1010`),
    which would report an edge WAF block as if it were the application failing closed. Measured:
    the identical POST from curl / browser / Stripe-style UAs reaches the Worker and returns the
    application's own `401 {"error":"invalid signature"}`. The realistic UA is therefore required
    for this probe to be evidence about the APPLICATION rather than about the edge.
    """
    body = json.dumps(payload).encode()
    h = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) hermes-wu06-smoke",
    }
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=body, method="POST", headers=h)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            return r.status, r.read()[:400]
    except urllib.error.HTTPError as e:
        return e.code, (e.read() or b"")[:400]
    except Exception as e:
        return None, f"{type(e).__name__}: {e}".encode()


results = []

def check(name, ok, detail=""):
    results.append((name, "PASS" if ok else "FAIL", detail))

# 1. HTTPS reachability
s, h, _ = head(f"https://{APEX}/")
check("apex over HTTPS returns 200", s == 200, f"status={s}")
s2, h2, _ = head(f"https://{PLATFORM}/")
check("platform over HTTPS returns 200", s2 == 200, f"status={s2}")

# 2. HTTP -> HTTPS redirect (zone always_use_https)
s3, h3, loc = head(f"http://{APEX}/")
redirected = s3 in (301, 302, 307, 308)
check("http apex redirects to HTTPS", redirected, f"status={s3} location={h3.get('Location') or h3.get('location','')}")
s4, h4, _ = head(f"http://{PLATFORM}/")
check("http platform redirects to HTTPS", s4 in (301, 302, 307, 308), f"status={s4}")

# 3. security headers on the HTTPS responses
def hdr(hh, key):
    for k, v in hh.items():
        if k.lower() == key.lower():
            return v
    return None

for label, hh in (("apex", h), ("platform", h2)):
    check(f"HSTS present ({label})", bool(hdr(hh, "strict-transport-security")), str(hdr(hh, "strict-transport-security"))[:40])
    check(f"X-Content-Type-Options nosniff ({label})", hdr(hh, "x-content-type-options") == "nosniff")
    check(f"X-Frame-Options present ({label})", bool(hdr(hh, "x-frame-options")))
    check(f"CSP present ({label})", bool(hdr(hh, "content-security-policy")))

# 4. health
s5, _, _ = head(f"https://{PLATFORM}/health")
check("platform health endpoint 200", s5 == 200, f"status={s5}")

# 5. product-event webhook fail-closed when unsigned.
#    The assertion requires the APPLICATION's rejection, not an edge block: a Cloudflare
#    `error code: 1010` body means the request never reached the Worker and is not evidence.
s6, body6 = post_json(f"https://{PLATFORM}/api/webhooks/product-events", {"event": "product.installation.changed"})
app_level6 = s6 in (400, 401, 403) and b"error code: 1010" not in body6
check("unsigned product-event webhook rejected by the application", app_level6, f"status={s6} body={body6[:120]!r}")

# 6. agent-event webhook fail-closed when unsigned
s7, body7 = post_json(f"https://{PLATFORM}/api/webhooks/agent-events", {"event": "agent.activity"})
app_level7 = s7 in (400, 401, 403) and b"error code: 1010" not in body7
check("unsigned agent-event webhook rejected by the application", app_level7, f"status={s7} body={body7[:120]!r}")

# 7. Billing Core read path should be unconfigured/inert BEFORE activation.
#    It is a tRPC route, so probe it unauthenticated: a 4xx is expected either way; we record
#    the shape rather than asserting success (activation is a separate WU05 stage step).
s8, h8, _ = head(f"https://{PLATFORM}/api/trpc/controlPlane.billingCoreSnapshot.get")
check("billing read route does not 500 (fails closed)", s8 is not None and s8 < 500, f"status={s8}")

print(f"{'CHECK':<58} {'RESULT':<6} DETAIL")
print("-" * 110)
for n, r, d in results:
    print(f"{n:<58} {r:<6} {d}")

fails = [n for n, r, _ in results if r == "FAIL"]
print()
print(f"TOTAL {len(results)}  PASS {len(results)-len(fails)}  FAIL {len(fails)}")
if fails:
    print("FAILED:", ", ".join(fails))
    sys.exit(1)
print("ALL LIVE PROOF CHECKS PASS")
