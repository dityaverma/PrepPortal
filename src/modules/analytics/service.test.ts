import { AnalyticsService } from "./service";
import { workspaceRepository } from "../workspace/repository";
import { NotFoundError } from "@/common/errors";

jest.mock("../workspace/repository", () => ({
  workspaceRepository: {
    findById: jest.fn(),
  },
}));

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService;
  let mockAnalyticsRepository: any;

  beforeEach(() => {
    mockAnalyticsRepository = {
      findAnalyticsByWorkspaceId: jest.fn(),
      findProgressByWorkspaceId: jest.fn(),
      findSubjectsWithTopics: jest.fn(),
      countCompletedRoadmapNodes: jest.fn(),
      countUsers: jest.fn(),
      countActiveWorkspaces: jest.fn(),
      countQuestions: jest.fn(),
      countQuestionsByDifficulty: jest.fn(),
      countQuestionsByType: jest.fn(),
      findSubjectsWithTopicCount: jest.fn(),
      findAllTopics: jest.fn(),
      countFailedAttemptsByTopicId: jest.fn(),
    };
    analyticsService = new AnalyticsService(mockAnalyticsRepository);
    jest.clearAllMocks();
  });

  describe("getStudentAnalytics", () => {
    it("should throw NotFoundError if workspace is unauthorized", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(analyticsService.getStudentAnalytics("user-1", "ws-1")).rejects.toThrow(NotFoundError);
    });

    it("should compile and aggregate student completions on subjects and progress", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1" });
      mockAnalyticsRepository.findAnalyticsByWorkspaceId.mockResolvedValue({ attemptsCount: 5, averageScore: 80.0 });
      mockAnalyticsRepository.findProgressByWorkspaceId.mockResolvedValue({ completionPercentage: 45.0, completedTopicsCount: 3 });
      mockAnalyticsRepository.findSubjectsWithTopics.mockResolvedValue([
        { id: "sub-1", name: "Data Structures", topics: [{ id: "t-1" }, { id: "t-2" }] },
      ]);
      mockAnalyticsRepository.countCompletedRoadmapNodes.mockResolvedValue(1);

      const result = await analyticsService.getStudentAnalytics("user-1", "ws-1");
      expect(result.totalProgress).toBe(45.0);
      expect(result.attemptsCount).toBe(5);
      expect(result.subjectProgress[0].completionPercentage).toBe(50.0);
    });
  });
});
