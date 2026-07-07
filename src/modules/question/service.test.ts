import { QuestionService } from "./service";
import { NotFoundError } from "@/common/errors";

describe("QuestionService", () => {
  let questionService: QuestionService;
  let mockQuestionRepository: any;

  beforeEach(() => {
    mockQuestionRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      bulkImport: jest.fn(),
    };
    questionService = new QuestionService(mockQuestionRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if question does not exist", async () => {
      mockQuestionRepository.findById.mockResolvedValue(null);

      // verify that not found error is thrown for missing question
      await expect(questionService.getById("q-1")).rejects.toThrow(NotFoundError);
    });

    it("should return question if found", async () => {
      mockQuestionRepository.findById.mockResolvedValue({ id: "q-1", text: "what is binary search" });

      // verify successful retrieval
      const result = await questionService.getById("q-1");
      expect(result.text).toBe("what is binary search");
    });
  });

  describe("delete", () => {
    it("should delete successfully if question exists", async () => {
      mockQuestionRepository.findById.mockResolvedValue({ id: "q-1" });
      mockQuestionRepository.delete.mockResolvedValue({ id: "q-1" });

      // verify deletion workflow
      const result = await questionService.delete("q-1");
      expect(result.deleted).toBe(true);
      expect(mockQuestionRepository.delete).toHaveBeenCalledWith("q-1");
    });
  });
});
