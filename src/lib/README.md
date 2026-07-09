# src/lib

Singleton adapter layer. Holds the Prisma client (PostgreSQL), the FastAPI AI client, and in-memory mocks for Redis and BullMQ that can be swapped for real services in production.

**Incoming:** Repository classes and service layers requesting database or AI operations.
**Outgoing:** SQL commands to PostgreSQL (Supabase) and HTTP calls to the external FastAPI AI service.
