import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { companyService } from "@/modules/company/service";
import { UpdateCompanySchema } from "@/modules/company/dto";

/**
 * GET /api/companies/[id]
 * 
 * Fetches detail metadata for a target preparation company.
 */
export const GET = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  getUserContext(req); // Enforce active session
  const company = await companyService.getById(id);
  return successResponse(company, "Company details retrieved successfully");
});

/**
 * PUT /api/companies/[id]
 * 
 * Updates targeted metadata fields for a preparation company (restricted to ADMIN/SUPER_ADMIN).
 */
export const PUT = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = UpdateCompanySchema.parse(body);
  const company = await companyService.update(id, parsed);
  return successResponse(company, "Company updated successfully");
});

/**
 * DELETE /api/companies/[id]
 * 
 * Removes a target preparation company from the master catalog (restricted to ADMIN/SUPER_ADMIN).
 */
export const DELETE = apiHandler(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const result = await companyService.delete(id);
  return successResponse(result, "Company deleted successfully");
});

