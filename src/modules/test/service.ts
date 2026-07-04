/**
 * Test Assessment Engine Service
 * 
 * Manages the lifecycle of mock tests and assessments for users:
 * 1. Test Generation: Randomizes questions based on topics and difficulties, with fallback search rules.
 * 2. Submission & Grading: Automatically grades student choices, updates test nodes, records attempt logs.
 * 3. Learning State Machine: Updates roadmap node statuses (LOCKED ➔ UNLOCKED ➔ COMPLETED/FAILED)
 *    and dynamically unlocks child nodes by satisfying multi-prerequisite relationships.
 * 4. Analytics Aggregation: Dynamically updates weak/strong topic designations.
 */

import { prisma } from "@/lib/prisma";
import { CreateTestInput, SubmitTestInput } from "./dto";
import { NotFoundError, ValidationError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";

export class TestService {
  
  /**
   * Generates a new customized mock test for a student workspace.
   * 
   * Design Decisions:
   * - Fallback Mechanics: If a user selects target preparation companies (e.g. Google, Amazon), 
   *   we first search for questions mapped to those companies. If none exist, we strip the 
   *   company filter and fetch general questions to avoid empty-test generation failures.
   * - Security Isolation: Correct answers are stripped from the response sent to the browser
   *   to prevent students from reading the raw JSON payload to bypass the test.
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

    // Perform query to search matching questions
    let questions = await prisma.question.findMany({
      where: whereClause,
      include: {
        options: true,
      },
    });

    // Fallback: If no company questions matched, load general questions on this topic
    if (questions.length === 0 && companyIds.length > 0) {
      delete whereClause.companies;
      questions = await prisma.question.findMany({
        where: whereClause,
        include: {
          options: true,
        },
      });
    }

    if (questions.length === 0) {
      throw new ValidationError("No questions found for the specified topic and filters.");
    }

    // Randomize the list order and slice based on limit settings
    const randomized = questions.sort(() => 0.5 - Math.random());
    const selected = randomized.slice(0, data.limit);

    // 4. Create the Test entity inside a database transaction to ensure atomicity
    return prisma.$transaction(async (tx) => {
      const test = await tx.test.create({
        data: {
          workspaceId: data.workspaceId,
          topicId: data.topicId,
          status: "STARTED",
        },
      });

      // Insert mappings for all test questions with order sequences
      await tx.testQuestion.createMany({
        data: selected.map((q, idx) => ({
          testId: test.id,
          questionId: q.id,
          sequenceOrder: idx + 1,
        })),
      });

      // Fetch the created test package. HIDE correct answer boolean/values from response
      const testWithQuestions = await tx.test.findUnique({
        where: { id: test.id },
        include: {
          questions: {
            include: {
              question: {
                include: {
                  options: {
                    select: {
                      id: true,
                      text: true,
                      value: true,
                      // isCorrect is purposely omitted to prevent answer spoofing
                    },
                  },
                },
              },
            },
            orderBy: { sequenceOrder: "asc" },
          },
        },
      });

      return testWithQuestions;
    });
  }

  /**
   * Processes test answer sheet submissions, grades the choices, and logs outcomes.
   * 
   * Design Decisions:
   * - Atomic Transactions: Evaluating test questions, logging attempts, updating roadmap statuses,
   *   and compiling analytics are grouped inside a single Prisma `$transaction`. If any operation fails,
   *   the DB rolls back to protect consistency.
   */
  async submitTest(userId: string, testId: string, data: SubmitTestInput) {
    // 1. Load the target test record with question keys
    const test = await prisma.test.findUnique({
      where: { id: testId },
      include: {
        workspace: true,
        questions: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!test) {
      throw new NotFoundError("Test not found");
    }

    // Verify workspace permissions
    if (test.workspace.userId !== userId) {
      throw new NotFoundError("Workspace unauthorized");
    }

    if (test.status === "SUBMITTED") {
      throw new ValidationError("Test has already been submitted");
    }

    // 2. Create index mapping of student answers
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

    // Execute evaluations and writes inside a Prisma Transaction
    await prisma.$transaction(async (tx) => {
      for (const tq of test.questions) {
        const studentAns = answersMap.get(tq.questionId) || "";
        // Strict evaluation of case-insensitive trimmed strings
        const isCorrect = studentAns.trim().toLowerCase() === tq.question.correctAnswer.trim().toLowerCase();
        
        if (isCorrect) {
          correctCount++;
        }

        // Save student response to mapping table
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

      // Compute grade percentages. Standard pass threshold is 75%
      const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
      const passed = score >= 75.0;

      // Update parent Test status
      await tx.test.update({
        where: { id: testId },
        data: {
          score,
          passed,
          status: "SUBMITTED",
          timeSpent: data.timeSpent,
        },
      });

      // Record a persistent Attempt entry
      await tx.attempt.create({
        data: {
          workspaceId: test.workspaceId,
          testId: test.id,
          score,
          passed,
        },
      });

      // 3. Roadmap Unlock engine updates
      if (passed) {
        await this.handleTopicCompletion(tx, test.workspaceId, test.topicId);
      } else {
        await this.handleTopicFailure(tx, test.workspaceId, test.topicId);
      }

      // 4. Trigger analytics re-calculation
      await this.updateAnalytics(tx, test.workspaceId);

      return {
        score,
        passed,
        correctCount,
        totalQuestions,
        evaluation: evaluationResults,
      };
    });

    // Re-fetch the updated assessment object with standard parameters
    return prisma.test.findUnique({
      where: { id: testId },
      include: {
        questions: {
          include: {
            question: true,
          },
          orderBy: { sequenceOrder: "asc" },
        },
      },
    });
  }

  /**
   * Updates state variables upon topic completion.
   * Traverses prerequisites to see if any child topics can now be unlocked.
   */
  private async handleTopicCompletion(tx: any, workspaceId: string, topicId: string) {
    // Locate the roadmap container
    const roadmap = await tx.roadmap.findFirst({
      where: { workspaceId },
    });

    if (roadmap) {
      // 1. Mark target roadmap node as COMPLETED
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

      // 2. Identify all topics listing this topic as a prerequisite
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

      // 3. For each dependent topic, verify if all other prerequisites are also completed
      for (const dep of dependents) {
        const prereqIds = dep.topic.prerequisites.map((p: any) => p.prerequisiteId);
        
        // Count how many prerequisites are marked COMPLETED in this workspace
        const completedCount = await tx.roadmapNode.count({
          where: {
            roadmapId: roadmap.id,
            topicId: { in: prereqIds },
            status: "COMPLETED",
          },
        });

        // If the count of completed prerequisites matches required prerequisite count, unlock it!
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

    // 4. Update the Workspace overall progress metrics
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

  /**
   * Updates state variables upon topic failure.
   * Assigns a 'FAILED' status code to trigger recovery queues or recommendations.
   */
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

  /**
   * Re-calculates and caches computed metrics inside the Analytics table.
   * Compiles average test scores, attempts count, and flags strong/weak areas based on attempt results.
   */
  private async updateAnalytics(tx: any, workspaceId: string) {
    // Fetch all logged test attempts for this workspace
    const attempts = await tx.attempt.findMany({
      where: { workspaceId },
    });

    const count = attempts.length;
    const avgScore = count > 0 ? attempts.reduce((acc: number, curr: any) => acc + curr.score, 0) / count : 0;

    // Detect strong and weak topics
    // Decision Rule:
    // - Strong Topic: The student's latest test attempt resulted in a passing score.
    // - Weak Topic: The student's latest test attempt resulted in a failing score.
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

    // Cache compiled metrics in the Analytics database row
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

