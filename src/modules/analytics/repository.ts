import { prisma } from "@/lib/prisma";

/**
 * Analytics Repository Layer
 * 
 * Centralizes all database aggregations, counts, and queries related to metrics reporting.
 */
export class AnalyticsRepository {
  /**
   * Finds the analytics record for a workspace.
   */
  async findAnalyticsByWorkspaceId(workspaceId: string) {
    return prisma.analytics.findFirst({
      where: { workspaceId },
    });
  }

  /**
   * Finds the progress record for a workspace.
   */
  async findProgressByWorkspaceId(workspaceId: string) {
    return prisma.progress.findUnique({
      where: { workspaceId },
    });
  }

  /**
   * Retrieves all subjects, including their associated topics.
   */
  async findSubjectsWithTopics() {
    return prisma.subject.findMany({
      include: {
        topics: true,
      },
    });
  }

  /**
   * Counts completed roadmap nodes for a workspace and subset of topic IDs.
   */
  async countCompletedRoadmapNodes(workspaceId: string, topicIds: string[]) {
    return prisma.roadmapNode.count({
      where: {
        roadmap: { workspaceId },
        topicId: { in: topicIds },
        status: "COMPLETED",
      },
    });
  }

  /**
   * Counts total system users.
   */
  async countUsers() {
    return prisma.user.count();
  }

  /**
   * Counts active (non-archived) workspaces.
   */
  async countActiveWorkspaces() {
    return prisma.workspace.count({
      where: { archived: false },
    });
  }

  /**
   * Counts total questions.
   */
  async countQuestions() {
    return prisma.question.count();
  }

  /**
   * Counts questions by difficulty tier.
   */
  async countQuestionsByDifficulty(difficulty: string) {
    return prisma.question.count({
      where: { difficulty },
    });
  }

  /**
   * Counts questions by question type.
   */
  async countQuestionsByType(questionType: string) {
    return prisma.question.count({
      where: { questionType },
    });
  }

  /**
   * Finds subjects along with a count of their topics.
   */
  async findSubjectsWithTopicCount() {
    return prisma.subject.findMany({
      include: {
        _count: {
          select: { topics: true },
        },
      },
    });
  }

  /**
   * Finds all topics.
   */
  async findAllTopics() {
    return prisma.topic.findMany();
  }

  /**
   * Counts failed attempts for tests related to a specific topic ID.
   */
  async countFailedAttemptsByTopicId(topicId: string) {
    return prisma.attempt.count({
      where: {
        test: { topicId },
        passed: false,
      },
    });
  }
}

export const analyticsRepository = new AnalyticsRepository();
