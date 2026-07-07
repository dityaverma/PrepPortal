# Bookmark Module

Manages user bookmarks on specific questions and subtopics for review.

## Data & Request Flow

* **Incoming Requests**: Bookmark CRUD endpoints (`/api/bookmarks`).
* **Outgoing Requests**: Database queries validating active workspace ownership and storing/deleting bookmark links.
