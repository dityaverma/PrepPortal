# Authentication Module

Manages user registration, credential validation, role configuration, and signed JWT session token generation.

## Data & Request Flow

* **Incoming Requests**: Auth routes (`/api/auth/register`, `/api/auth/login`); Edge Middleware requesting token signature verification.
* **Outgoing Requests**: Database insertions creating users, roles, and default permissions.
