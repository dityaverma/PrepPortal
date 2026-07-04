/**
 * Topic Service Layer
 * 
 * Implements business workflow rules for Topic curriculum units.
 * Enforces constraints such as name uniqueness inside a Subject,
 * and prevention of circular/self-prerequisite loops.
 */

import { TopicRepository, topicRepository } from "./repository";
import { CreateTopicInput, UpdateTopicInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";
import { NotFoundError, ValidationError } from "@/common/errors";

export class TopicService {
  private repository: TopicRepository;

  constructor(repository: TopicRepository = topicRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a topic by ID or throws a NotFoundError.
   */
  async getById(id: string) {
    const topic = await this.repository.findById(id);
    if (!topic) {
      throw new NotFoundError("Topic not found");
    }
    return topic;
  }

  /**
   * Lists topics matching search criteria, optionally isolated to a single Subject.
   */
  async list(query: ParsedQuery, subjectId?: string) {
    return this.repository.findMany(query, subjectId);
  }

  /**
   * Creates a new topic.
   * Asserts that name is unique within the selected subject category.
   */
  async create(data: CreateTopicInput) {
    const existing = await this.repository.findByNameInSubject(data.subjectId, data.name);
    if (existing) {
      throw new ValidationError("A topic with this name already exists in the selected subject");
    }
    return this.repository.create(data);
  }

  /**
   * Updates an existing topic.
   * Asserts uniqueness of name in the target subject and validates that a topic
   * cannot reference itself as its own prerequisite.
   */
  async update(id: string, data: UpdateTopicInput) {
    const current = await this.getById(id);
    
    const subjectId = data.subjectId || current.subjectId;
    if (data.name) {
      const existing = await this.repository.findByNameInSubject(subjectId, data.name);
      if (existing && existing.id !== id) {
        throw new ValidationError("A topic with this name already exists in this subject");
      }
    }

    // Prevent self-prerequisite assignment
    if (data.prerequisiteIds?.includes(id)) {
      throw new ValidationError("A topic cannot have itself as a prerequisite");
    }

    return this.repository.update(id, data);
  }

  /**
   * Deletes a topic record by ID.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }
}

export const topicService = new TopicService();

