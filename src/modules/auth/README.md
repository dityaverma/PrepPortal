# modules/auth

Handles user registration, credential login, and JWT session issuance. Also manages logout and session-info endpoints.

**Incoming:** `/api/auth/*` routes and the Edge Middleware (for token verification).
**Outgoing:** Database writes for users/roles/permissions; signed JWT returned to the client.
