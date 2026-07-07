import { apiHandler } from "@/common/errors";
import { documentController } from "@/modules/document/controller";

export const POST = apiHandler(async (req: Request) => {
  return documentController.ingest(req);
});
