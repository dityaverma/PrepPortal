import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

/**
 * Test Assessment Repository Layer
 * 
 * Manages database reads and writes for mock tests, questions retrieval, and attempts logs.
 */
export class TestRepository {
  /**
   * Finds a test by ID, including nested questions, choices, and workspace details.
   */
  async findById(id: string) {
    return prisma.test.findUnique({
      where: { id },
      include: {
        workspace: true,
        questions: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
          orderBy: { sequenceOrder: "asc" },
        },
      },
    });
  }

  /**
   * Fetches questions matching specific search filters.
   */
  async findQuestions(whereClause: any) {
    return prisma.question.findMany({
      where: whereClause,
      include: {
        options: true,
      },
    });
  }

  /**
   * Creates a Test entry and inserts nested questions mapping entries.
   */
  async createTestWithQuestions(workspaceId: string, topicId: string, selectedQuestions: any[]) {
    return prisma.$transaction(async (tx) => {
      const test = await tx.test.create({
        data: {
          workspaceId,
          topicId,
          status: "STARTED",
        },
      });

      await tx.testQuestion.createMany({
        data: selectedQuestions.map((q, idx) => ({
          testId: test.id,
          questionId: q.id,
          sequenceOrder: idx + 1,
        })),
      });

      return tx.test.findUnique({
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
                    },
                  },
                },
              },
            },
            orderBy: { sequenceOrder: "asc" },
          },
        },
      });
    });
  }

  /**
   * Exposes standard Prisma transaction execution wrapper to service layers.
   */
  async runTransaction<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
    return prisma.$transaction(fn);
  }
}

export const testRepository = new TestRepository();
