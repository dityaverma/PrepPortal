# modules/workspace

The multi-tenant isolation unit. Every student's progress, roadmap, bookmarks, and study history is scoped to a workspace. Supports create, rename, archive, restore, duplicate, and switch operations.

**Incoming:** `/api/workspaces/*` routes; all other modules verify workspace ownership through this module's repository.
**Outgoing:** Database queries creating and managing workspace containers and their child data.
