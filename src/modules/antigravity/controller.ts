import { adaptiveEngine } from "./adaptive-engine";
import { roadmapEngine } from "./roadmap-engine";
import { getUserContext } from "@/common/auth-helper";
import { successResponse, ValidationError, NotFoundError } from "@/common/errors";
import { prisma } from "@/lib/prisma";

// controller managing adaptive api routing and payload execution
export class AdaptiveController {
  // handle score analysis and trigger next recovery step
  async analyze(req: Request) {
    const { userId } = getUserContext(req);
    const body = await req.json();

    const {
      workspaceId,
      subjectId,
      subject,
      topicId,
      topic,
      role,
      selectedCompanies,
      score,
      wrongQuestionIds,
      questionMetadata,
    } = body;

    if (!workspaceId || !topicId || score === undefined) {
      throw new ValidationError("missing required parameters");
    }

    const result = await adaptiveEngine.analyzeAssessmentAttempt({
      userId,
      workspaceId,
      role: role || "Software Engineer",
      selectedCompanies: selectedCompanies || [],
      subject: subject || "Computer Science",
      subjectId,
      topic: topic || "Algorithms",
      topicId,
      score,
      wrongQuestionIds: wrongQuestionIds || [],
      questionMetadata: wrongQuestionIds.map((id: string) => {
        const metadata = (questionMetadata || []).find((q: any) => q.id === id);
        return {
          id,
          concept: metadata?.concept || "general concept",
          pattern: metadata?.pattern || "general pattern",
          questionType: metadata?.questionType || "Theory",
          difficulty: metadata?.difficulty || "MEDIUM",
        };
      }),
    });

    return successResponse(result, "assessment attempt analyzed successfully");
  }

  // record recovery quiz attempt score
  async submitRecovery(req: Request) {
    getUserContext(req);
    const body = await req.json();

    const { quizId, workspaceId, score, answers } = body;

    if (!quizId || !workspaceId || score === undefined) {
      throw new ValidationError("missing required parameters");
    }

    const quiz = await prisma.recoveryQuiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundError("recovery quiz not found");
    }

    const passed = score >= 75;

    const attempt = await prisma.recoveryAttempt.create({
      data: {
        quizId,
        workspaceId,
        score,
        answersJson: JSON.stringify(answers || {}),
        passed,
      },
    });

    if (passed) {
      // deactivate the roadmap mutation when student passes
      await roadmapEngine.completeRecovery(workspaceId, quiz.topicId);
    }

    return successResponse({ attempt, passed }, "recovery attempt processed successfully");
  }

  // fetch active workspace roadmap including any mutations
  async getRoadmap(req: Request) {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const roadmap = await roadmapEngine.getActiveRoadmap(workspaceId);
    return successResponse(roadmap, "active workspace roadmap retrieved successfully");
  }

  // fetch mastery concept tracking values
  async getMastery(req: Request) {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const mastery = await prisma.conceptMastery.findMany({
      where: { workspaceId },
    });

    return successResponse(mastery, "concept mastery metrics retrieved successfully");
  }

  // reset retry attempt count for a topic to allow fresh evaluations
  async resetRetry(req: Request) {
    const body = await req.json();
    const { workspaceId, topicId } = body;

    if (!workspaceId || !topicId) {
      throw new ValidationError("missing required parameters");
    }

    // delete previous recovery quizzes to reset attempt count
    await prisma.recoveryQuiz.deleteMany({
      where: {
        workspaceId,
        topicId,
      },
    });

    await roadmapEngine.completeRecovery(workspaceId, topicId);

    return successResponse({ reset: true }, "retry counter reset completed successfully");
  }

  // fetch recommendation and attempt history log
  async getHistory(req: Request) {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const history = await prisma.recommendationHistory.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return successResponse(history, "recommendation history retrieved successfully");
  }
}

export const adaptiveController = new AdaptiveController();
