import { prisma } from "@/lib/prisma";
import { CreateSubjectInput, UpdateSubjectInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";

/**
 * Subject Repository Layer
 * 
 * Interacts directly with the PostgreSQL database via Prisma client
 * to manage curriculum Subject records.
 */
export class SubjectRepository {
  
  /**
   * Resolves a subject by its unique UUID.
   */
  async findById(id: string) {
    return prisma.subject.findUnique({
      where: { id },
    });
  }

  /**
   * Resolves a subject by its unique case-sensitive name.
   */
  async findByName(name: string) {
    return prisma.subject.findUnique({
      where: { name },
    });
  }

  /**
   * Persists a new Subject record to the database.
   */
  async create(data: CreateSubjectInput) {
    return prisma.subject.create({
      data,
    });
  }

  /**
   * Updates fields of an existing Subject record.
   */
  async update(id: string, data: UpdateSubjectInput) {
    return prisma.subject.update({
      where: { id },
      data,
    });
  }

  /**
   * Permanently deletes a Subject record from the database.
   */
  async delete(id: string) {
    return prisma.subject.delete({
      where: { id },
    });
  }

  /**
   * Fetches paginated, sorted, and filtered lists of Subjects.
   */
  async findMany(query: ParsedQuery) {
    const where: any = {};
    
    // Add case-insensitive search parameters if queries contain text criteria
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Execute list retrieval and count query concurrently to optimize execution latency
    const [items, total] = await Promise.all([
      prisma.subject.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.subject.count({ where }),
    ]);

    return { items, total };
  }
}

export const subjectRepository = new SubjectRepository();

