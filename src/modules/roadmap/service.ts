/**
 * Roadmap Service Layer
 * 
 * Orchestrates student topic roadmap generation, unlock sequences, and sequence orders.
 * 
 * Major Decision Points:
 * 1. Initial State Initialization: When a user gets their roadmap for the first time,
 *    we perform a transactional query to fetch all curriculum topics and create a custom
 *    roadmap mapping.
 * 2. Prerequisite Checks: Topics with 0 prerequisites are initialized as "UNLOCKED",
 *    while topics requiring prerequisite completion are initialized as "LOCKED".
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";
import { Prisma } from "@prisma/client";

export class RoadmapService {
  
  /**
   * Fetches the user's roadmap. If it does not exist, initialize a new roadmap
   * mapping all existing topics and assigning LOCKED/UNLOCKED status based on prerequisites.
   * 
   * @param userId Requesting user ID
   * @param workspaceId target workspace container ID
   */
  async getOrCreateRoadmap(userId: string, workspaceId: string) {
    // 1. Verify workspace ownership and authorization
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // 2. Find existing roadmap with nested nodes, topics, and prerequisites
    let roadmap = await prisma.roadmap.findFirst({
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

    // 3. If no roadmap exists, execute a transaction to initialize it
    if (!roadmap) {
      roadmap = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Create the parent Roadmap record
        const newRoadmap = await tx.roadmap.create({
          data: { workspaceId },
        });

        // Fetch all available topics in the master catalog
        const topics = await tx.topic.findMany({
          include: {
            prerequisites: true,
          },
          orderBy: { createdAt: "asc" },
        });

        // Create individual Roadmap Nodes for each topic
        for (let i = 0; i < topics.length; i++) {
          const topic = topics[i];
          const hasPrereqs = topic.prerequisites.length > 0;
          
          // Initial status determination:
          // Unlocked instantly if there are no prerequisite dependencies, else Locked.
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

        // Return the fully populated, freshly initialized roadmap structure
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
      }) as any;
    }

    return roadmap;
  }
}

export const roadmapService = new RoadmapService();

