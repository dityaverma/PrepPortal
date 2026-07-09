# src

Root source directory. Contains the global edge middleware that authenticates every `/api/*` request before it reaches any module.

**Incoming:** External HTTP clients.
**Outgoing:** Forwarded (with injected auth headers) to route handlers, or rejected immediately with 401/403.
