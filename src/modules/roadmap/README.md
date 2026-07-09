# modules/roadmap

Generates and maintains a student's personalised learning path. Every workspace gets a roadmap where topic nodes are LOCKED or UNLOCKED based on prerequisite completion. Nodes are updated by the Test and Adaptive modules after assessments.

**Incoming:** `/api/roadmaps/*` routes; Test module (pass/fail → unlock/lock); Adaptive module (recovery path mutations).
**Outgoing:** Database writes creating, sequencing, and updating roadmap nodes.
