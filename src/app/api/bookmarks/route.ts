import { apiHandler, successResponse, ValidationError } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { bookmarkService } from "@/modules/bookmark/service";
import { CreateBookmarkSchema } from "@/modules/bookmark/dto";

export const GET = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId");
  
  if (!workspaceId) {
    throw new ValidationError("workspaceId query parameter is required");
  }

  const bookmarks = await bookmarkService.list(userId, workspaceId);
  return successResponse(bookmarks, "Bookmarks retrieved successfully");
});

export const POST = apiHandler(async (req: Request) => {
  const { userId } = getUserContext(req);
  const body = await req.json();
  const parsed = CreateBookmarkSchema.parse(body);
  
  const bookmark = await bookmarkService.add(userId, parsed);
  return successResponse(bookmark, "Item bookmarked successfully", 201);
});
