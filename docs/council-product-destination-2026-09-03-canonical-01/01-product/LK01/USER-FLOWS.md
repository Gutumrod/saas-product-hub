# LK01 User Flows

Gate: Product Gate only  
Verdict carried from synthesis: **REMEDIATE**

## Primary Activation Flow

1. User signs up. Agreement: 3/3.
2. Tenant is created. Agreement: 3/3.
3. User creates first valid link. Agreement: 3/3.
4. User copies public branded link or QR. Agreement: 3/3.
5. First accepted tracked click occurs. Agreement: 3/3.
6. User sees the tracked click in analytics. Agreement: 3/3.

Activation is first valid link creation. First value is first tracked click visible in analytics. Agreement: 3/3.

## Create Link Flow

1. User enters destination.
2. System validates destination and unsafe input rules.
3. System creates tenant-scoped short link on the default domain.
4. System provides copyable link and QR.

Agreement that this is V1 core: 3/3.

## Redirect Flow

1. Visitor opens the public link or scans QR.
2. Redirect edge resolves hostname + slug.
3. If resolvable and safe, visitor is redirected.
4. Analytics event is emitted asynchronously/background.
5. Analytics, billing, and dashboard failure do not block the redirect.

Agreement that this is V1 core and hot-path-safe: 3/3.

## Destination Edit Flow

1. User edits a link destination.
2. System records versioned destination mutation.
3. System invalidates or bounds stale cache behavior.
4. Same public URL/QR routes to the new destination after propagation.

Agreement that this is product-defining: 3/3.

## Analytics Flow

1. System classifies redirect request into tracked click, bot-filtered event, quota-dropped event, or other defined state.
2. Attribution uses UTM source first, then normalized referrer, then Direct/None.
3. Dashboard shows totals, source breakdown, recent trend, and date range within plan retention/visibility.

Agreement that this is minimum useful analytics: 3/3.

## Quota Exhaustion Flow

1. Tenant reaches tracking quota.
2. Redirects continue for resolvable links.
3. New eligible analytics can be dropped or tracking paused until reset/upgrade.
4. UI must explain tracking status without implying links are broken.

Agreement: 3/3.

## Billing / Upgrade Flow

Billing is not a Product Gate implementation decision. The product rule is that entitlements must derive from verified provider truth through centralized billing-core, never browser success alone. Agreement: 3/3.

PromptPay must not launch without reconciliation. Agreement: 3/3.

## Deferred Flows

The following flows are deferred outside V1 core unless Owner changes scope:

- Custom domain setup. Agreement: 3/3.
- Campaign grouping/UTM builder. Agreement: 3/3.
- Export/API/webhooks. Agreement: 3/3.
- Team/member management. Agreement: 3/3.
