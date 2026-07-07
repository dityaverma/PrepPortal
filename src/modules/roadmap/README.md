# Roadmap Module

Generates and handles topic unlocking/locking pathways scoped to student workspaces.

## Data & Request Flow

* **Incoming Requests**: `/api/roadmaps` route handlers; `Test` module completing assessments and triggering prerequisite unlocks.
* **Outgoing Requests**: Database queries to fetch, update, and sequence workspace roadmap nodes.
