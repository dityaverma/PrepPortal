import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { bookmarkService } from "@/modules/bookmark/service";

export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const { userId } = getUserContext(req);
  const result = await bookmarkService.remove(userId, id);
  return successResponse(result, "Bookmark removed successfully");
});
