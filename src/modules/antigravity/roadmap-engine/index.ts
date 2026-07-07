import { prisma } from "@/lib/prisma";

export interface RecoveryNode {
  id: string;
  topicId: string;
  type: string; // e.g. RECOVERY_NODE
  status: string; // LOCKED, UNLOCKED, COMPLETED
  title: string;
}

// roadmap mutation engine handles dynamic insertions of recovery nodes on student learning tracks
export class RoadmapEngine {
  // mutate active workspace roadmap by injecting recovery nodes
  async mutateRoadmap(workspaceId: string, topicId: string, attemptNumber: number): Promise<any> {
    // check if mutation already exists
    const existing = await prisma.roadmapMutation.findFirst({
      where: {
        workspaceId,
        topicId,
        active: true,
      },
    });

    if (existing) {
      return JSON.parse(existing.mutatedNodesJson);
    }

    // fetch current roadmap nodes
    const roadmap = await prisma.roadmap.findFirst({
      where: { workspaceId },
      include: { nodes: true },
    });

    if (!roadmap) {
      throw new Error("roadmap not found for this workspace");
    }

    const originalNodes = roadmap.nodes.sort((a, b) => a.sequenceOrder - b.sequenceOrder);
    
    // inject recovery nodes directly after the failed topic assessment node
    const mutatedNodes: any[] = [];
    for (const node of originalNodes) {
      mutatedNodes.push(node);
      if (node.topicId === topicId) {
        mutatedNodes.push({
          id: `recovery-node-${topicId}-${attemptNumber}`,
          roadmapId: roadmap.id,
          topicId,
          type: "RECOVERY_NODE",
          status: "UNLOCKED",
          title: `Recovery Assessment - Attempt ${attemptNumber}`,
          sequenceOrder: node.sequenceOrder + 1,
        });
      }
    }

    // save mutation to database
    await prisma.roadmapMutation.create({
      data: {
        workspaceId,
        topicId,
        originalNodesJson: JSON.stringify(originalNodes),
        mutatedNodesJson: JSON.stringify(mutatedNodes),
        active: true,
      },
    });

    return mutatedNodes;
  }

  // resolve current roadmap nodes for failed workspace
  async getActiveRoadmap(workspaceId: string): Promise<any> {
    const mutation = await prisma.roadmapMutation.findFirst({
      where: {
        workspaceId,
        active: true,
      },
    });

    if (mutation) {
      return JSON.parse(mutation.mutatedNodesJson);
    }

    // fallback to original static roadmap if no mutation is active
    const roadmap = await prisma.roadmap.findFirst({
      where: { workspaceId },
      include: { nodes: { orderBy: { sequenceOrder: "asc" } } },
    });

    return roadmap ? roadmap.nodes : [];
  }

  // deactivate mutation after user passes recovery quiz
  async completeRecovery(workspaceId: string, topicId: string): Promise<void> {
    await prisma.roadmapMutation.updateMany({
      where: {
        workspaceId,
        topicId,
        active: true,
      },
      data: {
        active: false,
      },
    });
  }
}

export const roadmapEngine = new RoadmapEngine();
