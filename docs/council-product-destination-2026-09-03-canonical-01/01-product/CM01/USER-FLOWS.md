# CM01 User Flows

Gate verdict: REMEDIATE

## Buyer Flow

1. Frontend developer or agency buys/licenses the CM01 source package. Agreement: 3/3.
2. Buyer embeds the React UI into their own client project. Agreement: 3/3.
3. Buyer configures theme or locked branding using the documented theme contract. Agreement: 3/3.
4. Buyer uses the included localStorage repository for template/demo/local-first use, or later implements their own adapter against `TicketRepository`. Agreement: 3/3.
5. Buyer must be told that backend adapter, auth, tenancy, deployment, and multi-user sync are not included in V1. Agreement: 3/3.

## Case Officer Flow

1. Officer opens intake and creates a new case. Agreement: 3/3.
2. Officer searches by phone, name, or Ticket ID. Agreement: 3/3.
3. Phone numbers are normalized for matching. Agreement: 3/3.
4. Prior customer/case history is shown as notice only and does not autofill new intake data. Agreement: 3/3.
5. Officer opens ticket detail, records actions, changes status, closes, or reopens the case. Agreement: 3/3.
6. Officer views overdue status and filters cases without the system auto-changing status. Agreement: 3/3.
7. Officer uses history/retention tools to preview and manually delete eligible Closed tickets. Agreement: 3/3.

## Retention Flow

1. System previews Closed tickets older than the retention cutoff. Agreement: 3/3.
2. Active/non-Closed tickets are never deleted by retention cleanup. Agreement: 3/3.
3. Officer confirms destructive cleanup through a deliberate confirmation step. Agreement: 3/3.

## Non-Flows

- No sign-in flow. Agreement: 3/3.
- No admin/role management flow. Agreement: 3/3.
- No backend setup flow. Agreement: 3/3.
- No live deployment flow. Agreement: 3/3.
- No Module Hub integration flow. Agreement: 3/3.
