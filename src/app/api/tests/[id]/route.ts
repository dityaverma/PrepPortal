import { prisma } from "@/lib/prisma";
import { apiHandler, successResponse, NotFoundError } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";

export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);

  const test = await prisma.test.findUnique({
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

  if (!test) {
    throw new NotFoundError("Test not found");
  }

  if (test.workspace.userId !== userId) {
    throw new NotFoundError("Workspace unauthorized");
  }

  // Omit correct answers if test is still active/started
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
    
    return successResponse({ ...test, questions: safeQuestions }, "Active test details");
  }

  return successResponse(test, "Submitted test details");
});
