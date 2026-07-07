# Library Clients Module

Configures singleton clients, third-party adapters, and local development system mocks (Redis, BullMQ).

## Data & Request Flow

* **Incoming Requests**: Database repositories initiating database operations; chatbot and document services calling AI operations.
* **Outgoing Requests**: SQL commands executed on the PostgreSQL (Supabase) Database; HTTP requests forwarded to the external FastAPI AI Service.
