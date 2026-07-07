import { TestRepository, testRepository } from "./repository";
import { CreateTestInput, SubmitTestInput } from "./dto";
import { NotFoundError, ValidationError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";
import { adaptiveEngine } from "../antigravity/adaptive-engine";

/**
 * Test Assessment Engine Service
 * 
 * Coordinates test generation, random question picking, submission grading,
 * and updates progression roadmaps/workspace analytics metrics.
 */
export class TestService {
  private repository: TestRepository;

  constructor(repository: TestRepository = testRepository) {
    this.repository = repository;
  }

  /**
   * Generates a new customized mock test for a student workspace.
   */
  async createTest(userId: string, data: CreateTestInput) {
    // 1. Verify workspace ownership and authorization
    const ws = await workspaceRepository.findById(data.workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // 2. Load the companies mapped to this workspace
    const companyIds = ws.companies.map((c) => c.companyId);

    // 3. Compile the database search filters
    const whereClause: any = {
      topicId: data.topicId,
    };

    if (data.difficulty) {
      whereClause.difficulty = data.difficulty;
    }
    if (data.questionType) {
      whereClause.questionType = data.questionType;
    }

    // Apply company filters if the workspace is paired with prep companies
    if (companyIds.length > 0) {
      whereClause.companies = {
        some: {
          companyId: { in: companyIds },
        },
      };
    }

    // Perform query to search matching questions via repository
    let questions = await this.repository.findQuestions(whereClause);

    // Fallback: If no company questions matched, load general questions on this topic
    if (questions.length === 0 && companyIds.length > 0) {
      delete whereClause.companies;
      questions = await this.repository.findQuestions(whereClause);
    }

    if (questions.length === 0) {
      throw new ValidationError("No questions found for the specified topic and filters.");
    }

    // Randomize the list order and slice based on limit settings
    const randomized = questions.sort(() => 0.5 - Math.random());
    const selected = randomized.slice(0, data.limit);

    // 4. Create the Test entity inside database transaction via repository
    return this.repository.createTestWithQuestions(data.workspaceId, data.topicId, selected);
  }

  /**
   * Processes test answer sheet submissions, grades the choices, and logs outcomes.
   */
  async submitTest(userId: string, testId: string, data: SubmitTestInput) {
    // load the target test record with question keys
    const test = await this.repository.findById(testId);

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    // verify workspace permissions
    if (test.workspace.userId !== userId) {
      throw new NotFoundError("Workspace unauthorized");
    }

    if (test.status === "SUBMITTED") {
      throw new ValidationError("Test has already been submitted");
    }

    // create index mapping of student answers
    const answersMap = new Map(data.answers.map((a) => [a.questionId, a.studentAnswer]));
    let correctCount = 0;
    const totalQuestions = test.questions.length;

    const evaluationResults: Array<{
      questionId: string;
      text: string;
      studentAnswer: string;
      correctAnswer: string;
      isCorrect: boolean;
      explanation: string | null;
    }> = [];

    const wrongQuestionIds: string[] = [];
    const questionMetadata: any[] = [];

    // execute evaluations and writes inside a transaction via repository
    await this.repository.runTransaction(async (tx) => {
      for (const tq of test.questions) {
        const studentAns = answersMap.get(tq.questionId) || "";
        const isCorrect = studentAns.trim().toLowerCase() === tq.question.correctAnswer.trim().toLowerCase();
        
        if (isCorrect) {
          correctCount++;
        } else {
          wrongQuestionIds.push(tq.questionId);
          questionMetadata.push({
            id: tq.questionId,
            concept: tq.question.subtopic?.name || "general concept",
            pattern: "general pattern",
            questionType: tq.question.questionType,
            difficulty: tq.question.difficulty,
          });
        }

        await tx.testQuestion.update({
          where: { id: tq.id },
          data: {
            studentAnswer: studentAns,
            isCorrect,
          },
        });

        evaluationResults.push({
          questionId: tq.questionId,
          text: tq.question.text,
          studentAnswer: studentAns,
          correctAnswer: tq.question.correctAnswer,
          isCorrect,
          explanation: tq.question.explanation,
        });
      }

      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = score >= 75.0;

      await tx.test.update({
        where: { id: testId },
        data: {
          score,
          passed,
          status: "SUBMITTED",
          timeSpent: data.timeSpent,
        },
      });

      await tx.attempt.create({
        data: {
          workspaceId: test.workspaceId,
          testId: test.id,
          score,
          passed,
        },
      });

      if (passed) {
        await this.handleTopicCompletion(tx, test.workspaceId, test.topicId);
      } else {
        await this.handleTopicFailure(tx, test.workspaceId, test.topicId);
      }

      await this.updateAnalytics(tx, test.workspaceId);

      return {
        score,
        passed,
        correctCount,
        totalQuestions,
        evaluation: evaluationResults,
      };
    });

    const finalScore = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const finalPassed = finalScore >= 75.0;

    // only call adaptive engine if score is below seventy five percent
    if (!finalPassed) {
      await adaptiveEngine.analyzeAssessmentAttempt({
        userId,
        workspaceId: test.workspaceId,
        role: test.workspace.targetRole || "Software Engineer",
        selectedCompanies: test.workspace.companies?.map((c: any) => c.company.name) || [],
        subject: test.questions[0]?.question.subject.name || "Computer Science",
        subjectId: test.questions[0]?.question.subjectId || "",
        topic: test.questions[0]?.question.topic.name || "Algorithms",
        topicId: test.topicId,
        score: finalScore,
        wrongQuestionIds,
        questionMetadata,
      });
    }

    return this.repository.findById(testId);
  }

  /**
   * Retrieves active test or submitted test details with appropriate answer omissions.
   */
  async getTestDetails(userId: string, testId: string) {
    const test = await this.repository.findById(testId);

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    if (test.workspace.userId !== userId) {
      throw new NotFoundError("Workspace unauthorized");
    }

    if (test.status === "STARTED") {
      const safeQuestions = test.questions.map((q) => ({
        ...q,
        question: {
          ...q.question,
          correctAnswer: undefined,
          explanation: undefined,
          options: q.question.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            value: opt.value,
          })),
        },
      }));
      
      return { ...test, questions: safeQuestions };
    }

    return test;
  }

  private async handleTopicCompletion(tx: any, workspaceId: string, topicId: string) {
    const roadmap = await tx.roadmap.findFirst({
      where: { workspaceId },
    });

    if (roadmap) {
      await tx.roadmapNode.upsert({
        where: {
          roadmapId_topicId: { roadmapId: roadmap.id, topicId },
        },
        create: {
          roadmapId: roadmap.id,
          topicId,
          status: "COMPLETED",
        },
        update: {
          status: "COMPLETED",
        },
      });

      const dependents = await tx.topicPrerequisite.findMany({
        where: { prerequisiteId: topicId },
        include: {
          topic: {
            include: {
              prerequisites: true,
            },
          },
        },
      });

      for (const dep of dependents) {
        const prereqIds = dep.topic.prerequisites.map((p: any) => p.prerequisiteId);
        
        const completedCount = await tx.roadmapNode.count({
          where: {
            roadmapId: roadmap.id,
            topicId: { in: prereqIds },
            status: "COMPLETED",
          },
        });

        if (completedCount === prereqIds.length) {
          await tx.roadmapNode.upsert({
            where: {
              roadmapId_topicId: { roadmapId: roadmap.id, topicId: dep.topicId },
            },
            create: {
              roadmapId: roadmap.id,
              topicId: dep.topicId,
              status: "UNLOCKED",
            },
            update: {
              status: "UNLOCKED",
            },
          });
        }
      }
    }

    const completedTopics = await tx.roadmapNode.count({
      where: {
        roadmap: { workspaceId },
        status: "COMPLETED",
      },
    });

    const totalTopics = await tx.topic.count();

    await tx.progress.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        completedTopicsCount: completedTopics,
        completionPercentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
        lastActivityAt: new Date(),
      },
      update: {
        completedTopicsCount: completedTopics,
        completionPercentage: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
        lastActivityAt: new Date(),
      },
    });
  }

  private async handleTopicFailure(tx: any, workspaceId: string, topicId: string) {
    const roadmap = await tx.roadmap.findFirst({
      where: { workspaceId },
    });

    if (roadmap) {
      await tx.roadmapNode.upsert({
        where: {
          roadmapId_topicId: { roadmapId: roadmap.id, topicId },
        },
        create: {
          roadmapId: roadmap.id,
          topicId,
          status: "FAILED",
        },
        update: {
          status: "FAILED",
        },
      });
    }
  }

  private async updateAnalytics(tx: any, workspaceId: string) {
    const attempts = await tx.attempt.findMany({
      where: { workspaceId },
    });

    const count = attempts.length;
    const avgScore = count > 0 ? attempts.reduce((acc: number, curr: any) => acc + curr.score, 0) / count : 0;

    const topics = await tx.topic.findMany();
    const weakTopics: string[] = [];
    const strongTopics: string[] = [];

    for (const t of topics) {
      const latestAttempt = await tx.attempt.findFirst({
        where: {
          workspaceId,
          test: { topicId: t.id },
        },
        orderBy: { createdAt: "desc" },
      });

      if (latestAttempt) {
        if (latestAttempt.passed) {
          strongTopics.push(t.name);
        } else {
          weakTopics.push(t.name);
        }
      }
    }

    const progress = await tx.progress.findUnique({ where: { workspaceId } });

    await tx.analytics.upsert({
      where: { workspaceId },
      create: {
        workspaceId,
        totalProgress: progress?.completionPercentage || 0,
        attemptsCount: count,
        averageScore: avgScore,
        weakTopicsJson: JSON.stringify(weakTopics),
        strongTopicsJson: JSON.stringify(strongTopics),
      },
      update: {
        totalProgress: progress?.completionPercentage || 0,
        attemptsCount: count,
        averageScore: avgScore,
        weakTopicsJson: JSON.stringify(weakTopics),
        strongTopicsJson: JSON.stringify(strongTopics),
      },
    });
  }
}

export const testService = new TestService();
