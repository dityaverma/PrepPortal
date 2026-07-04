/**
 * HTTP Query Parsing & Pagination Helper Utilities
 * 
 * Extracts and maps query variables (e.g. search term, page, limit, sorting direction)
 * from URL strings to standard structures consumed by Repositories and Services.
 */

export interface ParsedQuery {
  page: number;
  limit: number;
  skip: number;
  take: number;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

/**
 * Parses searchParams from an incoming HTTP request URL.
 * Normalizes bounds to prevent SQL query exceptions (e.g. negative skip/take limits).
 */
export function parseQueryParams(url: string, defaultSortBy = "createdAt"): ParsedQuery {
  const { searchParams } = new URL(url);
  
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
  const skip = (page - 1) * limit;
  const take = limit;
  
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || defaultSortBy;
  const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() === "asc" ? "asc" : "desc";

  return {
    page,
    limit,
    skip,
    take,
    search,
    sortBy,
    sortOrder,
  };
}

/**
 * Compiles paginated response metadata contracts returned to the client browser.
 */
export function getPaginationMeta(total: number, query: ParsedQuery) {
  const totalPages = Math.ceil(total / query.limit);
  return {
    page: query.page,
    limit: query.limit,
    total,
    totalPages,
  };
}

