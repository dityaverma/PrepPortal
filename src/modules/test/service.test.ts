import { TestService } from "./service";
import { workspaceRepository } from "../workspace/repository";
import { NotFoundError, ValidationError } from "@/common/errors";

jest.mock("../workspace/repository", () => ({
  workspaceRepository: {
    findById: jest.fn(),
  },
}));

describe("TestService", () => {
  let testService: TestService;
  let mockTestRepository: any;

  beforeEach(() => {
    mockTestRepository = {
      findById: jest.fn(),
      findQuestions: jest.fn(),
      createTestWithQuestions: jest.fn(),
      runTransaction: jest.fn(),
    };
    testService = new TestService(mockTestRepository);
    jest.clearAllMocks();
  });

  describe("createTest", () => {
    it("should throw NotFoundError if workspace does not exist or unauthorized", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        testService.createTest("user-1", {
          workspaceId: "ws-1",
          topicId: "topic-1",
          limit: 10,
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if no questions exist for the filters", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1", companies: [] });
      mockTestRepository.findQuestions.mockResolvedValue([]);

      await expect(
        testService.createTest("user-1", {
          workspaceId: "ws-1",
          topicId: "topic-1",
          limit: 10,
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should create and return the mock test with sliced limit", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1", companies: [] });
      const questionsMock = Array.from({ length: 15 }, (_, i) => ({ id: `q-${i}`, text: `Q ${i}` }));
      mockTestRepository.findQuestions.mockResolvedValue(questionsMock);
      mockTestRepository.createTestWithQuestions.mockResolvedValue({ id: "test-123" });

      const result = await testService.createTest("user-1", {
        workspaceId: "ws-1",
        topicId: "topic-1",
        limit: 10,
      });

      expect(result).toEqual({ id: "test-123" });
      expect(mockTestRepository.createTestWithQuestions).toHaveBeenCalled();
    });
  });
});
