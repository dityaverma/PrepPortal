import { prisma } from "@/lib/prisma";

/**
 * Document Repository Layer
 * 
 * Manages database write operations/transactions for processed AI documents.
 */
export class DocumentRepository {
  /**
   * Commits the approved parsed document data to the PostgreSQL database.
   * Runs inside an atomic transaction.
   */
  async publishRelationalData(approvedData: any) {
    return prisma.$transaction(async (tx) => {
      // A. Match or create Company
      const company = await tx.company.upsert({
        where: { name: approvedData.company_name },
        update: {
          description: approvedData.description || undefined,
        },
        create: {
          name: approvedData.company_name,
          description: approvedData.description || "Placement target company",
        },
      });

      // B. Verify or create default Subject for categorizing placement prep
      const subject = await tx.subject.upsert({
        where: { name: "Placement Preparation" },
        update: {},
        create: {
          name: "Placement Preparation",
          description: "General curriculum catalog for placement interview prep",
        },
      });

      // C. Insert Topics and Subtopics
      const topicMappings: Record<string, string> = {};
      const subtopicMappings: Record<string, string> = {};

      const topicsList = approvedData.topics || [];
      for (const t of topicsList) {
        const topicName = typeof t === "string" ? t : t.name;
        const topicObj = await tx.topic.upsert({
          where: {
            subjectId_name: {
              subjectId: subject.id,
              name: topicName,
            },
          },
          update: {},
          create: {
            subjectId: subject.id,
            name: topicName,
            description: "Auto-extracted during document ingestion",
          },
        });
        topicMappings[topicName.toLowerCase()] = topicObj.id;

        // Create a default subtopic for clean relation mapping
        const subtopicObj = await tx.subtopic.upsert({
          where: {
            topicId_name: {
              topicId: topicObj.id,
              name: "General Practice",
            },
          },
          update: {},
          create: {
            topicId: topicObj.id,
            name: "General Practice",
          },
        });
        subtopicMappings[topicObj.id] = subtopicObj.id;
      }

      // D. Extract questions from rounds and independent sections
      const questionsToInsert: any[] = [];
      
      // Independent questions
      if (approvedData.independent_questions) {
        for (const q of approvedData.independent_questions) {
          questionsToInsert.push({ q, round: "General" });
        }
      }
      
      // Questions from rounds
      if (approvedData.hiring_process_rounds) {
        for (const r of approvedData.hiring_process_rounds) {
          if (r.questions) {
            for (const q of r.questions) {
              questionsToInsert.push({ q, round: r.round_name });
            }
          }
        }
      }

      // E. Save Questions
      const savedQuestions = [];
      for (const item of questionsToInsert) {
        const q = item.q;
        
        // Determine correct Topic/Subtopic link. Fallback to general topics
        let topicId = Object.values(topicMappings)[0] || "";
        if (q.topics && q.topics.length > 0) {
          const matchingTopicId = topicMappings[q.topics[0].toLowerCase()];
          if (matchingTopicId) topicId = matchingTopicId;
        }
        
        // If no topics existed, create one
        if (!topicId) {
          const defaultTopic = await tx.topic.upsert({
            where: {
              subjectId_name: {
                subjectId: subject.id,
                name: "General Placement Concepts",
              },
            },
            update: {},
            create: {
              subjectId: subject.id,
              name: "General Placement Concepts",
            },
          });
          topicId = defaultTopic.id;
          topicMappings["general placement concepts"] = topicId;
        }

        let subtopicId = subtopicMappings[topicId];
        if (!subtopicId) {
          const subtopicObj = await tx.subtopic.upsert({
            where: {
              topicId_name: {
                topicId,
                name: "General Practice",
              },
            },
            update: {},
            create: {
              topicId,
              name: "General Practice",
            },
          });
          subtopicId = subtopicObj.id;
          subtopicMappings[topicId] = subtopicId;
        }

        // Save question
        const questionRecord = await tx.question.create({
          data: {
            subjectId: subject.id,
            topicId,
            subtopicId,
            questionType: q.question_type || "Theory",
            text: q.description || q.title,
            correctAnswer: q.explanation || "Answer review pending verification",
            explanation: q.explanation || "",
            difficulty: q.difficulty || "Medium",
            companies: {
              create: {
                companyId: company.id
              }
            }
          }
        });
        savedQuestions.push(questionRecord);
      }

      return {
        company,
        questionsCount: savedQuestions.length,
      };
    });
  }
}

export const documentRepository = new DocumentRepository();
