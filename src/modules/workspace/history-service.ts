/**
 * Study History Service Layer
 * 
 * Manages tracking learning sessions and duration.
 * Provides APIs to record:
 * - Starting a study session on a subtopic / topic
 * - Ending a study session and calculating dynamic study durations
 * - Listing recent study history logs
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/common/errors";
import { workspaceRepository } from "./repository";

export class StudyHistoryService {
  /**
   * Starts a new study session in a student workspace.
   * Updates workspace's `lastActivityAt` progress timestamp.
   */
  async startSession(userId: string, workspaceId: string, data: { topicId?: string; subtopicId?: string }) {
    // Verify workspace ownership before starting a session
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // Update last activity timestamp on the progress record
    await prisma.progress.upsert({
      where: { workspaceId },
      create: { workspaceId, lastActivityAt: new Date() },
      update: { lastActivityAt: new Date() },
    });

    return prisma.studyHistory.create({
      data: {
        workspaceId,
        topicId: data.topicId || null,
        subtopicId: data.subtopicId || null,
        studyStart: new Date(),
      },
    });
  }

  /**
   * Ends an active study session.
   * Calculates duration in seconds.
   */
  async endSession(userId: string, workspaceId: string, historyId: string) {
    // Verify workspace ownership
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    const session = await prisma.studyHistory.findFirst({
      where: { id: historyId, workspaceId },
    });

    if (!session) {
      throw new NotFoundError("Study session not found");
    }

    const studyEnd = new Date();
    // Compute elapsed duration in seconds
    const duration = Math.round((studyEnd.getTime() - session.studyStart.getTime()) / 1000);

    return prisma.studyHistory.update({
      where: { id: historyId },
      data: {
        studyEnd,
        duration: duration > 0 ? duration : 0,
      },
    });
  }

  /**
   * Lists all past study history sessions in descending chronological order.
   */
  async listSessions(userId: string, workspaceId: string) {
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    return prisma.studyHistory.findMany({
      where: { workspaceId },
      orderBy: { studyStart: "desc" },
    });
  }
}

export const studyHistoryService = new StudyHistoryService();

