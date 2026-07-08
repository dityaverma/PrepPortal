import { SubtopicService } from "./service";
import { NotFoundError, ValidationError } from "@/common/errors";

describe("SubtopicService", () => {
  let subtopicService: SubtopicService;
  let mockSubtopicRepository: any;

  beforeEach(() => {
    mockSubtopicRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findByNameInTopic: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    subtopicService = new SubtopicService(mockSubtopicRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if subtopic does not exist", async () => {
      mockSubtopicRepository.findById.mockResolvedValue(null);

      // verify that not found error is thrown for missing subtopic
      await expect(subtopicService.getById("st-1")).rejects.toThrow(NotFoundError);
    });

    it("should return subtopic if found", async () => {
      mockSubtopicRepository.findById.mockResolvedValue({ id: "st-1", name: "Arrays" });

      // verify successful retrieval
      const result = await subtopicService.getById("st-1");
      expect(result.name).toBe("Arrays");
    });
  });

  describe("create", () => {
    it("should throw ValidationError if subtopic name already exists in topic", async () => {
      mockSubtopicRepository.findByNameInTopic.mockResolvedValue({ id: "st-1", name: "Arrays" });

      // verify that duplicate subtopic names throw validation error
      await expect(
        subtopicService.create({ name: "Arrays", topicId: "topic-1" })
      ).rejects.toThrow(ValidationError);
    });
  });
});
