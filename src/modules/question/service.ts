/**
 * Question Service Layer
 * 
 * Coordinates business logic workflows for managing Question banks.
 * Handles single creations/updates and coordinates transactional bulk imports.
 */

import { QuestionRepository, questionRepository } from "./repository";
import { CreateQuestionInput, UpdateQuestionInput, QuestionQueryParams, BulkImportInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";
import { NotFoundError } from "@/common/errors";

export class QuestionService {
  private repository: QuestionRepository;

  constructor(repository: QuestionRepository = questionRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a question by ID or throws a NotFoundError.
   */
  async getById(id: string) {
    const question = await this.repository.findById(id);
    if (!question) {
      throw new NotFoundError("Question not found");
    }
    return question;
  }

  /**
   * Retrieves a list of questions filtered by query parameters and search strings.
   */
  async list(query: ParsedQuery, filters: QuestionQueryParams) {
    return this.repository.findMany(query, filters);
  }

  /**
   * Inserts a single Question record into the database.
   */
  async create(data: CreateQuestionInput) {
    return this.repository.create(data);
  }

  /**
   * Updates an existing Question.
   */
  async update(id: string, data: UpdateQuestionInput) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  /**
   * Deletes a question record.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }

  /**
   * Performs bulk importing of questions.
   */
  async bulkImport(data: BulkImportInput) {
    return this.repository.bulkImport(data.questions);
  }
}

export const questionService = new QuestionService();

