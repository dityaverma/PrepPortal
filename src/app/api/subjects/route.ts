import { apiHandler } from "@/common/errors";
import { subjectController } from "@/modules/subject/controller";

export const GET = apiHandler(async (req: Request) => {
  return subjectController.list(req);
});

export const POST = apiHandler(async (req: Request) => {
  return subjectController.create(req);
});
