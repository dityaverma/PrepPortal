import { DocumentService } from "./service";
import { NotFoundError } from "@/common/errors";

describe("DocumentService", () => {
  let documentService: DocumentService;
  let mockDocumentRepository: any;

  beforeEach(() => {
    mockDocumentRepository = {
      publishRelationalData: jest.fn(),
    };
    documentService = new DocumentService(mockDocumentRepository);
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  describe("getJobStatus", () => {
    it("should throw NotFoundError if AI service returns 404", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 404,
        ok: false,
      });

      // verify that job status fetch throws not found error
      await expect(documentService.getJobStatus("job-123")).rejects.toThrow(NotFoundError);
    });

    it("should return job status if successful", async () => {
      const mockStatus = { status: "COMPLETED", data: {} };
      (global.fetch as jest.Mock).mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => mockStatus,
      });

      // verify successful job status retrieval
      const result = await documentService.getJobStatus("job-123");
      expect(result).toEqual(mockStatus);
    });
  });
});
