# modules/company

Manages the catalog of target preparation companies (e.g. Google, Amazon). Companies tag questions and configure workspace prep targets for test filtering.

**Incoming:** `/api/companies/*` routes; Workspace module verifying company IDs; Test module filtering questions by company.
**Outgoing:** Database writes managing company listings and their active status.
