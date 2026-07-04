/**
 * Workspace Repository Layer
 * 
 * Performs database query operations via Prisma to manage student workspaces.
 * Implements transaction-safe duplication and initialization steps.
 */

import { prisma } from "@/lib/prisma";
import { CreateWorkspaceInput } from "./dto";

export class WorkspaceRepository {
  /**
   * Finds a workspace by ID and Owner ID, eager loading mapped target companies.
   */
  async findById(id: string, userId: string) {
    return prisma.workspace.findFirst({
      where: { id, userId },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
    });
  }

  /**
   * Finds all non-archived workspaces belonging to a user.
   */
  async findAll(userId: string) {
    return prisma.workspace.findMany({
      where: { userId, archived: false },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Finds all archived workspaces belonging to a user.
   */
  async findArchived(userId: string) {
    return prisma.workspace.findMany({
      where: { userId, archived: true },
      include: {
        companies: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { archivedAt: "desc" },
    });
  }

  /**
   * Transactionally creates a workspace.
   * Steps:
   * 1. Creates the Workspace record
   * 2. Maps target companies using WorkspaceCompany join records
   * 3. Creates default Progress record
   * 4. Creates default Analytics record
   */
  async create(userId: string, data: CreateWorkspaceInput) {
    return prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          targetRole: data.targetRole,
          userId,
        },
      });

      if (data.companyIds && data.companyIds.length > 0) {
        await tx.workspaceCompany.createMany({
          data: data.companyIds.map((companyId) => ({
            workspaceId: workspace.id,
            companyId,
          })),
        });
      }

      // Initialize workspace progress record
      await tx.progress.create({
        data: {
          workspaceId: workspace.id,
        },
      });

      // Initialize workspace analytics record
      await tx.analytics.create({
        data: {
          workspaceId: workspace.id,
        },
      });

      return tx.workspace.findUnique({
        where: { id: workspace.id },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
        },
      });
    });
  }

  /**
   * Updates general workspace fields (e.g. name, archived state).
   */
  async update(id: string, userId: string, data: { name?: string; archived?: boolean; archivedAt?: Date | null }) {
    return prisma.workspace.updateMany({
      where: { id, userId },
      data,
    });
  }

  /**
   * Hard deletes a workspace.
   */
  async delete(id: string, userId: string) {
    return prisma.workspace.deleteMany({
      where: { id, userId },
    });
  }

  /**
   * Transactionally duplicates an entire workspace.
   * Clones target companies, roadmaps, roadmap node statuses, and bookmarks.
   * Creates clean progress/analytics structures for the cloned copy.
   */
  async duplicate(workspaceId: string, userId: string, newName: string) {
    return prisma.$transaction(async (tx) => {
      const source = await tx.workspace.findFirst({
        where: { id: workspaceId, userId },
        include: {
          companies: true,
          roadmaps: {
            include: {
              nodes: true,
            },
          },
          bookmarks: true,
        },
      });

      if (!source) {
        throw new Error("Source workspace not found");
      }

      // Create new duplicated workspace metadata
      const copy = await tx.workspace.create({
        data: {
          name: newName,
          targetRole: source.targetRole,
          userId,
        },
      });

      // Clone target companies mappings
      if (source.companies.length > 0) {
        await tx.workspaceCompany.createMany({
          data: source.companies.map((c) => ({
            workspaceId: copy.id,
            companyId: c.companyId,
          })),
        });
      }

      // Clone roadmap entities and their node progress/sequences
      for (const roadmap of source.roadmaps) {
        const copyRoadmap = await tx.roadmap.create({
          data: {
            workspaceId: copy.id,
          },
        });
        if (roadmap.nodes.length > 0) {
          await tx.roadmapNode.createMany({
            data: roadmap.nodes.map((node) => ({
              roadmapId: copyRoadmap.id,
              topicId: node.topicId,
              status: node.status,
              sequenceOrder: node.sequenceOrder,
            })),
          });
        }
      }

      // Clone existing bookmarks (questions / subtopics)
      if (source.bookmarks.length > 0) {
        await tx.bookmark.createMany({
          data: source.bookmarks.map((b) => ({
            workspaceId: copy.id,
            questionId: b.questionId,
            subtopicId: b.subtopicId,
          })),
        });
      }

      // Initialize clean progress and analytics for duplicated workspace
      await tx.progress.create({
        data: {
          workspaceId: copy.id,
        },
      });

      await tx.analytics.create({
        data: {
          workspaceId: copy.id,
        },
      });

      return tx.workspace.findUnique({
        where: { id: copy.id },
        include: {
          companies: {
            include: {
              company: true,
            },
          },
        },
      });
    });
  }
}

export const workspaceRepository = new WorkspaceRepository();

