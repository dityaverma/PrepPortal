import { prisma } from "@/lib/prisma";
import { apiHandler, successResponse, NotFoundError } from "@/common/errors";
import { enforceRole } from "@/common/auth-helper";
import { StudyLinkInputSchema } from "@/modules/subtopic/dto";

const UpdateStudyLinkSchema = StudyLinkInputSchema.partial();

async function getStudyLinkOrThrow(id: string) {
  const link = await prisma.studyLink.findUnique({ where: { id } });
  if (!link) {
    throw new NotFoundError("Study link not found");
  }
  return link;
}

export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  await getStudyLinkOrThrow(id);
  
  const body = await req.json();
  const parsed = UpdateStudyLinkSchema.parse(body);

  const studyLink = await prisma.studyLink.update({
    where: { id },
    data: parsed,
  });

  return successResponse(studyLink, "Study link updated successfully");
});

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  await getStudyLinkOrThrow(id);

  await prisma.studyLink.delete({
    where: { id },
  });

  return successResponse({ id, deleted: true }, "Study link deleted successfully");
});
