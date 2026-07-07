import { BookmarkService } from "./service";
import { workspaceRepository } from "../workspace/repository";
import { NotFoundError, ValidationError } from "@/common/errors";

jest.mock("../workspace/repository", () => ({
  workspaceRepository: {
    findById: jest.fn(),
  },
}));

describe("BookmarkService", () => {
  let bookmarkService: BookmarkService;
  let mockBookmarkRepository: any;

  beforeEach(() => {
    mockBookmarkRepository = {
      findDuplicate: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
      list: jest.fn(),
    };
    bookmarkService = new BookmarkService(mockBookmarkRepository);
    jest.clearAllMocks();
  });

  describe("add", () => {
    it("should throw NotFoundError if workspace does not exist or user doesn't own it", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue(null);

      await expect(
        bookmarkService.add("user-1", {
          workspaceId: "ws-1",
          questionId: "q-1",
        })
      ).rejects.toThrow(NotFoundError);
    });

    it("should throw ValidationError if bookmark already exists in workspace", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1" });
      mockBookmarkRepository.findDuplicate.mockResolvedValue({ id: "bookmark-1" });

      await expect(
        bookmarkService.add("user-1", {
          workspaceId: "ws-1",
          questionId: "q-1",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("should successfully add bookmark", async () => {
      (workspaceRepository.findById as jest.Mock).mockResolvedValue({ id: "ws-1" });
      mockBookmarkRepository.findDuplicate.mockResolvedValue(null);
      mockBookmarkRepository.create.mockResolvedValue({ id: "bookmark-123" });

      const result = await bookmarkService.add("user-1", {
        workspaceId: "ws-1",
        questionId: "q-1",
      });

      expect(result).toHaveProperty("id");
      expect(mockBookmarkRepository.create).toHaveBeenCalled();
    });
  });
});
