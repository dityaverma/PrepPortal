/**
 * Subject Service Layer
 * 
 * Implements business workflow logic for managing Subject entities.
 * Restricts naming duplicates and delegates direct queries to the SubjectRepository.
 */

import { SubjectRepository, subjectRepository } from "./repository";
import { CreateSubjectInput, UpdateSubjectInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";
import { NotFoundError, ValidationError } from "@/common/errors";

export class SubjectService {
  private repository: SubjectRepository;

  constructor(repository: SubjectRepository = subjectRepository) {
    this.repository = repository;
  }

  /**
   * Resolves a subject by its ID, throwing a NotFoundError if it does not exist.
   */
  async getById(id: string) {
    const subject = await this.repository.findById(id);
    if (!subject) {
      throw new NotFoundError("Subject not found");
    }
    return subject;
  }

  /**
   * Retrieves a paginated list of subjects.
   */
  async list(query: ParsedQuery) {
    return this.repository.findMany(query);
  }

  /**
   * Creates a new subject.
   * Asserts that the subject name is unique.
   */
  async create(data: CreateSubjectInput) {
    const existing = await this.repository.findByName(data.name);
    if (existing) {
      throw new ValidationError("A subject with this name already exists");
    }
    return this.repository.create(data);
  }

  /**
   * Updates an existing subject.
   * Asserts that subject names remain unique after updates.
   */
  async update(id: string, data: UpdateSubjectInput) {
    await this.getById(id);
    if (data.name) {
      const existing = await this.repository.findByName(data.name);
      if (existing && existing.id !== id) {
        throw new ValidationError("A subject with this name already exists");
      }
    }
    return this.repository.update(id, data);
  }

  /**
   * Deletes a subject record.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }
}

export const subjectService = new SubjectService();

