import { quizImportService } from "./service";
import { enforceRole } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";
import { prisma } from "@/lib/prisma";

// controller managing administrative imports of quiz documents
export class QuizImportController {
  // handle raw file upload and text parsing
  async upload(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      throw new ValidationError("no file uploaded");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extractedText = await quizImportService.extractTextFromFile(buffer, file.name);

    // save history state to database
    const history = await prisma.importHistory.create({
      data: {
        fileName: file.name,
        fileType: file.name.split(".").pop() || "unknown",
        extractedCount: 0,
        status: "UPLOADED",
        validationReport: JSON.stringify({ length: extractedText.length }),
      },
    });

    return successResponse(
      { historyId: history.id, fileName: file.name, text: extractedText },
      "file uploaded and parsed successfully"
    );
  }

  // execute gemini prompt to get structured json questions
  async extract(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { text, fileName } = body;

    if (!text) {
      throw new ValidationError("extracted text is missing");
    }

    const questions = await quizImportService.callGeminiExtractor(text);
    const report = await quizImportService.compileReport(questions);

    // update import history with extracted status
    if (fileName) {
      await prisma.importHistory.updateMany({
        where: { fileName, status: "UPLOADED" },
        data: {
          extractedCount: questions.length,
          status: "EXTRACTED",
        },
      });
    }

    return successResponse(report, "quiz questions extracted successfully");
  }

  // validate preview state on client request
  async preview(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { questions } = body;

    if (!Array.isArray(questions)) {
      throw new ValidationError("questions array is required");
    }

    const report = await quizImportService.compileReport(questions);
    return successResponse(report, "quiz questions preview updated successfully");
  }

  // save quiz and populate options from admin confirm request
  async createQuiz(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const { fileName, subjectId, topicId, subtopicId, quizName, questions } = body;

    if (!subjectId || !topicId || !subtopicId || !quizName || !questions) {
      throw new ValidationError("missing required parameters");
    }

    const quiz = await quizImportService.confirmAndCreateQuiz({
      fileName: fileName || "imported-quiz.csv",
      subjectId,
      topicId,
      subtopicId,
      quizName,
      questions,
    });

    return successResponse(quiz, "quiz created and questions imported successfully");
  }

  // list import execution history logs
  async getHistory(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const history = await prisma.importHistory.findMany({
      orderBy: { createdAt: "desc" },
    });
    return successResponse(history, "import history retrieved successfully");
  }
}

export const quizImportController = new QuizImportController();
