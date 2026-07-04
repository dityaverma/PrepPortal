/**
 * Subtopic Repository Layer
 * 
 * Performs SQL/ORM database operations on curriculum Subtopic records.
 * Integrates transactions to link associated study resource links safely.
 */

import { prisma } from "@/lib/prisma";
import { CreateSubtopicInput, UpdateSubtopicInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";

export class SubtopicRepository {
  /**
   * Retrieves a subtopic by ID along with its parent Topic and related StudyLinks.
   */
  async findById(id: string) {
    return prisma.subtopic.findUnique({
      where: { id },
      include: {
        topic: true,
        studyLinks: true,
      },
    });
  }

  /**
   * Finds a subtopic record by its name within a specific parent topic context.
   * Assures that subtopic names are unique scoped to their parent Topic.
   */
  async findByNameInTopic(topicId: string, name: string) {
    return prisma.subtopic.findFirst({
      where: { topicId, name },
    });
  }

  /**
   * Transactionally creates a subtopic and maps its associated StudyLink resources if provided.
   */
  async create(data: CreateSubtopicInput) {
    return prisma.$transaction(async (tx) => {
      const subtopic = await tx.subtopic.create({
        data: {
          name: data.name,
          description: data.description || null,
          topicId: data.topicId,
        },
      });

      if (data.studyLink) {
        await tx.studyLink.create({
          data: {
            subtopicId: subtopic.id,
            description: data.studyLink.description || null,
            learningObjectives: data.studyLink.learningObjectives || null,
            estimatedTime: data.studyLink.estimatedTime || 0,
            prerequisites: data.studyLink.prerequisites || null,
            gfgUrl: data.studyLink.gfgUrl || null,
            officialDocUrl: data.studyLink.officialDocUrl || null,
            additionalResources: data.studyLink.additionalResources || null,
          },
        });
      }

      return tx.subtopic.findUnique({
        where: { id: subtopic.id },
        include: {
          studyLinks: true,
        },
      });
    });
  }

  /**
   * Transactionally updates a subtopic and upserts its mapped StudyLink record.
   */
  async update(id: string, data: UpdateSubtopicInput) {
    return prisma.$transaction(async (tx) => {
      await tx.subtopic.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          topicId: data.topicId,
        },
      });

      if (data.studyLink) {
        const existing = await tx.studyLink.findFirst({
          where: { subtopicId: id },
        });

        if (existing) {
          // If StudyLink already exists, update it with new fields
          await tx.studyLink.update({
            where: { id: existing.id },
            data: {
              description: data.studyLink.description,
              learningObjectives: data.studyLink.learningObjectives,
              estimatedTime: data.studyLink.estimatedTime,
              prerequisites: data.studyLink.prerequisites,
              gfgUrl: data.studyLink.gfgUrl,
              officialDocUrl: data.studyLink.officialDocUrl,
              additionalResources: data.studyLink.additionalResources,
            },
          });
        } else {
          // Otherwise, create a new StudyLink record linked to the subtopic
          await tx.studyLink.create({
            data: {
              subtopicId: id,
              description: data.studyLink.description || null,
              learningObjectives: data.studyLink.learningObjectives || null,
              estimatedTime: data.studyLink.estimatedTime || 0,
              prerequisites: data.studyLink.prerequisites || null,
              gfgUrl: data.studyLink.gfgUrl || null,
              officialDocUrl: data.studyLink.officialDocUrl || null,
              additionalResources: data.studyLink.additionalResources || null,
            },
          });
        }
      }

      return tx.subtopic.findUnique({
        where: { id },
        include: {
          studyLinks: true,
        },
      });
    });
  }

  /**
   * Hard deletes a subtopic record by its unique ID.
   */
  async delete(id: string) {
    return prisma.subtopic.delete({
      where: { id },
    });
  }

  /**
   * Fetches paginated, sorted, and filtered lists of subtopics.
   */
  async findMany(query: ParsedQuery, topicId?: string) {
    const where: any = {};
    if (topicId) {
      where.topicId = topicId;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.subtopic.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          topic: true,
          studyLinks: true,
        },
      }),
      prisma.subtopic.count({ where }),
    ]);

    return { items, total };
  }
}

export const subtopicRepository = new SubtopicRepository();

