import { DocumentRepository, documentRepository } from "./document-repository";
import { NotFoundError } from "@/common/errors";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

/**
 * Document Service Layer
 * 
 * Orchestrates communication with python FastAPI service and handles database ingestion.
 */
export class DocumentService {
  private repository: DocumentRepository;

  constructor(repository: DocumentRepository = documentRepository) {
    this.repository = repository;
  }

  /**
   * Forwards a multipart file upload to the AI Service for ingestion.
   */
  async ingestDocument(file: File) {
    const outgoingFormData = new FormData();
    outgoingFormData.append("file", file, file.name);

    const aiRes = await fetch(`${AI_SERVICE_URL}/api/documents/ingest`, {
      method: "POST",
      body: outgoingFormData,
    });
    
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI Service returned error: ${errText}`);
    }
    
    return aiRes.json();
  }

  /**
   * Retrieves ingestion job status from the AI Service.
   */
  async getJobStatus(jobId: string) {
    const aiRes = await fetch(`${AI_SERVICE_URL}/api/documents/jobs/${jobId}`, {
      method: "GET",
    });
    
    if (aiRes.status === 404) {
      throw new NotFoundError("Job not found in AI Service.");
    }
    
    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`AI Service returned error: ${errText}`);
    }
    
    return aiRes.json();
  }

  /**
   * Commits the approved ingestion results to PostgreSQL and updates the vector store.
   */
  async publishJob(jobId: string, approvedData: any) {
    // 1. Relational Database Transaction
    const relationalResult = await this.repository.publishRelationalData(approvedData);

    // 2. FastAPI Vector Store Finalization
    try {
      const aiRes = await fetch(`${AI_SERVICE_URL}/api/documents/jobs/${jobId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved_data: approvedData }),
      });
      
      if (!aiRes.ok) {
        const errText = await aiRes.text();
        console.error(`AI service failed to publish vectors: ${errText}`);
      }
    } catch (err) {
      console.error("AI service vector publishing failed:", err);
    }

    return {
      success: true,
      relational: relationalResult,
      jobId,
    };
  }
}

export const documentService = new DocumentService();
