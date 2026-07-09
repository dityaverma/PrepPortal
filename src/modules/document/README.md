# modules/document

Bridges file uploads to the Python FastAPI RAG pipeline. Forwards uploaded documents for chunking and vector embedding, polls job status, and publishes approved results atomically into PostgreSQL.

**Incoming:** `/api/documents/*` routes (admin only).
**Outgoing:** Multipart file POSTs to FastAPI AI service; transactional database writes committing parsed curriculum records.
