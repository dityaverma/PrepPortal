# modules/topic

Mid-level curriculum layer. Manages topics within a subject, enforces name uniqueness per subject, and handles prerequisite graph links (preventing circular dependencies).

**Incoming:** `/api/topics/*` routes; Subtopic and Question modules verifying parent topic; Roadmap module initialising node trees.
**Outgoing:** Transactional database writes for topics and prerequisite association tables.
