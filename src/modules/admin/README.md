# modules/admin

Admin-only coordination layer exposing platform health stats (user count, active workspaces, question totals) and gating access to admin-restricted features.

**Incoming:** `/api/admin/*` routes (double-gated: Edge Middleware + enforceRole).
**Outgoing:** Aggregate database queries; delegates to Admin Import sub-routes.
