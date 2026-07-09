# modules/quiz-import

Admin tool for bulk-importing quiz questions from uploaded documents (PDF, DOCX, XLSX, CSV, TXT, MD). Extracts raw text from the file, sends it to the FastAPI AI service for structured question parsing, validates the result, and batch-inserts into the question bank.

**Incoming:** `/api/admin/import/*` routes (upload → extract → preview → create-quiz → history).
**Outgoing:** FastAPI AI service (text-to-question extraction); batch database writes to the Question table.
