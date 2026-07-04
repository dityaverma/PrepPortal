/**
 * Analytics Service Layer
 * 
 * This module is responsible for aggregates, calculations, and progress reports.
 * It compiles stats for two distinct stakeholders:
 * 1. Students: Workspace-isolated topic and subject completions, test attempts, average scores.
 * 2. Admins: Global statistics on users, active workspaces, question database distribution, and high-frequency failed areas.
 */

import { prisma } from "@/lib/prisma";
import { NotFoundError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";
import { Topic } from "@prisma/client";

export class AnalyticsService {
  
  /**
   * Compiles diagnostic analytics and curriculum completions for a student workspace.
   * 
   * @param userId Logged-in student's user ID
   * @param workspaceId target workspace container ID
   * @returns Detailed dashboard analytics dataset
   */
  async getStudentAnalytics(userId: string, workspaceId: string) {
    // 1. Verify that the workspace exists and belongs to the requesting user
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // 2. Fetch pre-calculated static analytics metrics stored on the database
    const analytics = await prisma.analytics.findFirst({
      where: { workspaceId },
    });

    const progress = await prisma.progress.findUnique({
      where: { workspaceId },
    });

    // 3. Compute dynamic subject-level completion progress on-the-fly
    // We fetch subjects with their child topics to aggregate roadmap status
    const subjects = await prisma.subject.findMany({
      include: {
        topics: true,
      },
    });

    const subjectProgress = [];
    for (const sub of subjects) {
      // Map all topic IDs belonging to this subject
      const topicIds = sub.topics.map((t: Topic) => t.id);
      
      const totalCount = topicIds.length;
      let completedCount = 0;

      // Count roadmap nodes that are marked as 'COMPLETED' for this workspace and topics
      if (totalCount > 0) {
        completedCount = await prisma.roadmapNode.count({
          where: {
            roadmap: { workspaceId },
            topicId: { in: topicIds },
            status: "COMPLETED",
          },
        });
      }

      subjectProgress.push({
        subjectId: sub.id,
        subjectName: sub.name,
        completionPercentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
      });
    }

    // Return combined metrics
    return {
      workspaceId,
      totalProgress: progress?.completionPercentage || 0,
      completedTopicsCount: progress?.completedTopicsCount || 0,
      attemptsCount: analytics?.attemptsCount || 0,
      averageScore: analytics?.averageScore || 0,
      // Parse JSON storage columns safely
      weakTopics: analytics?.weakTopicsJson ? JSON.parse(analytics.weakTopicsJson) : [],
      strongTopics: analytics?.strongTopicsJson ? JSON.parse(analytics.strongTopicsJson) : [],
      subjectProgress,
      studyStreakPlaceholder: 5, // Placeholder metric for visual UI
      companyReadinessPlaceholder: 82.5, // Placeholder metric for visual UI
    };
  }

  /**
   * Compiles global metrics for administrative dashboards.
   * Pulls metrics on system users, question types, database balance, and learning failure hotspots.
   */
  async getAdminAnalytics() {
    const usersCount = await prisma.user.count();
    const workspacesCount = await prisma.workspace.count({
      where: { archived: false },
    });
    const questionsCount = await prisma.question.count();

    // 1. Calculate question distribution by difficulty tier
    const difficulties = ["EASY", "MEDIUM", "HARD"];
    const difficultyDistribution: Record<string, number> = {};
    for (const diff of difficulties) {
      difficultyDistribution[diff] = await prisma.question.count({
        where: { difficulty: diff },
      });
    }

    // 2. Calculate question distribution by type categorization
    const types = [
      "THEORY", "SCENARIO", "DEBUG", "OUTPUT_PREDICTION",
      "INTERVIEW", "DIAGRAM", "ORDERING", "MATCHING"
    ];
    const typeDistribution: Record<string, number> = {};
    for (const t of types) {
      typeDistribution[t] = await prisma.question.count({
        where: { questionType: t },
      });
    }

    // 3. Compile curriculum density map (how many topics are in each subject)
    const subjects = await prisma.subject.findMany({
      include: {
        _count: {
          select: { topics: true },
        },
      },
    });
    const subjectDistribution = subjects.map((sub) => ({
      name: sub.name,
      topicsCount: sub._count.topics,
    }));

    // 4. Identify most-failed topics across all user submissions (Failure Hotspots)
    const topics = await prisma.topic.findMany();
    const failureList = [];
    for (const t of topics) {
      const failedCount = await prisma.attempt.count({
        where: {
          test: { topicId: t.id },
          passed: false,
        },
      });
      if (failedCount > 0) {
        failureList.push({
          topicName: t.name,
          failedAttemptsCount: failedCount,
        });
      }
    }

    // Sort failed topics in descending order and slice the top 5
    const mostFailedTopics = failureList
      .sort((a, b) => b.failedAttemptsCount - a.failedAttemptsCount)
      .slice(0, 5);

    return {
      totalUsers: usersCount,
      activeWorkspaces: workspacesCount,
      totalQuestions: questionsCount,
      questionDifficultyDistribution: difficultyDistribution,
      questionTypeDistribution: typeDistribution,
      subjectDistribution,
      mostFailedTopics,
    };
  }
}

export const analyticsService = new AnalyticsService();

