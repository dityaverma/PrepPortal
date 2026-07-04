/**
 * Company Repository Layer
 * 
 * Performs database query operations via Prisma to manage preparation companies.
 */

import { prisma } from "@/lib/prisma";
import { CreateCompanyInput, UpdateCompanyInput } from "./dto";
import { ParsedQuery } from "@/common/query-helper";

export class CompanyRepository {
  /**
   * Retrieves a single company record by ID.
   */
  async findById(id: string) {
    return prisma.company.findUnique({
      where: { id },
    });
  }

  /**
   * Retrieves a single company record by name (used for unique constraints).
   */
  async findByName(name: string) {
    return prisma.company.findUnique({
      where: { name },
    });
  }

  /**
   * Creates a new company record in the database.
   */
  async create(data: CreateCompanyInput) {
    return prisma.company.create({
      data: {
        name: data.name,
        logo: data.logo || null,
        themeColor: data.themeColor || null,
        description: data.description || null,
        active: data.active,
      },
    });
  }

  /**
   * Updates an existing company record by its ID.
   */
  async update(id: string, data: UpdateCompanyInput) {
    return prisma.company.update({
      where: { id },
      data,
    });
  }

  /**
   * Hard deletes a company record.
   */
  async delete(id: string) {
    return prisma.company.delete({
      where: { id },
    });
  }

  /**
   * Retrieves a paginated, sorted, and filtered list of companies.
   */
  async findMany(query: ParsedQuery) {
    const where: any = {};
    
    // Case-insensitive search on name and description fields
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip: query.skip,
        take: query.take,
        orderBy: { [query.sortBy]: query.sortOrder },
      }),
      prisma.company.count({ where }),
    ]);

    return { items, total };
  }
}

export const companyRepository = new CompanyRepository();

