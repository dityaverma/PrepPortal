import { StudyLinkRepository, studyLinkRepository } from "./repository";
import { CreateStudyLinkInput, UpdateStudyLinkInput } from "./dto";
import { NotFoundError } from "@/common/errors";

/**
 * Study Link Service Layer
 * 
 * Implements business logic and checks for Study Links.
 */
export class StudyLinkService {
  private repository: StudyLinkRepository;

  constructor(repository: StudyLinkRepository = studyLinkRepository) {
    this.repository = repository;
  }

  /**
   * Retrieves a study link by ID or throws a NotFoundError.
   */
  async getById(id: string) {
    const link = await this.repository.findById(id);
    if (!link) {
      throw new NotFoundError("Study link not found");
    }
    return link;
  }

  /**
   * Lists all study links under a subtopic.
   */
  async list(subtopicId: string) {
    return this.repository.listBySubtopicId(subtopicId);
  }

  /**
   * Creates a new study link.
   */
  async create(data: CreateStudyLinkInput) {
    return this.repository.create(data);
  }

  /**
   * Updates an existing study link.
   */
  async update(id: string, data: UpdateStudyLinkInput) {
    await this.getById(id);
    return this.repository.update(id, data);
  }

  /**
   * Deletes a study link by ID.
   */
  async delete(id: string) {
    await this.getById(id);
    await this.repository.delete(id);
    return { id, deleted: true };
  }
}

export const studyLinkService = new StudyLinkService();
