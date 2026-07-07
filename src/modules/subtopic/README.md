# Subtopic Module

Manages granular subtopic entities that students read and review.

## Data & Request Flow

* **Incoming Requests**: `/api/subtopics` route handlers; bookmark and studylink modules referencing subtopics.
* **Outgoing Requests**: Database operations mapping subtopics to their parent topics.
