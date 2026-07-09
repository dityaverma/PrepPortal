# modules/test

Core assessment engine. Generates randomised tests filtered by topic, difficulty, and company. Evaluates submissions, scores answers, logs attempts, and triggers roadmap node unlock/failure.

**Incoming:** `/api/tests/*` routes.
**Outgoing:** Calls Roadmap module to update node lock states; calls Analytics module to update progress metrics; commits attempt records to the database.
