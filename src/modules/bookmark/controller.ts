import { bookmarkService } from "./service";
import { CreateBookmarkSchema } from "./dto";
import { getUserContext } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";

/**
 * Bookmark Controller Layer
 * 
 * Routes request parsing, schema checks and invokes bookmark interactions.
 */
export class BookmarkController {
  /**
   * Lists all bookmarks within a workspace.
   */
  async list(req: Request) {
    const { userId } = getUserContext(req);
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get("workspaceId");
    
    if (!workspaceId) {
      throw new ValidationError("workspaceId query parameter is required");
    }

    const bookmarks = await bookmarkService.list(userId, workspaceId);
    return successResponse(bookmarks, "Bookmarks retrieved successfully");
  }

  /**
   * Adds a new bookmark to a workspace.
   */
  async add(req: Request) {
    const { userId } = getUserContext(req);
    const body = await req.json();
    const parsed = CreateBookmarkSchema.parse(body);
    
    const bookmark = await bookmarkService.add(userId, parsed);
    return successResponse(bookmark, "Item bookmarked successfully", 201);
  }

  /**
   * Removes a bookmark from a workspace by ID.
   */
  async remove(req: Request, context: { params: Promise<{ id: string }> }) {
    const { userId } = getUserContext(req);
    const { id } = await context.params;
    const result = await bookmarkService.remove(userId, id);
    return successResponse(result, "Bookmark removed successfully");
  }
}

export const bookmarkController = new BookmarkController();
