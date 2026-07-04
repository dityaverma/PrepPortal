import { prisma } from "@/lib/prisma";
import { apiHandler, successResponse } from "@/common/errors";
import { enforceRole } from "@/common/auth-helper";

export const GET = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);

  const [users, workspaces, subjects, topics, questions] = await Promise.all([
    prisma.user.count(),
    prisma.workspace.count({ where: { archived: false } }),
    prisma.subject.count(),
    prisma.topic.count(),
    prisma.question.count(),
  ]);

  return successResponse({
    systemStatus: "HEALTHY",
    counts: {
      users,
      workspaces,
      subjects,
      topics,
      questions,
    },
    version: "1.0.0",
    engine: "Adaptive Placement Learning Engine v1",
  }, "System administrative metadata loaded");
});
