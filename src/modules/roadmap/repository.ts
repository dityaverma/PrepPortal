import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/**
 * Roadmap Repository Layer
 * 
 * Centralizes DB queries and mutations for learning Roadmaps and RoadmapNodes.
 */
export class RoadmapRepository {
  /**
   * Finds the existing roadmap for a workspace.
   */
  async findRoadmapByWorkspaceId(workspaceId: string) {
    return prisma.roadmap.findFirst({
      where: { workspaceId },
      include: {
        nodes: {
          include: {
            topic: {
              include: {
                prerequisites: true,
              },
            },
          },
          orderBy: { sequenceOrder: "asc" },
        },
      },
    });
  }

  /**
   * Initializes a new roadmap for the workspace.
   */
  async createRoadmapWithNodes(workspaceId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newRoadmap = await tx.roadmap.create({
        data: { workspaceId },
      });

      const topics = await tx.topic.findMany({
        include: {
          prerequisites: true,
        },
        orderBy: { createdAt: "asc" },
      });

      for (let i = 0; i < topics.length; i++) {
        const topic = topics[i];
        const hasPrereqs = topic.prerequisites.length > 0;
        const status = hasPrereqs ? "LOCKED" : "UNLOCKED";

        await tx.roadmapNode.create({
          data: {
            roadmapId: newRoadmap.id,
            topicId: topic.id,
            status,
            sequenceOrder: i + 1,
          },
        });
      }

      return tx.roadmap.findUnique({
        where: { id: newRoadmap.id },
        include: {
          nodes: {
            include: {
              topic: {
                include: {
                  prerequisites: true,
                },
              },
            },
            orderBy: { sequenceOrder: "asc" },
          },
        },
      });
    });
  }
}

export const roadmapRepository = new RoadmapRepository();
