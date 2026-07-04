/**
 * Question Repository Layer
 * 
 * Interacts with PostgreSQL database using Prisma to query/update Questions.
 * Supports relational option creation, tag upserting, and multi-field query filters.
 */

import { prisma } from "@/lib/prisma";
import { CreateQuestionInput, UpdateQuestionInput, QuestionQueryParams } from "./dto";
import { ParsedQuery } from "@/common/query-helper";

export class QuestionRepository {
  /**
   * Retrieves a question by ID along with its multiple-choice options,
   * associated companies, and catalog tags.
   */
  async findById(id: string) {
    return prisma.question.findUnique({
      where: { id },
      include: {
        options: true,
        companies: {
          include: {
            company: true,
          },
        },
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  /**
   * Transactionally creates a Question record, mapping its options,
   * associated companies, and tag relations.
   */
  async create(data: CreateQuestionInput) {
    return prisma.$transaction(async (tx) => {
      const question = await tx.question.create({
        data: {
          subjectId: data.subjectId,
          topicId: data.topicId,
          subtopicId: data.subtopicId,
          questionType: data.questionType,
          text: data.text,
          explanation: data.explanation || null,
          correctAnswer: data.correctAnswer,
          difficulty: data.difficulty,
        },
      });

      // Insert question options (MCQ choices)
      if (data.options.length > 0) {
        await tx.questionOption.createMany({
          data: data.options.map((opt) => ({
            questionId: question.id,
            text: opt.text,
            value: opt.value,
            isCorrect: opt.isCorrect,
          })),
        });
      }

      // Link workspace companies to this question
      if (data.companyIds && data.companyIds.length > 0) {
        await tx.companyQuestionMapping.createMany({
          data: data.companyIds.map((cId) => ({
            questionId: question.id,
            companyId: cId,
          })),
        });
      }

      // Upsert tags dynamically and link them in the junction table
      if (data.tags && data.tags.length > 0) {
        for (const tagName of data.tags) {
          const tag = await tx.questionTag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          });
          await tx.questionQuestionTag.create({
            data: {
              questionId: question.id,
              tagId: tag.id,
            },
          });
        }
      }

      return tx.question.findUnique({
        where: { id: question.id },
        include: {
          options: true,
          companies: true,
          tags: true,
        },
      });
    });
  }

  /**
   * Transactionally updates a question.
   * Completely clears and recreates options, company maps, and tags if provided in input.
   */
  async update(id: string, data: UpdateQuestionInput) {
    return prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: {
          subjectId: data.subjectId,
          topicId: data.topicId,
          subtopicId: data.subtopicId,
          questionType: data.questionType,
          text: data.text,
          explanation: data.explanation,
          correctAnswer: data.correctAnswer,
          difficulty: data.difficulty,
        },
      });

      // Sync options (MCQ choices) if supplied
      if (data.options) {
        await tx.questionOption.deleteMany({ where: { questionId: id } });
        if (data.options.length > 0) {
          await tx.questionOption.createMany({
            data: data.options.map((opt) => ({
              questionId: id,
              text: opt.text,
              value: opt.value,
              isCorrect: opt.isCorrect,
            })),
          });
        }
      }

      // Sync mapped companies if supplied
      if (data.companyIds) {
        await tx.companyQuestionMapping.deleteMany({ where: { questionId: id } });
        if (data.companyIds.length > 0) {
          await tx.companyQuestionMapping.createMany({
            data: data.companyIds.map((cId) => ({
              questionId: id,
              companyId: cId,
            })),
          });
        }
      }

      // Sync associated tags if supplied
      if (data.tags) {
        await tx.questionQuestionTag.deleteMany({ where: { questionId: id } });
        for (const tagName of data.tags) {
          const tag = await tx.questionTag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {},
          });
          await tx.questionQuestionTag.create({
            data: {
              questionId: id,
              tagId: tag.id,
            },
          });
        }
      }

      return tx.question.findUnique({
        where: { id },
        include: {
          options: true,
          companies: true,
          tags: true,
        },
      });
    });
  }

  /**
   * Deletes a question record.
   */
  async delete(id: string) {
    return prisma.question.delete({
      where: { id },
    });
  }

  /**
   * Fetches paginated list of questions matching multiple curriculum, company, search, and type filters.
   */
  async findMany(query: ParsedQuery, filters: QuestionQueryParams) {
    const where: any = {};

    // Map exact query fields
    if (filters.subjectId) where.subjectId = filters.subjectId;
    if (filters.topicId) where.topicId = filters.topicId;
    if (filters.subtopicId) where.subtopicId = filters.subtopicId;
    if (filters.difficulty) where.difficulty = filters.difficulty;
    if (filters.questionType) where.questionType = filters.questionType;

    // Filter questions mapped to a specific company
    if (filters.companyId) {
      where.companies = {
        some: {
          companyId: filters.companyId,
        },
      };
    }

    // Text search filter
    if (query.search) {
      where.OR = [
        { text: { contains: query.search, mode: "insensitive" } },
        { explanation: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: {
          options: true,
          companies: {
            include: {
              company: true,
            },
          },
          tags: {
            include: {
              tag: true,
            },
          },
        },
      }),
      prisma.question.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Transactionally executes bulk importing of multiple questions.
   * Ensures atomic creation or rollback on error.
   */
  async bulkImport(questions: CreateQuestionInput[]) {
    return prisma.$transaction(async (tx) => {
      const results = [];
      for (const q of questions) {
        const question = await tx.question.create({
          data: {
            subjectId: q.subjectId,
            topicId: q.topicId,
            subtopicId: q.subtopicId,
            questionType: q.questionType,
            text: q.text,
            explanation: q.explanation || null,
            correctAnswer: q.correctAnswer,
            difficulty: q.difficulty,
          },
        });

        if (q.options.length > 0) {
          await tx.questionOption.createMany({
            data: q.options.map((opt) => ({
              questionId: question.id,
              text: opt.text,
              value: opt.value,
              isCorrect: opt.isCorrect,
            })),
          });
        }

        if (q.companyIds && q.companyIds.length > 0) {
          await tx.companyQuestionMapping.createMany({
            data: q.companyIds.map((cId) => ({
              questionId: question.id,
              companyId: cId,
            })),
          });
        }

        if (q.tags && q.tags.length > 0) {
          for (const tagName of q.tags) {
            const tag = await tx.questionTag.upsert({
              where: { name: tagName },
              create: { name: tagName },
              update: {},
            });
            await tx.questionQuestionTag.create({
              data: {
                questionId: question.id,
                tagId: tag.id,
              },
            });
          }
        }

        results.push(question);
      }
      return results;
    });
  }
}

export const questionRepository = new QuestionRepository();

