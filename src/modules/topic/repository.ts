/**
 * Topic Repository Layer
 * 
 * Manages SQL/ORM query actions on curriculum Topic models.
 * Implements transaction wrappers to safely link prerequisite mappings.
 */

import { prisma } from "@/lib/prisma";
import { CreateTopicInput, UpdateTopicInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";

export class TopicRepository {
  /**
   * Retrieves a topic with its parent Subject and associated prerequisites.
   */
  async findById(id: string) {
    return prisma.topic.findUnique({
      where: { id },
      include: {
        subject: true,
        prerequisites: {
          include: {
            prerequisite: true,
          },
        },
      },
    });
  }

  /**
   * Finds a topic inside a specific subject by name (ensures uniqueness scoped to subject).
   */
  async findByNameInSubject(subjectId: string, name: string) {
    return prisma.topic.findFirst({
      where: { subjectId, name },
    });
  }

  /**
   * Transactionally creates a topic and links its prerequisites list.
   */
  async create(data: CreateTopicInput) {
    return prisma.$transaction(async (tx) => {
      const topic = await tx.topic.create({
        data: {
          name: data.name,
          description: data.description || null,
          subjectId: data.subjectId,
        },
      });

      if (data.prerequisiteIds && data.prerequisiteIds.length > 0) {
        await tx.topicPrerequisite.createMany({
          data: data.prerequisiteIds.map((prereqId) => ({
            topicId: topic.id,
            prerequisiteId: prereqId,
          })),
        });
      }

      return tx.topic.findUnique({
        where: { id: topic.id },
        include: {
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
        },
      });
    });
  }

  /**
   * Transactionally updates a topic and resets its prerequisite associations.
   */
  async update(id: string, data: UpdateTopicInput) {
    return prisma.$transaction(async (tx) => {
      await tx.topic.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          subjectId: data.subjectId,
        },
      });

      if (data.prerequisiteIds !== undefined) {
        // Clear existing prerequisites mappings for this topic
        await tx.topicPrerequisite.deleteMany({
          where: { topicId: id },
        });

        // Insert new prerequisites mappings
        if (data.prerequisiteIds.length > 0) {
          await tx.topicPrerequisite.createMany({
            data: data.prerequisiteIds.map((prereqId) => ({
              topicId: id,
              prerequisiteId: prereqId,
            })),
          });
        }
      }

      return tx.topic.findUnique({
        where: { id },
        include: {
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
        },
      });
    });
  }

  /**
   * Deletes a topic record by ID.
   */
  async delete(id: string) {
    return prisma.topic.delete({
      where: { id },
    });
  }

  /**
   * Retrieves a filtered list of topics under a specific subject.
   */
  async findMany(query: ParsedQuery, subjectId?: string) {
    const where: any = {};
    if (subjectId) {
      where.subjectId = subjectId;
    }
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.topic.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          subject: true,
          prerequisites: {
            include: {
              prerequisite: true,
            },
          },
        },
      }),
      prisma.topic.count({ where }),
    ]);

    return { items, total };
  }
}

export const topicRepository = new TopicRepository();

