import { StudyLinkService } from "./service";
import { NotFoundError } from "@/common/errors";

describe("StudyLinkService", () => {
  let studyLinkService: StudyLinkService;
  let mockStudyLinkRepository: any;

  beforeEach(() => {
    mockStudyLinkRepository = {
      findById: jest.fn(),
      listBySubtopicId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    studyLinkService = new StudyLinkService(mockStudyLinkRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if study link does not exist", async () => {
      mockStudyLinkRepository.findById.mockResolvedValue(null);

      // verify that not found error is thrown for missing study link
      await expect(studyLinkService.getById("link-1")).rejects.toThrow(NotFoundError);
    });

    it("should return study link if found", async () => {
      mockStudyLinkRepository.findById.mockResolvedValue({ id: "link-1", gfgUrl: "https://example.com" });

      // verify successful retrieval
      const result = await studyLinkService.getById("link-1");
      expect(result.gfgUrl).toBe("https://example.com");
    });
  });

  describe("delete", () => {
    it("should delete successfully if study link exists", async () => {
      mockStudyLinkRepository.findById.mockResolvedValue({ id: "link-1" });
      mockStudyLinkRepository.delete.mockResolvedValue({ id: "link-1" });

      // verify deletion workflow
      const result = await studyLinkService.delete("link-1");
      expect(result.deleted).toBe(true);
      expect(mockStudyLinkRepository.delete).toHaveBeenCalledWith("link-1");
    });
  });
});
