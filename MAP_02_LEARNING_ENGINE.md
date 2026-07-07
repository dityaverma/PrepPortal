# MAP_02_LEARNING_ENGINE.md

# MASTER ARCHITECTURE PROMPT (MAP 02)

## Objective

Continue the project from MAP 01.

Do NOT regenerate completed modules.

Implement the complete Learning Engine, Admin CMS backend, Progress Engine, and Analytics backend.

Maintain the existing architecture and coding standards.

---

# Core Goal

Build the complete learning workflow using ONLY static database content.

NO AI generation in this MAP.

AI integration comes in MAP 03.

---

# Learning Flow

Workspace
→ Subject
→ Topic
→ Subtopic
→ Study Page
→ Static Assessment
→ Evaluate
→ Progress Update
→ Unlock Next Topic

Passing score = 75%.

Do NOT implement recovery generation.

---

# Roadmap Engine

Implement:

- Static roadmap loader
- Ordered roadmap nodes
- Topic prerequisites
- Topic locking/unlocking
- Completion tracking
- Roadmap progress calculation

Prepare support for future dynamic nodes.

---

# Progress Engine

Track per workspace:

- Current subject
- Current topic
- Completed topics
- Completed subtopics
- Completion percentage
- Attempts
- Last activity
- Mastery score placeholder

Everything must be workspace scoped.

---

# Question Engine

Complete implementation.

Support:

- CRUD
- Bulk import interface
- Pagination
- Filtering
- Searching
- Company filtering
- Difficulty filtering
- Question type filtering

Question Types

- Theory
- Scenario
- Debug
- Output Prediction
- Interview
- Ordering
- Matching
- Diagram

---

# Company Mapping

One question can belong to many companies.

Examples

Google

Amazon

Microsoft

Uber

Atlassian

Implement many-to-many mapping.

When generating a test:

Filter by

Workspace Companies

Subject

Topic

Difficulty

Question Type

---

# Test Engine

Implement

Create Test

Random Question Selection

Question Ordering

Timer support

Submit Test

Evaluate

Store Attempts

Result Summary

Weak Topic Detection (placeholder only)

Business Rules

>=75%

Unlock next roadmap node

<75%

Mark topic as failed

Prepare for AI recovery

No AI generation yet.

---

# Unlock Engine

Unlock only next roadmap node.

Do not unlock future topics.

Respect prerequisites.

Support nested roadmap hierarchy.

---

# Analytics Engine

Student Analytics

- Total progress
- Subject progress
- Topic progress
- Attempts
- Average score
- Weak topics
- Strong topics
- Study streak placeholder
- Company readiness placeholder

Admin Analytics

- Users
- Active workspaces
- Total questions
- Question distribution
- Subject distribution
- Topic completion
- Most failed topics

Backend only.

---

# Bookmark Module

Implement

Add Bookmark

Remove Bookmark

List Bookmarks

Workspace scoped.

---

# Study History

Store

Study start

Study end

Duration

Visited topics

Recent activity

---

# Admin CMS Backend

Complete backend only.

Modules

Subjects

Topics

Subtopics

Roadmaps

Companies

Study Links

Questions

Question Tags

Question Options

Admin manually manages all content.

No AI.

---

# Validation

Validate every endpoint with Zod.

Proper HTTP status codes.

Consistent API responses.

---

# Documentation

Generate

REST API documentation

Folder updates

README updates

Database updates

---

# Deliverable

Backend should fully support

✔ Learning workflow

✔ Static roadmap

✔ Static assessments

✔ Progress tracking

✔ Analytics

✔ Admin CMS backend

Do NOT implement Gemini.

Do NOT implement Redis caching.

Do NOT implement BullMQ.

Stop cleanly if context ends.
