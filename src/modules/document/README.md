# Document Module

Handles file uploads, parser jobs, and ingestion of curriculum documents into relational tables and vector stores.

## Data & Request Flow

* **Incoming Requests**: Ingestion endpoints (`/api/documents/ingest` and `/publish`).
* **Outgoing Requests**: Files and schema formats forwarded to the external FastAPI AI Service; database transactions committing published curriculum records.
