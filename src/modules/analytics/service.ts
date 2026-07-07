import { AnalyticsRepository, analyticsRepository } from "./repository";
import { NotFoundError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";
import { Topic } from "@/generated/prisma/client";

/**
 * Analytics Service Layer
 * 
 * Aggregates statistics, course progression metrics, and learning insights.
 */
export class AnalyticsService {
  private repository: AnalyticsRepository;

  constructor(repository: AnalyticsRepository = analyticsRepository) {
    this.repository = repository;
  }

  /**
   * Compiles diagnostic analytics and curriculum completions for a student workspace.
   */
  async getStudentAnalytics(userId: string, workspaceId: string) {
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    const analytics = await this.repository.findAnalyticsByWorkspaceId(workspaceId);
    const progress = await this.repository.findProgressByWorkspaceId(workspaceId);

    const subjects = await this.repository.findSubjectsWithTopics();
    const subjectProgress = [];

    for (const sub of subjects) {
      const topicIds = sub.topics.map((t: Topic) => t.id);
      const totalCount = topicIds.length;
      let completedCount = 0;

      if (totalCount > 0) {
        completedCount = await this.repository.countCompletedRoadmapNodes(workspaceId, topicIds);
      }

      subjectProgress.push({
        subjectId: sub.id,
        subjectName: sub.name,
        completionPercentage: totalCount > 0 ? (completedCount / totalCount) * 100 : 0,
      });
    }

    return {
      workspaceId,
      totalProgress: progress?.completionPercentage || 0,
      completedTopicsCount: progress?.completedTopicsCount || 0,
      attemptsCount: analytics?.attemptsCount || 0,
      averageScore: analytics?.averageScore || 0,
      weakTopics: analytics?.weakTopicsJson ? JSON.parse(analytics.weakTopicsJson) : [],
      strongTopics: analytics?.strongTopicsJson ? JSON.parse(analytics.strongTopicsJson) : [],
      subjectProgress,
      studyStreakPlaceholder: 5,
      companyReadinessPlaceholder: 82.5,
    };
  }

  /**
   * Compiles global metrics for administrative dashboards.
   */
  async getAdminAnalytics() {
    const usersCount = await this.repository.countUsers();
    const workspacesCount = await this.repository.countActiveWorkspaces();
    const questionsCount = await this.repository.countQuestions();

    const difficulties = ["EASY", "MEDIUM", "HARD"];
    const difficultyDistribution: Record<string, number> = {};
    for (const diff of difficulties) {
      difficultyDistribution[diff] = await this.repository.countQuestionsByDifficulty(diff);
    }

    const types = [
      "THEORY", "SCENARIO", "DEBUG", "OUTPUT_PREDICTION",
      "INTERVIEW", "DIAGRAM", "ORDERING", "MATCHING"
    ];
    const typeDistribution: Record<string, number> = {};
    for (const t of types) {
      typeDistribution[t] = await this.repository.countQuestionsByType(t);
    }

    const subjects = await this.repository.findSubjectsWithTopicCount();
    const subjectDistribution = subjects.map((sub) => ({
      name: sub.name,
      topicsCount: sub._count.topics,
    }));

    const topics = await this.repository.findAllTopics();
    const failureList = [];
    for (const t of topics) {
      const failedCount = await this.repository.countFailedAttemptsByTopicId(t.id);
      if (failedCount > 0) {
        failureList.push({
          topicName: t.name,
          failedAttemptsCount: failedCount,
        });
      }
    }

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
