# Question Module

Manages the assessment questions pool, options data, and mapping to target preparation companies.

## Data & Request Flow

* **Incoming Requests**: `/api/questions` route handlers; `Test` module selecting random question sets.
* **Outgoing Requests**: Database operations committing, updating, or deleting question options and company mappings.
