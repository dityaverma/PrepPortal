import { apiHandler, successResponse } from "@/common/errors";
import { getUserContext } from "@/common/auth-helper";
import { aiProvider } from "@/lib/ai";

export const POST = apiHandler(async (req: Request) => {
  getUserContext(req);
  
  const body = await req.json();
  const query = body.query;
  const history = body.chat_history || [];
  
  const aiResponse = await aiProvider.chat(query, history);
  return successResponse(aiResponse, "Chat assistant response generated successfully");
});
