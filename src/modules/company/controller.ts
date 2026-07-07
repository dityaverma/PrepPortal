import { companyService } from "./service";
import { CreateCompanySchema, UpdateCompanySchema } from "./dto";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { successResponse } from "@/common/errors";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

/**
 * Company Controller Layer
 * 
 * Exposes endpoints to query, create, update, and remove placement prep companies.
 */
export class CompanyController {
  /**
   * Retrieves a paginated list of companies.
   */
  async list(req: Request) {
    getUserContext(req);
    const query = parseQueryParams(req.url, "name");
    const { items, total } = await companyService.list(query);
    return successResponse(items, "Companies retrieved successfully", 200, getPaginationMeta(total, query));
  }

  /**
   * Creates a new company record. ADMIN/SUPER_ADMIN only.
   */
  async create(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = CreateCompanySchema.parse(body);
    const company = await companyService.create(parsed);
    return successResponse(company, "Company created successfully", 201);
  }

  /**
   * Retrieves details of a specific company.
   */
  async getById(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    getUserContext(req);
    const company = await companyService.getById(id);
    return successResponse(company, "Company details retrieved successfully");
  }

  /**
   * Updates company metadata. ADMIN/SUPER_ADMIN only.
   */
  async update(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const body = await req.json();
    const parsed = UpdateCompanySchema.parse(body);
    const company = await companyService.update(id, parsed);
    return successResponse(company, "Company updated successfully");
  }

  /**
   * Deletes a company record. ADMIN/SUPER_ADMIN only.
   */
  async delete(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id } = await context.params;
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    const result = await companyService.delete(id);
    return successResponse(result, "Company deleted successfully");
  }
}

export const companyController = new CompanyController();
