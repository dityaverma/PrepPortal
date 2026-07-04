import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { apiHandler, successResponse, ValidationError } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { StudyLinkInputSchema } from "@/modules/subtopic/dto";

const CreateStudyLinkSchema = StudyLinkInputSchema.extend({
  subtopicId: z.string().uuid("Invalid subtopic ID"),
});

export const GET = apiHandler(async (req: Request) => {
  getUserContext(req);
  const { searchParams } = new URL(req.url);
  const subtopicId = searchParams.get("subtopicId");

  if (!subtopicId) {
    throw new ValidationError("subtopicId query parameter is required");
  }

  const studyLinks = await prisma.studyLink.findMany({
    where: { subtopicId },
  });

  return successResponse(studyLinks, "Study links retrieved successfully");
});

export const POST = apiHandler(async (req: Request) => {
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateStudyLinkSchema.parse(body);

  const studyLink = await prisma.studyLink.create({
    data: {
      subtopicId: parsed.subtopicId,
      description: parsed.description || null,
      learningObjectives: parsed.learningObjectives || null,
      estimatedTime: parsed.estimatedTime || 0,
      prerequisites: parsed.prerequisites || null,
      gfgUrl: parsed.gfgUrl || null,
      officialDocUrl: parsed.officialDocUrl || null,
      additionalResources: parsed.additionalResources || null,
    },
  });

  return successResponse(studyLink, "Study link created successfully", 201);
});
