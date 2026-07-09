# modules/bookmark

Lets students save questions and subtopics for later review within their workspace.

**Incoming:** `/api/bookmarks/*` routes.
**Outgoing:** Database writes scoped to the user's active workspace; Workspace repository verifies ownership before any mutation.
