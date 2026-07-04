/**
 * Company Service Layer
 * 
 * Implements business workflow logic for preparation companies.
 * Ensures company names are unique and handles record management.
 */

import { CompanyRepository, companyRepository } from "./repository";
import { CreateCompanyInput, UpdateCompanyInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";
import { NotFoundError, ValidationError } from "@/common/errors";

export class CompanyService {
  private repository: CompanyRepository;

  constructor(repository: CompanyRepository = companyRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a company by ID or throws a NotFoundError.
   */
  async getById(id: string) {
    const company = await this.repository.findById(id);
    if (!company) {
      throw new NotFoundError("Company not found");
    }
    return company;
  }

  /**
   * Returns a list of companies matching search, sort, and pagination inputs.
   */
  async list(query: ParsedQuery) {
    return this.repository.findMany(query);
  }

  /**
   * Creates a new company record.
   * Assures that company names are globally unique.
   */
  async create(data: CreateCompanyInput) {
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new ValidationError("A company with this name already exists");
    }
    return this.repository.create(data);
  }

  /**
   * Updates an existing company.
   * Prevents renaming to a name that already belongs to another company.
   */
  async update(id: string, data: UpdateCompanyInput) {
    await this.getById(id);
    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ValidationError("A company with this name already exists");
      }
    }
    return this.repository.update(id, data);
  }

  /**
   * Deletes a company record by ID.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }
}

export const companyService = new CompanyService();

