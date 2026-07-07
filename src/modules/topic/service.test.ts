import { TopicService } from "./service";
import { NotFoundError, ValidationError } from "@/common/errors";

describe("TopicService", () => {
  let topicService: TopicService;
  let mockTopicRepository: any;

  beforeEach(() => {
    mockTopicRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findByNameInSubject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    topicService = new TopicService(mockTopicRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if topic does not exist", async () => {
      mockTopicRepository.findById.mockResolvedValue(null);

      // verify that not found error is thrown for missing topic
      await expect(topicService.getById("t-1")).rejects.toThrow(NotFoundError);
    });

    it("should return topic if found", async () => {
      mockTopicRepository.findById.mockResolvedValue({ id: "t-1", name: "Recursion" });

      // verify successful retrieval
      const result = await topicService.getById("t-1");
      expect(result.name).toBe("Recursion");
    });
  });

  describe("update", () => {
    it("should throw ValidationError if topic is set as its own prerequisite", async () => {
      mockTopicRepository.findById.mockResolvedValue({ id: "t-1", name: "Recursion" });

      // verify that self prerequisite assignment throws validation error
      await expect(
        topicService.update("t-1", { prerequisiteIds: ["t-1"] })
      ).rejects.toThrow(ValidationError);
    });
  });
});
