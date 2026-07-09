# src/common

Shared cross-cutting utilities. Provides the error class hierarchy, uniform JSON response builders, user context extractor, and query/pagination parser used across every module.

**Incoming:** Route handlers and service layers that throw errors or need user identity / pagination state.
**Outgoing:** Standardised HTTP JSON payloads back to the client.
