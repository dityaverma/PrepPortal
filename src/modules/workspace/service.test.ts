import { WorkspaceService } from "./service";
import { NotFoundError } from "@/common/errors";

describe("WorkspaceService", () => {
  let workspaceService: WorkspaceService;
  let mockWorkspaceRepository: any;

  beforeEach(() => {
    mockWorkspaceRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
      findArchived: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      duplicate: jest.fn(),
    };
    workspaceService = new WorkspaceService(mockWorkspaceRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if workspace is not found", async () => {
      mockWorkspaceRepository.findById.mockResolvedValue(null);

      await expect(workspaceService.getById("ws-1", "user-1")).rejects.toThrow(NotFoundError);
    });

    it("should return workspace details if found", async () => {
      mockWorkspaceRepository.findById.mockResolvedValue({ id: "ws-1", name: "My Workspace" });

      const result = await workspaceService.getById("ws-1", "user-1");
      expect(result.name).toBe("My Workspace");
    });
  });

  describe("rename", () => {
    it("should rename workspace successfully", async () => {
      mockWorkspaceRepository.findById.mockResolvedValue({ id: "ws-1", name: "My Workspace" });
      mockWorkspaceRepository.update.mockResolvedValue({ id: "ws-1", name: "New Name" });

      const result = await workspaceService.rename("ws-1", "user-1", "New Name");
      expect(result.name).toBe("New Name");
      expect(mockWorkspaceRepository.update).toHaveBeenCalledWith("ws-1", "user-1", { name: "New Name" });
    });
  });
});
