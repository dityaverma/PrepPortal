import { RoadmapService } from "./service";
import { workspaceRepository } from "../workspace/repository";
import { NotFoundError } from "@/common/errors";

jest.mock("../workspace/repository", () => ({
  workspaceRepository: {
    findById: jest.fn(),
  },
}));

describe("RoadmapService", () => {
  let roadmapService: RoadmapService;
  let mockRoadmapRepository: any;

  beforeEach(() => {
    mockRoadmapRepository = {
      findRoadmapByWorkspaceId: jest.fn(),
      createRoadmapWithNodes: jest.fn(),
    };
    roadmapService = new RoadmapService(mockRoadmapRepository);
    jest.clearAllMocks();
  });

  describe("getOrCreateRoadmap", () => {
    it("should throw NotFoundError if workspace is not owned by user", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(roadmapService.getOrCreateRoadmap("user-1", "ws-1")).rejects.toThrow(NotFoundError);
    });

    it("should return existing roadmap if found", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1" });
      mockRoadmapRepository.findRoadmapByWorkspaceId.mockResolvedValue({ id: "roadmap-123" });

      const result = await roadmapService.getOrCreateRoadmap("user-1", "ws-1");
      expect(result).toEqual({ id: "roadmap-123" });
      expect(mockRoadmapRepository.createRoadmapWithNodes).not.toHaveBeenCalled();
    });

    it("should create new roadmap and nodes if not found", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1" });
      mockRoadmapRepository.findRoadmapByWorkspaceId.mockResolvedValue(null);
      mockRoadmapRepository.createRoadmapWithNodes.mockResolvedValue({ id: "new-roadmap-456" });

      const result = await roadmapService.getOrCreateRoadmap("user-1", "ws-1");
      expect(result).toEqual({ id: "new-roadmap-456" });
      expect(mockRoadmapRepository.createRoadmapWithNodes).toHaveBeenCalledWith("ws-1");
    });
  });
});
