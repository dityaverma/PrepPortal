# modules/adaptive

AI-powered adaptive learning engine. When a student scores below 75% on an assessment, this module analyses their wrong answers to identify weak concepts, selects a recovery strategy (retry, concept review, or AI-generated remediation), and mutates the roadmap to insert recovery steps.

Sub-engines:
- **adaptive-engine** — main orchestrator coordinating the full pipeline
- **weakness-engine** — identifies concept gaps from wrong question metadata
- **retry-engine** — decides recovery action (RETRY / REVIEW / AI_RECOVERY)
- **recovery-engine** — builds targeted recovery quiz from weak concepts
- **mastery-engine** — marks concepts mastered when student passes
- **roadmap-engine** — inserts and removes recovery nodes in the workspace roadmap
- **ai-provider** — wraps FastAPI AI calls for AI-generated recovery content
- **prompt-builder** — constructs structured prompts for the AI service
- **cache** — caches roadmap state to avoid redundant DB reads
- **workers** — background async tasks for non-blocking pipeline steps

**Incoming:** `/api/adaptive/*` routes (triggered after test submission).
**Outgoing:** Roadmap module (node mutations); FastAPI AI service (recovery content); database writes for weak concept tracking.
