# Test Module

Generates mock assessments, evaluates choices case-insensitively, and handles student attempt logs.

## Data & Request Flow

* **Incoming Requests**: Test generation and submission endpoints (`/api/tests`).
* **Outgoing Requests**: Calls `Roadmap` module to update node locks based on pass/fail status; updates cached progress/attempts inside `Analytics` module; commits attempt records to database.
