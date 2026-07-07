import { questionService } from "./service";
import { CreateQuestionSchema, UpdateQuestionSchema, BulkImportSchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * Question Controller Layer
 * 
 * Exposes actions to query questions, add questions singly/in bulk, and update/remove records.
 */
export class QuestionController {
  /**
   * Retrieves a paginated and filtered list of questions.
   */
  async list(req: Request) {
    getUserContext(req);
    const { searchParams } = new URL(req.url);
    
    const filters = {
      subjectId: searchParams.get("subjectId") || undefined,
      topicId: searchParams.get("topicId") || undefined,
      subtopicId: searchParams.get("subtopicId") || undefined,
      difficulty: searchParams.get("difficulty") || undefined,
      questionType: searchParams.get("questionType") || undefined,
      companyId: searchParams.get("companyId") || undefined,
    };

    const query = parseQueryParams(req.url, "text");
    const { items, total } = await questionService.list(query, filters);
    return successResponse(items, "Questions retrieved successfully", 200, getPaginationMeta(total, query));
  }

  /**
   * Creates a single question record. ADMIN/SUPER_ADMIN only.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateQuestionSchema.parse(body);
    const question = await questionService.create(parsed);
    return successResponse(question, "Question created successfully", 201);
  }

  /**
   * Retrieves details of a specific question.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    getUserContext(req);
    const question = await questionService.getById(id);
    return successResponse(question, "Question details retrieved successfully");
  }

  /**
   * Updates an existing question. ADMIN/SUPER_ADMIN only.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateQuestionSchema.parse(body);
    const question = await questionService.update(id, parsed);
    return successResponse(question, "Question updated successfully");
  }

  /**
   * Deletes a question record by ID. ADMIN/SUPER_ADMIN only.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await questionService.delete(id);
    return successResponse(result, "Question deleted successfully");
  }

  /**
   * Performs bulk import of questions. ADMIN/SUPER_ADMIN only.
   */
  async bulkImport(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = BulkImportSchema.parse(body);
    const result = await questionService.bulkImport(parsed);
    return successResponse(result, `Successfully imported ${result.length} questions`, 201);
  }
}

export const questionController = new QuestionController();
