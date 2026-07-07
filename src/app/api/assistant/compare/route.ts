import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { aiProvider } from "@/lib/ai";

export const POST = apiHandler(async (req: Request) => {
  getUserContext(req);
  
  const body = await req.json();
  const companyA = body.company_a;
  const companyB = body.company_b;
  
  const aiResponse = await aiProvider.compare(companyA, companyB);
  return successResponse(aiResponse, "Company comparison report generated successfully");
});
