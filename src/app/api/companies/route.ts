import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext, enforceRole } from "@/common/auth-helper";
import { companyService } from "@/modules/company/service";
import { CreateCompanySchema } from "@/modules/company/dto";
import { parseQueryParams, getPaginationMeta } from "@/common/query-helper";

export const GET = apiHandler(async (req: Request) => {
  // Any authenticated user can view the list of target companies
  getUserContext(req);
  const query = parseQueryParams(req.url, "name");
  const { items, total } = await companyService.list(query);
  return successResponse(items, "Companies retrieved successfully", 200, getPaginationMeta(total, query));
});

export const POST = apiHandler(async (req: Request) => {
  // Restrict modification to ADMIN and SUPER_ADMIN
  enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
  const body = await req.json();
  const parsed = CreateCompanySchema.parse(body);
  const company = await companyService.create(parsed);
  return successResponse(company, "Company created successfully", 201);
});
