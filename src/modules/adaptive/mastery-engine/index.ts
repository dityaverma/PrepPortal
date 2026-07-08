import { prisma } from "@/lib/prisma";

// query static questions from database for weak concepts
export class MasteryEngine {
  async getStaticMasteryQuiz(topicId: string, weakConcepts: string[]) {
    // fetch questions matching topic and having content matching weak concepts
    const questions = await prisma.question.findMany({
      where: {
        topicId,
      },
      include: {
        options: true,
      },
    });

    // filter questions based on weak concepts presence in question text or subtopic
    const filteredQuestions = questions.filter((q) => {
      return weakConcepts.some((concept) => 
        q.text.toLowerCase().includes(concept.toLowerCase())
      );
    });

    // fallback to any questions in topic if filtered list is too short
    const selectedQuestions = filteredQuestions.length >= 10
      ? filteredQuestions.slice(0, 10)
      : questions.slice(0, 10);

    return selectedQuestions.map((q) => ({
      id: q.id,
      question: q.text,
      options: q.options.map((opt) => opt.text),
      answer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty,
      concept: weakConcepts[0] || "general concept",
      pattern: "general pattern",
      questionType: q.questionType,
    }));
  }
}

export const masteryEngine = new MasteryEngine();
