# Topic Module

Manages learning topics and enforces rules preventing circular prerequisite cycles.

## Data & Request Flow

* **Incoming Requests**: `/api/topics` route handlers; `Subtopic` and `Question` modules linking to topics.
* **Outgoing Requests**: Database transactions updating topic entries and prerequisite association tables.
