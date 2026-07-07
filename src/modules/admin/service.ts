import { prisma } from "@/lib/prisma";

/**
 * Admin Service Layer
 * 
 * Manages administrative metrics, counts, and system status metadata.
 */
export class AdminService {
  /**
   * Fetches metadata for system administration (total users, active workspaces, catalog counts).
   */
  async getSystemMetadata() {
    const [users, workspaces, subjects, topics, questions] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count({ where: { archived: false } }),
      prisma.subject.count(),
      prisma.topic.count(),
      prisma.question.count(),
    ]);

    return {
      systemStatus: "HEALTHY",
      counts: {
        users,
        workspaces,
        subjects,
        topics,
        questions,
      },
      version: "1.0.0",
      engine: "Adaptive Placement Learning Engine v1",
    };
  }
}

export const adminService = new AdminService();
