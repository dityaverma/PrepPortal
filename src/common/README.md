# Common Utilities Module

Provides shared operational features including unified error interceptors, API responses formatting, authentication parsing helper, and pagination query utilities.

## Data & Request Flow

* **Incoming Requests**: Next.js route handlers requiring user details or parsing query search/limit parameters; controllers and services throwing custom operational exceptions.
* **Outgoing Requests**: Standardized HTTP JSON payloads returned back to the client browser.
