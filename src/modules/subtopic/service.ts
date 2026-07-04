/**
 * Subtopic Service Layer
 * 
 * Coordinates business validation rules for curriculum Subtopic entities.
 * Ensures naming uniqueness inside the parent Topic.
 */

import { SubtopicRepository, subtopicRepository } from "./repository";
import { CreateSubtopicInput, UpdateSubtopicInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";
import { NotFoundError, ValidationError } from "@/common/errors";

export class SubtopicService {
  private repository: SubtopicRepository;

  constructor(repository: SubtopicRepository = subtopicRepository) {
    this.repository = repository;
  }

  /**
   * Resolves a subtopic by its unique ID or throws a NotFoundError.
   */
  async getById(id: string) {
    const subtopic = await this.repository.findById(id);
    if (!subtopic) {
      throw new NotFoundError("Subtopic not found");
    }
    return subtopic;
  }

  /**
   * Retrieves a paginated list of subtopics, optionally scoped to a parent Topic ID.
   */
  async list(query: ParsedQuery, topicId?: string) {
    return this.repository.findMany(query, topicId);
  }

  /**
   * Creates a new subtopic record.
   * Ensures that name is unique within the selected parent topic category.
   */
  async create(data: CreateSubtopicInput) {
    const existing = await this.repository.findByNameInTopic(data.topicId, data.name);
    if (existing) {
      throw new ValidationError("A subtopic with this name already exists in the selected topic");
    }
    return this.repository.create(data);
  }

  /**
   * Updates an existing subtopic.
   * Asserts name uniqueness inside the parent topic after editing.
   */
  async update(id: string, data: UpdateSubtopicInput) {
    const current = await this.getById(id);
    
    const topicId = data.topicId || current.topicId;
    if (data.name) {
      const existing = await this.repository.findByNameInTopic(topicId, data.name);
      if (existing && existing.id !== id) {
        throw new ValidationError("A subtopic with this name already exists in this topic");
      }
    }

    return this.repository.update(id, data);
  }

  /**
   * Deletes a subtopic record by its ID.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }
}

export const subtopicService = new SubtopicService();

