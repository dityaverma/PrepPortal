# Analytics Module

Aggregates learning metrics, topic completion ratios, streaks, and failure hotspots.

## Data & Request Flow

* **Incoming Requests**: HTTP analytics routes (`/api/analytics`); the `Test` module after scoring an assessment.
* **Outgoing Requests**: Database queries fetching student attempts and progress summaries.
