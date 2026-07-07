import { RoadmapRepository, roadmapRepository } from "./repository";
import { NotFoundError } from "@/common/errors";
import { workspaceRepository } from "../workspace/repository";

/**
 * Roadmap Service Layer
 * 
 * Manages operations for user topic progression roadmaps.
 */
export class RoadmapService {
  private repository: RoadmapRepository;

  constructor(repository: RoadmapRepository = roadmapRepository) {
    this.repository = repository;
  }

  /**
   * Fetches the user's roadmap. If it does not exist, initialize a new roadmap
   * mapping all existing topics and assigning LOCKED/UNLOCKED status based on prerequisites.
   */
  async getOrCreateRoadmap(userId: string, workspaceId: string) {
    // 1. Verify workspace ownership and authorization
    const ws = await workspaceRepository.findById(workspaceId, userId);
    if (!ws) {
      throw new NotFoundError("Workspace not found or unauthorized");
    }

    // 2. Find existing roadmap
    let roadmap = await this.repository.findRoadmapByWorkspaceId(workspaceId);

    // 3. If no roadmap exists, create it
    if (!roadmap) {
      roadmap = await this.repository.createRoadmapWithNodes(workspaceId);
    }

    return roadmap;
  }
}

export const roadmapService = new RoadmapService();
