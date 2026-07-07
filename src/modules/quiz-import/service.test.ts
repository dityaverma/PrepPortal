import { quizImportService } from "./service";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    question: { findFirst: jest.fn() },
    quiz: { create: jest.fn() },
    quizQuestion: { create: jest.fn() },
    importHistory: { create: jest.fn() },
    $transaction: jest.fn((cb) => cb(prisma)),
  },
}));

describe("QuizImportService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("extractTextFromFile", () => {
    it("should extract text from txt files successfully", async () => {
      const buffer = Buffer.from("sample questions text content");
      const text = await quizImportService.extractTextFromFile(buffer, "test.txt");
      
      // assert output matches buffer content
      expect(text).toBe("sample questions text content");
    });
  });

  describe("checkDuplicate", () => {
    it("should return false if no matching question is found", async () => {
      (prisma.question.findFirst as jest.Mock).mockResolvedValue(null);

      const isDuplicate = await quizImportService.checkDuplicate({
        question: "what is scheduling",
        options: ["a", "b", "c", "d"],
        correctAnswer: "a",
        questionType: "Theory",
        difficulty: "Medium",
        explanation: "",
      });

      // assert it is recognized as new
      expect(isDuplicate).toBe(false);
    });
  });

  describe("compileReport", () => {
    it("should tag duplicate questions as isDuplicate true", async () => {
      (prisma.question.findFirst as jest.Mock).mockResolvedValue({
        id: "existing-1",
        options: [{ text: "a" }, { text: "b" }, { text: "c" }, { text: "d" }],
      });

      const report = await quizImportService.compileReport([
        {
          question: "what is scheduling",
          options: ["a", "b", "c", "d"],
          correctAnswer: "a",
          questionType: "Theory",
          difficulty: "Medium",
          explanation: "",
        },
      ]);

      // verify that report marks question duplicate
      expect(report.hasDuplicates).toBe(true);
      expect(report.questions[0].isDuplicate).toBe(true);
    });
  });
});
