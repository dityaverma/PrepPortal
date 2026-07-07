import { documentService } from "./service";
import { enforceRole } from "@/common/auth-helper";
import { successResponse, ValidationError } from "@/common/errors";

/**
 * Document Controller Layer
 * 
 * Handles incoming administration endpoints for PDF/DOC parsing.
 */
export class DocumentController {
  /**
   * Uploads and initiates parsing on the AI FastAPI Service.
   */
  async ingest(req: Request) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      throw new ValidationError("No document file uploaded.");
    }

    const data = await documentService.ingestDocument(file);
    return successResponse(data, "Job created successfully in AI Service", 202);
  }

  /**
   * Gets job parsing status details.
   */
  async getJob(req: Request, context: { params: Promise<{ id: string }> }) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    
    const { id } = await context.params;
    const data = await documentService.getJobStatus(id);
    return successResponse(data, "Job status retrieved successfully");
  }

  /**
   * Approves parsed entities, saving them to PostgreSQL and publishing to vectors.
   */
  async publish(req: Request, context: { params: Promise<{ id: string }> }) {
    enforceRole(req, ["ADMIN", "SUPER_ADMIN"]);
    
    const { id: jobId } = await context.params;
    const body = await req.json();
    const approvedData = body.approved_data;

    if (!approvedData) {
      throw new ValidationError("No approved data provided.");
    }

    const result = await documentService.publishJob(jobId, approvedData);
    return successResponse(result, "Relational data committed and vector publishing request forwarded");
  }
}

export const documentController = new DocumentController();
