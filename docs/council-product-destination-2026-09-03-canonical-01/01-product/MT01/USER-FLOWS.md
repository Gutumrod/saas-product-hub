# MT01 User Flows

## Flow 1: Technical buyer receives and inspects source

1. Buyer receives a versioned source archive or repository access.
2. Buyer reads root README and product scope.
3. Buyer confirms that V1 includes seven modules: `tenant-context`, `auth-supabase`, `ai-provider`, `payment`, `subscription`, `enterprise-features`, and `webhook-receiver`.
4. Buyer confirms that persistence is demo/mock/in-memory only and production persistence is buyer-owned.
5. Buyer confirms that tracing is demo/in-process only and no OpenTelemetry/distributed tracing is included in V1.

Acceptance: buyer can understand what is included before running code.

## Flow 2: Clean install and demo run

1. Buyer installs dependencies from shipped instructions.
2. Buyer copies `.env.example` to a local env file.
3. Buyer leaves production credentials absent or uses their own test credentials.
4. Buyer runs typecheck/tests.
5. Buyer starts the reference server.
6. Buyer reaches health/demo routes without private seller workspace secrets.

Acceptance: clean install succeeds from shipped materials only. This remains a Pre-Build/packaging proof, not a Product Gate blocker after scope is locked.

## Flow 3: Evaluate backend composition

1. Buyer follows the reference server wiring.
2. Buyer reviews tenant/auth middleware flow.
3. Buyer reviews AI provider demo behavior.
4. Buyer reviews subscription/payment/webhook reference flow.
5. Buyer identifies which mock/in-memory adapters must be replaced for production.
6. Buyer identifies which in-process tracing examples must be replaced if production observability is required.

Acceptance: buyer can see the architecture path and extension points without mistaking the server for production.

## Flow 4: Buyer production adaptation

1. Buyer replaces in-memory repositories with production persistence.
2. Buyer wires own Supabase/auth provider.
3. Buyer configures own AI provider credentials.
4. Buyer configures own Stripe webhook endpoint and signing secret.
5. Buyer adds deployment, monitoring, frontend, and production idempotency as required by their product.

Acceptance: this flow is documented as buyer-owned work, not included V1 delivery.
