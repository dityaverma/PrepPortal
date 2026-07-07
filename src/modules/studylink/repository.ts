import { prisma } from "@/lib/prisma";
import { CreateStudyLinkInput, UpdateStudyLinkInput } from "./dto";

/**
 * Study Link Repository Layer
 * 
 * Handles direct database operations for the StudyLink table.
 */
export class StudyLinkRepository {
  /**
   * Finds a study link record by ID.
   */
  async findById(id: string) {
    return prisma.studyLink.findUnique({ where: { id } });
  }

  /**
   * Retrieves all study links for a specific subtopic.
   */
  async listBySubtopicId(subtopicId: string) {
    return prisma.studyLink.findMany({ where: { subtopicId } });
  }

  /**
   * Creates a new study link.
   */
  async create(data: CreateStudyLinkInput) {
    return prisma.studyLink.create({
      data: {
        subtopicId: data.subtopicId,
        description: data.description || null,
        learningObjectives: data.learningObjectives || null,
        estimatedTime: data.estimatedTime || 0,
        prerequisites: data.prerequisites || null,
        gfgUrl: data.gfgUrl || null,
        officialDocUrl: data.officialDocUrl || null,
        additionalResources: data.additionalResources || null,
      },
    });
  }

  /**
   * Updates an existing study link.
   */
  async update(id: string, data: UpdateStudyLinkInput) {
    return prisma.studyLink.update({
      where: { id },
      data,
    });
  }

  /**
   * Deletes a study link by ID.
   */
  async delete(id: string) {
    return prisma.studyLink.delete({
      where: { id },
    });
  }
}

export const studyLinkRepository = new StudyLinkRepository();
