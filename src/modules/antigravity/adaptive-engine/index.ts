import { prisma } from "@/lib/prisma";
import { weaknessEngine, QuestionMetadata } from "../weakness-engine";
import { retryEngine, RecoveryAction } from "../retry-engine";
import { recoveryEngine } from "../recovery-engine";
import { roadmapEngine } from "../roadmap-engine";
import { masteryEngine } from "../mastery-engine";
import { antigravityCache } from "../cache";
import { antigravityWorkers } from "../workers";

// main adaptive engine orchestrator coordinating quiz evaluation pathways
export class AdaptiveEngine {
  // run weakness analysis and schedule recovery or mastery paths
  async analyzeAssessmentAttempt(input: {
    userId: string;
    workspaceId: string;
    role: string;
    selectedCompanies: string[];
    subject: string;
    subjectId: string;
    topic: string;
    topicId: string;
    score: number;
    wrongQuestionIds: string[];
    questionMetadata: QuestionMetadata[];
  }) {
    // only trigger antigravity pipeline if student score is below seventy five percent
    if (input.score >= 75) {
      // clear any active roadmap mutations when user passes
      await roadmapEngine.completeRecovery(input.workspaceId, input.topicId);
      const activeRoadmap = await roadmapEngine.getActiveRoadmap(input.workspaceId);
      
      return {
        passed: true,
        action: "NONE",
        roadmap: activeRoadmap,
      };
    }

    // analyze incorrect questions to find learning gaps
    const analysis = await weaknessEngine.analyze(
      input.wrongQuestionIds,
      input.questionMetadata
    );

    // store weak concepts count
    for (const concept of analysis.weakConcepts) {
      await prisma.weakConcept.upsert({
        where: {
          workspaceId_topicId_concept: {
            workspaceId: input.workspaceId,
            topicId: input.topicId,
            concept,
          },
        },
        create: {
          workspaceId: input.workspaceId,
          topicId: input.topicId,
          concept,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });
    }

    // store weak patterns count
    for (const pattern of analysis.weakPatterns) {
      await prisma.weakPattern.upsert({
        where: {
          workspaceId_topicId_pattern: {
            workspaceId: input.workspaceId,
            topicId: input.topicId,
            pattern,
          },
        },
        create: {
          workspaceId: input.workspaceId,
          topicId: input.topicId,
          pattern,
          count: 1,
        },
        update: {
          count: { increment: 1 },
        },
      });
    }

    // determine next action based on previous attempt count
    const { attemptNumber, action } = await retryEngine.determineNextAction(
      input.workspaceId,
      input.topicId
    );

    // log recommendation history
    await prisma.recommendationHistory.create({
      data: {
        workspaceId: input.workspaceId,
        topicId: input.topicId,
        attemptNumber,
        recommendationType: action,
      },
    });

    let generatedQuiz: any = null;

    if (action === RecoveryAction.RECOVERY_QUIZ) {
      const cacheKey = antigravityCache.makeKey(
        input.workspaceId,
        input.topicId,
        `attempt-${attemptNumber}`
      );
      const cachedQuiz = await antigravityCache.get(cacheKey);

      if (cachedQuiz) {
        generatedQuiz = JSON.parse(cachedQuiz);
      } else {
        // generate a new recovery quiz using gemini provider
        generatedQuiz = await recoveryEngine.generateAndStoreQuiz({
          ...input,
          attemptNumber,
          weakConcepts: analysis.weakConcepts,
          weakPatterns: analysis.weakPatterns,
          questionTypes: analysis.weakQuestionTypes,
          difficulty: "MEDIUM",
        });

        // cache generated quiz response
        await antigravityCache.set(cacheKey, JSON.stringify(generatedQuiz));
      }

      // queue notification alert and metrics updating jobs
      await antigravityWorkers.queueNotification({
        userId: input.userId,
        title: "recovery quiz generated",
        message: "your custom recovery quiz is ready to study",
      });
    } else {
      // generate static database quiz for mastery mode
      const staticQuestions = await masteryEngine.getStaticMasteryQuiz(
        input.topicId,
        analysis.weakConcepts
      );

      // store mastery concept metrics
      for (const concept of analysis.weakConcepts) {
        await prisma.conceptMastery.upsert({
          where: {
            workspaceId_topicId_concept: {
              workspaceId: input.workspaceId,
              topicId: input.topicId,
              concept,
            },
          },
          create: {
            workspaceId: input.workspaceId,
            topicId: input.topicId,
            concept,
            masteryScore: 0.0,
          },
          update: {},
        });
      }

      generatedQuiz = {
        isMastery: true,
        questions: staticQuestions,
      };

      await antigravityWorkers.queueNotification({
        userId: input.userId,
        title: "mastery mode enabled",
        message: "complete the static mastery test to proceed",
      });
    }

    // queue background analytics update
    await antigravityWorkers.queueAnalyticsUpdate({
      workspaceId: input.workspaceId,
    });

    // mutate active roadmap nodes for the current workspace
    const mutatedRoadmap = await roadmapEngine.mutateRoadmap(
      input.workspaceId,
      input.topicId,
      attemptNumber
    );

    return {
      passed: false,
      action,
      quiz: generatedQuiz,
      roadmap: mutatedRoadmap,
    };
  }
}

export const adaptiveEngine = new AdaptiveEngine();
