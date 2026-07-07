import { subjectService } from "./service";
import { CreateSubjectSchema, UpdateSubjectSchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * Subject Controller Layer
 * 
 * Exposes endpoints to query, create, update, and delete Subjects in the master catalog.
 */
export class SubjectController {
  /**
   * Retrieves a paginated list of subjects.
   */
  async list(req: Request) {
    getUserContext(req);
    const query = parseQueryParams(req.url, "name");
    const { items, total } = await subjectService.list(query);
    return successResponse(items, "Subjects retrieved successfully", 200, getPaginationMeta(total, query));
  }

  /**
   * Creates a new subject catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateSubjectSchema.parse(body);
    const subject = await subjectService.create(parsed);
    return successResponse(subject, "Subject created successfully", 201);
  }

  /**
   * Retrieves details of a specific subject.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    getUserContext(req);
    const subject = await subjectService.getById(id);
    return successResponse(subject, "Subject details retrieved successfully");
  }

  /**
   * Updates an existing subject. ADMIN/SUPER_ADMIN only.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateSubjectSchema.parse(body);
    const subject = await subjectService.update(id, parsed);
    return successResponse(subject, "Subject updated successfully");
  }

  /**
   * Deletes a subject catalog entry. ADMIN/SUPER_ADMIN only.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await subjectService.delete(id);
    return successResponse(result, "Subject deleted successfully");
  }
}

export const subjectController = new SubjectController();
