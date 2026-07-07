# Workspace Module

Acts as the multi-tenant isolation unit separating learning paths, progress percentages, active histories, and bookmarks.

## Data & Request Flow

* **Incoming Requests**: `/api/workspaces` route handlers; all learning engine services verifying resource ownership.
* **Outgoing Requests**: Database query mappings creating, copying, or archiving workspace containers.
