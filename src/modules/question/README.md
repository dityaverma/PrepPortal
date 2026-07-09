# modules/question

The question bank. Stores MCQ and theory questions with options, difficulty, type, company tags, and correct answers. Feeds the Test and Quiz Import modules.

**Incoming:** `/api/questions/*` routes (admin CRUD, bulk import); Test module selecting random question sets; Adaptive module querying weak-concept questions.
**Outgoing:** Transactional database writes for questions, options, and company mapping tables.
