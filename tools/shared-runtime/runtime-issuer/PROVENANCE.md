# Reuse provenance

| Source | Version / commit | Copied on | Destination | Local changes |
|---|---|---|---|---|
| `modules/rate-limit` | `0.1.0` / `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37` | 2026-09-28 | `vendor/module-hub/rate-limit/core` | `.js` source extensions changed to `.ts` for Worker bundling; core logic unchanged. The memory adapter is copied as reference only and never selected in production. |
| `modules/audit-log` | `0.1.0` / `f9dee01ecb797baa634e0e2a6a1498fdfdd8df37` | 2026-09-28 | `vendor/module-hub/audit-log/core` | Internal extensionless imports changed to `.ts` for Worker bundling; core logic unchanged. Host adapter writes only timestamp/product/result/reason. |

The canonical `modules-hub` checkout was not edited. The Postgres rate-limit adapter is destination-owned and implements the module's atomic `RateLimitStore.consume` contract with one database function call.
