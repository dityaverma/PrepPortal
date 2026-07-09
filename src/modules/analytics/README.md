# modules/analytics

Aggregates student performance data — attempt history, topic completion ratios, weak/strong topic lists, streaks, and company readiness scores. Also provides admin-level platform-wide metrics.

**Incoming:** `/api/analytics/*` routes; Test module after scoring (triggers analytics update).
**Outgoing:** Database queries on attempt logs, progress records, and roadmap states.
