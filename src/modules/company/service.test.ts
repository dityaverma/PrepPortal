import { CompanyService } from "./service";
import { NotFoundError, ValidationError } from "@/common/errors";

describe("CompanyService", () => {
  let companyService: CompanyService;
  let mockCompanyRepository: any;

  beforeEach(() => {
    mockCompanyRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      findByName: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    companyService = new CompanyService(mockCompanyRepository);
  });

  describe("getById", () => {
    it("should throw NotFoundError if company does not exist", async () => {
      mockCompanyRepository.findById.mockResolvedValue(null);

      // check if getById throws not found error
      await expect(companyService.getById("comp-1")).rejects.toThrow(NotFoundError);
    });

    it("should return company if it exists", async () => {
      mockCompanyRepository.findById.mockResolvedValue({ id: "comp-1", name: "Google" });

      // check if getById returns correct company data
      const result = await companyService.getById("comp-1");
      expect(result.name).toBe("Google");
    });
  });

  describe("create", () => {
    it("should throw ValidationError if company name already exists", async () => {
      mockCompanyRepository.findByName.mockResolvedValue({ id: "comp-1", name: "Google" });

      // check if validation error is thrown for duplicate name
      await expect(companyService.create({ name: "Google" })).rejects.toThrow(ValidationError);
    });

    it("should create company successfully", async () => {
      mockCompanyRepository.findByName.mockResolvedValue(null);
      mockCompanyRepository.create.mockResolvedValue({ id: "comp-2", name: "Apple" });

      // check if company is created successfully
      const result = await companyService.create({ name: "Apple" });
      expect(result.name).toBe("Apple");
    });
  });
});
