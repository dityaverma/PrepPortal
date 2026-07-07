import { adaptiveEngine } from "./adaptive-engine";
import { RecoveryAction } from "./retry-engine";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    weakConcept: { upsert: jest.fn() },
    weakPattern: { upsert: jest.fn() },
    recoveryQuiz: { count: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
    recoveryAttempt: { create: jest.fn() },
    recommendationHistory: { create: jest.fn() },
    conceptMastery: { upsert: jest.fn(), findMany: jest.fn() },
    roadmapMutation: { findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
    roadmap: { findFirst: jest.fn() },
    question: { findMany: jest.fn() },
  },
}));

describe("AdaptiveEngine", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("analyzeAssessmentAttempt", () => {
    it("should bypass engine and clear mutations if score is seventy five or above", async () => {
      // mock roadmap updates
      (prisma.roadmapMutation.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prisma.roadmapMutation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.roadmap.findFirst as jest.Mock).mockResolvedValue({ id: "roadmap-1", nodes: [] });

      const result = await adaptiveEngine.analyzeAssessmentAttempt({
        userId: "user-1",
        workspaceId: "ws-1",
        role: "Software Engineer",
        selectedCompanies: ["Google"],
        subject: "Algorithms",
        subjectId: "sub-1",
        topic: "Recursion",
        topicId: "topic-1",
        score: 80,
        wrongQuestionIds: [],
        questionMetadata: [],
      });

      // assert attempt bypasses ai quiz generation
      expect(result.passed).toBe(true);
      expect(result.action).toBe("NONE");
      expect(prisma.roadmapMutation.updateMany).toHaveBeenCalled();
    });

    it("should trigger recovery quiz generation on first failure", async () => {
      // mock retry engine to return first attempt recovery quiz action
      (prisma.recoveryQuiz.count as jest.Mock).mockResolvedValue(0);
      (prisma.recommendationHistory.create as jest.Mock).mockResolvedValue({});
      (prisma.roadmap.findFirst as jest.Mock).mockResolvedValue({
        id: "roadmap-1",
        nodes: [{ id: "n-1", topicId: "topic-1", sequenceOrder: 1 }],
      });
      (prisma.roadmapMutation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.roadmapMutation.create as jest.Mock).mockResolvedValue({});
      (prisma.recoveryQuiz.create as jest.Mock).mockResolvedValue({
        id: "quiz-1",
        questions: [],
      });

      const result = await adaptiveEngine.analyzeAssessmentAttempt({
        userId: "user-1",
        workspaceId: "ws-1",
        role: "Software Engineer",
        selectedCompanies: ["Google"],
        subject: "Algorithms",
        subjectId: "sub-1",
        topic: "Recursion",
        topicId: "topic-1",
        score: 50,
        wrongQuestionIds: ["q-1"],
        questionMetadata: [
          {
            id: "q-1",
            concept: "Base Case",
            pattern: "Iteration to Recursion",
            questionType: "Theory",
            difficulty: "MEDIUM",
          },
        ],
      });

      // verify that attempt triggers recovery quiz recommendations
      expect(result.passed).toBe(false);
      expect(result.action).toBe(RecoveryAction.RECOVERY_QUIZ);
      expect(result.roadmap).toBeDefined();
    });

    it("should trigger mastery mode on third failure", async () => {
      // mock retry engine to simulate third failure
      (prisma.recoveryQuiz.count as jest.Mock).mockResolvedValue(2);
      (prisma.recommendationHistory.create as jest.Mock).mockResolvedValue({});
      (prisma.roadmap.findFirst as jest.Mock).mockResolvedValue({
        id: "roadmap-1",
        nodes: [{ id: "n-1", topicId: "topic-1", sequenceOrder: 1 }],
      });
      (prisma.roadmapMutation.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.roadmapMutation.create as jest.Mock).mockResolvedValue({});
      (prisma.question.findMany as jest.Mock).mockResolvedValue([
        {
          id: "static-q-1",
          text: "base case description question",
          correctAnswer: "a",
          explanation: "explanation",
          difficulty: "MEDIUM",
          questionType: "Theory",
          options: [{ text: "a" }, { text: "b" }],
        },
      ]);

      const result = await adaptiveEngine.analyzeAssessmentAttempt({
        userId: "user-1",
        workspaceId: "ws-1",
        role: "Software Engineer",
        selectedCompanies: ["Google"],
        subject: "Algorithms",
        subjectId: "sub-1",
        topic: "Recursion",
        topicId: "topic-1",
        score: 40,
        wrongQuestionIds: ["q-1"],
        questionMetadata: [
          {
            id: "q-1",
            concept: "Base Case",
            pattern: "Iteration to Recursion",
            questionType: "Theory",
            difficulty: "MEDIUM",
          },
        ],
      });

      // verify that third attempt switches action to mastery mode
      expect(result.passed).toBe(false);
      expect(result.action).toBe(RecoveryAction.MASTERY_MODE);
      expect(result.quiz.isMastery).toBe(true);
    });
  });
});
