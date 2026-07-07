import { studyLinkService } from "./service";
import { CreateStudyLinkSchema, UpdateStudyLinkSchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";

/**
 * Study Link Controller Layer
 * 
 * Handles incoming requests for managing learning resource links.
 */
export class StudyLinkController {
  /**
   * Lists study links by subtopic ID.
   */
  async list(req: Request) {
    getUserContext(req);
    const { searchParams } = new URL(req.url);
    const subtopicId = searchParams.get("subtopicId");

    if (!subtopicId) {
      throw new ValidationError("subtopicId query parameter is required");
    }

    const studyLinks = await studyLinkService.list(subtopicId);
    return successResponse(studyLinks, "Study links retrieved successfully");
  }

  /**
   * Creates a new study link. Only ADMIN/SUPER_ADMIN.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateStudyLinkSchema.parse(body);
    const studyLink = await studyLinkService.create(parsed);
    return successResponse(studyLink, "Study link created successfully", 201);
  }

  /**
   * Updates an existing study link. Only ADMIN/SUPER_ADMIN.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateStudyLinkSchema.parse(body);
    const studyLink = await studyLinkService.update(id, parsed);
    return successResponse(studyLink, "Study link updated successfully");
  }

  /**
   * Deletes a study link by ID. Only ADMIN/SUPER_ADMIN.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await studyLinkService.delete(id);
    return successResponse(result, "Study link deleted successfully");
  }
}

export const studyLinkController = new StudyLinkController();
