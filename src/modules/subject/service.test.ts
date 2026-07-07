import { SubjectService } from "./service";
import { NotFoundError, ValidationError } from "@/common/errors";

describe("SubjectService", () => {
  let subjectService: SubjectService;
  let mockSubjectRepository: any;

  beforeEach(() => {
    mockSubjectRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    subjectService = new SubjectService(mockSubjectRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if subject does not exist", async () => {
      mockSubjectRepository.findById.mockResolvedValue(null);

      // verify that not found error is thrown for missing subject
      await expect(subjectService.getById("sub-1")).rejects.toThrow(NotFoundError);
    });

    it("should return subject if found", async () => {
      mockSubjectRepository.findById.mockResolvedValue({ id: "sub-1", name: "Math" });

      // verify successful retrieval
      const result = await subjectService.getById("sub-1");
      expect(result.name).toBe("Math");
    });
  });

  describe("create", () => {
    it("should throw ValidationError if subject name already exists", async () => {
      mockSubjectRepository.findByName.mockResolvedValue({ id: "sub-1", name: "Math" });

      // verify that duplicate names throw validation error
      await expect(subjectService.create({ name: "Math" })).rejects.toThrow(ValidationError);
    });
  });
});
