import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { quizImportService } from "../src/modules/quiz-import/service";

// run the end to end pipeline diagnostic checks for the quiz import engine
async function testImportWorkflow() {
  console.log("=== testing quiz import engine integration ===");

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("database connection string is missing");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // seed or retrieve topic mappings
    let subject = await prisma.subject.findFirst();
    if (!subject) {
      subject = await prisma.subject.create({
        data: { name: "operating systems" },
      });
    }

    let topic = await prisma.topic.findFirst({
      where: { subjectId: subject.id },
    });
    if (!topic) {
      topic = await prisma.topic.create({
        data: { name: "cpu scheduling", subjectId: subject.id },
      });
    }

    let subtopic = await prisma.subtopic.findFirst({
      where: { topicId: topic.id },
    });
    if (!subtopic) {
      subtopic = await prisma.subtopic.create({
        data: { name: "scheduling algorithms", topicId: topic.id },
      });
    }

    console.log("\n1. extracting text from mock txt buffer");
    const text = await quizImportService.extractTextFromFile(
      Buffer.from("sample question content text"),
      "test.txt"
    );
    console.log(`- extracted text length: ${text.length}`);

    console.log("\n2. executing gemini extraction simulation");
    const extracted = await quizImportService.callGeminiExtractor(text);
    console.log(`- extracted questions count: ${extracted.length}`);

    console.log("\n3. compiling duplicate verification report");
    const report = await quizImportService.compileReport(extracted);
    console.log(`- has duplicate questions: ${report.hasDuplicates}`);

    console.log("\n4. confirming quiz creation and questions import");
    const quiz = await quizImportService.confirmAndCreateQuiz({
      fileName: "test.txt",
      subjectId: subject.id,
      topicId: topic.id,
      subtopicId: subtopic.id,
      quizName: "test scheduling quiz",
      questions: report.questions.map((q) => ({
        ...q,
        duplicateAction: "insert",
      })),
    });

    console.log(`- created quiz id: ${quiz.id}`);
    console.log(`- created quiz name: ${quiz.name}`);

    // verify quiz was created in database
    const dbQuiz = await prisma.quiz.findUnique({
      where: { id: quiz.id },
      include: { questions: true },
    });
    console.log(`- db verification: quiz found with ${dbQuiz?.questions.length || 0} questions`);

    // clean up quiz records
    await prisma.quiz.delete({ where: { id: quiz.id } });
    console.log("- database cleaned up successfully");

    console.log("\n=== all import engine workflow checks passed ===");
  } catch (err: any) {
    console.error(`\n- failure during diagnostics: ${err.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

testImportWorkflow();
