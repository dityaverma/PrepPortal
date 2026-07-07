# Company Module

Manages the catalog of target preparation companies used to map question sheets.

## Data & Request Flow

* **Incoming Requests**: `/api/companies` HTTP route handlers; `Workspace` module verifying target preparation companies.
* **Outgoing Requests**: Database query modifications to update active target company listings.
