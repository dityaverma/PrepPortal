# MAP_01_BACKEND_FOUNDATION.md

# MASTER ARCHITECTURE PROMPT (MAP 01)

## Role

You are a Principal Software Engineer, Software Architect, Database Architect and Staff Backend Engineer.

Your objective is to build the backend foundation of a production-grade AI-powered Adaptive Placement Platform.

Do NOT build the frontend.

Do NOT use placeholder implementations.

If the context window becomes insufficient, stop after completing the current module and preserve architecture.

---

# Technology Stack

- Next.js 16 (App Router)
- TypeScript (strict)
- Prisma ORM
- PostgreSQL
- Auth.js
- Redis (prepare interfaces only)
- BullMQ (prepare interfaces only)
- Zod
- React Server Actions + Route Handlers

---

# Coding Rules

- Never use `any`
- Feature-first modular architecture
- Repository Pattern
- Service Layer
- Zod validation
- SOLID principles
- UUID primary keys
- Soft delete where appropriate
- Business logic NEVER inside route handlers
- Reusable utilities only

---

# Folder Structure

src/
  modules/
    auth/
    workspace/
    company/
    subject/
    topic/
    subtopic/
    roadmap/
    question/
    test/
    analytics/
    admin/
  lib/
  database/
  common/
  types/

Every module should contain:

- controller
- service
- repository
- dto
- validators
- types
- constants

---

# Authentication

Implement:

- Register
- Login
- Logout
- Session
- Protected APIs
- Role Based Access Control

Roles:

- Student
- Admin
- Super Admin

Passwords must be hashed.

---

# Multi Workspace System

A user can create unlimited workspaces.

Each workspace represents one preparation journey.

Workspace stores:

- name
- target role
- selected companies
- independent roadmap
- independent progress
- independent analytics
- independent recovery history
- independent bookmarks

Operations:

- create
- rename
- archive
- restore
- delete
- duplicate
- switch

No AI during workspace creation.

---

# Database

Design a normalized Prisma schema.

Core entities:

Users
Roles
Permissions
Workspaces
Companies
Subjects
Topics
Subtopics
StudyLinks
Roadmaps
RoadmapNodes
Questions
QuestionOptions
QuestionTags
CompanyQuestionMapping
Tests
TestQuestions
Attempts
Progress
Bookmarks
Analytics
Notifications
AuditLogs

Generate:

- relations
- indexes
- foreign keys
- migrations

---

# Subject Hierarchy

Subject

-> Topic

-> Subtopic

-> Assessment Node

Prepare roadmap for future dynamic insertion.

Do NOT implement AI.

---

# Company Module

CRUD

Support:

- logo
- theme color
- description
- active status

---

# Question Engine (Foundation)

Question Types:

- Theory
- Scenario
- Debug
- Output Prediction
- Interview
- Diagram
- Ordering
- Matching

Each question stores:

- subject
- topic
- subtopic
- explanation
- options
- correct answer
- difficulty
- companies
- study reference

---

# Study Links

Each subtopic contains:

- description
- learning objectives
- estimated time
- prerequisites
- GeeksforGeeks URL
- Official documentation URL
- Additional resources

Managed manually by Admin.

---

# Test Engine (Foundation)

Generate tests ONLY from database.

Workflow:

Topic
→ Fetch Questions
→ Submit
→ Evaluate
→ Store Attempt

Passing score = 75%.

No recovery generation.

---

# Admin Backend

Admin manually manages:

- subjects
- topics
- subtopics
- study links
- companies
- roadmaps
- questions

NO AI CALLS.

---

# REST APIs

Create REST endpoints for:

/auth
/workspaces
/companies
/subjects
/topics
/subtopics
/studylinks
/roadmaps
/questions
/tests
/analytics
/admin

Support:

- pagination
- filtering
- searching
- sorting

---

# Error Handling

Implement:

- global error handler
- validation errors
- authentication errors
- database errors
- standardized API response

---

# AI Preparation

Do NOT integrate Gemini yet.

Create only:

- AIProvider interface
- PromptBuilder interface
- RecoveryService interface

These remain unimplemented until MAP 03.

---

# Deliverable

Generate as much backend code as possible while preserving architecture.

Implementation order:

1. Project setup
2. Folder structure
3. Prisma schema
4. Authentication
5. Workspace module
6. Company module
7. Subject module
8. Topic module
9. Subtopic module
10. Study links
11. Roadmap foundation
12. Question foundation
13. Test foundation
14. Analytics foundation
15. Admin foundation

Stop cleanly if context ends.
