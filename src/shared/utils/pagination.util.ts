/**
 * Calculate offset from page and limit
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Offset value for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

/**
 * Calculate total pages from total count and limit
 * @param total - Total number of items
 * @param limit - Number of items per page
 * @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 * Get pagination metadata
 * @param total - Total number of items
 * @param page - Current page number
 * @param limit - Number of items per page
 * @returns Pagination metadata object
 */
export function getPaginationMetadata(
  total: number,
  page: number,
  limit: number
) {
  return {
    total,
    page,
    limit,
    totalPages: calculateTotalPages(total, limit),
  };
}

/**
 * Get default pagination values
 * @param page - Page number from request (optional)
 * @param limit - Limit from request (optional)
 * @returns Object with page and limit (with defaults applied)
 */
export function getPaginationParams(
  page?: number,
  limit?: number
): { page: number; limit: number } {
  return {
    page: page && page > 0 ? page : 1,
    limit: limit && limit > 0 && limit <= 100 ? limit : 10,
  };
}

