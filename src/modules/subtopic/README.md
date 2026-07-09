# modules/subtopic

Leaf nodes of the curriculum tree. Manages granular study units that students read before taking assessments. Enforces name uniqueness per parent topic.

**Incoming:** `/api/subtopics/*` routes; Bookmark and StudyLink modules referencing subtopic IDs.
**Outgoing:** Database writes mapping subtopics to their parent topics.
