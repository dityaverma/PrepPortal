# modules/subject

Top of the curriculum hierarchy (Subject → Topic → Subtopic). Manages subject catalog entries and enforces globally unique names.

**Incoming:** `/api/subjects/*` routes; Topic module verifying parent subject existence.
**Outgoing:** Database writes creating and updating subject records.
