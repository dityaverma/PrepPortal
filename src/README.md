# src Directory

Root source directory containing the global edge middleware gateway, app routing directory, shared utilities, and business modules.

## Data & Request Flow

* **Incoming Requests**: External HTTP clients calling platform endpoints targeting `/api/*` paths.
* **Outgoing Requests**: Downstream calls routed to module controllers and database clients.
