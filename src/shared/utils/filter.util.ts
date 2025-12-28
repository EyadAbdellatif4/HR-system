import { Op, Sequelize, fn, col, cast } from 'sequelize';
import { WhereOptions } from 'sequelize';

/**
 * Filter configuration for a field
 */
export interface FilterFieldConfig {
  type: 'text' | 'date' | 'dateRange' | 'enum' | 'boolean' | 'exact';
  field: string;
  operator?: 'ILIKE' | 'LIKE' | '=' | '!=' | '>' | '<' | '>=' | '<=' | 'BETWEEN' | 'IN';
}

/**
 * Build Sequelize where clause from filter object
 * @param filters - Filter object with field values
 * @param config - Configuration mapping field names to filter types
 * @returns Sequelize where clause
 */
export function buildWhereClause(
  filters: Record<string, any>,
  config: Record<string, FilterFieldConfig>
): WhereOptions {
  const where: WhereOptions = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }

    const fieldConfig = config[key];
    if (!fieldConfig) {
      continue;
    }

    const { type, field, operator } = fieldConfig;

    switch (type) {
      case 'text':
        // Case-insensitive partial match using ILIKE
        where[field] = {
          [Op.iLike]: `%${value}%`,
        };
        break;

      case 'exact':
        // Exact match
        where[field] = value;
        break;

      case 'boolean':
        // Boolean exact match
        where[field] = value === 'true' || value === true;
        break;

      case 'enum':
        // Exact match for enum values
        where[field] = value;
        break;

      case 'date':
        // Single date - exact match on date (ignoring time)
        if (value) {
          const date = new Date(value);
          const startOfDay = new Date(date.setHours(0, 0, 0, 0));
          const endOfDay = new Date(date.setHours(23, 59, 59, 999));
          where[field] = {
            [Op.between]: [startOfDay, endOfDay],
          };
        }
        break;

      case 'dateRange':
        // Date range - expects object with 'from' and 'to' or separate 'fieldFrom' and 'fieldTo'
        if (typeof value === 'object' && (value.from || value.to)) {
          const conditions: any = {};
          if (value.from) {
            const fromDate = new Date(value.from);
            fromDate.setHours(0, 0, 0, 0);
            conditions[Op.gte] = fromDate;
          }
          if (value.to) {
            const toDate = new Date(value.to);
            toDate.setHours(23, 59, 59, 999);
            conditions[Op.lte] = toDate;
          }
          if (Object.keys(conditions).length > 0) {
            where[field] = conditions;
          }
        }
        break;

      default:
        // Default to exact match
        where[field] = value;
    }
  }

  return where;
}

/**
 * Build where clause for date range using separate from/to fields
 * @param fromValue - Start date value
 * @param toValue - End date value
 * @param field - Field name to filter
 * @returns Sequelize where clause condition or undefined
 */
export function buildDateRangeClause(
  fromValue: string | undefined,
  toValue: string | undefined,
  field: string
): WhereOptions | undefined {
  if (!fromValue && !toValue) {
    return undefined;
  }

  const conditions: any = {};

  if (fromValue) {
    // Parse YYYY-MM-DD format correctly
    // Create date in UTC to match database storage
    let fromDate: Date;
    if (typeof fromValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fromValue)) {
      // Parse as UTC date to avoid timezone issues
      const [year, month, day] = fromValue.split('-').map(Number);
      fromDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    } else {
      fromDate = new Date(fromValue);
      // Convert to UTC start of day
      fromDate = new Date(Date.UTC(
        fromDate.getUTCFullYear(),
        fromDate.getUTCMonth(),
        fromDate.getUTCDate(),
        0, 0, 0, 0
      ));
    }
    conditions[Op.gte] = fromDate;
  }

  if (toValue) {
    // Parse YYYY-MM-DD format correctly
    // Create date in UTC to match database storage
    let toDate: Date;
    if (typeof toValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(toValue)) {
      // Parse as UTC date to avoid timezone issues
      const [year, month, day] = toValue.split('-').map(Number);
      toDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
    } else {
      toDate = new Date(toValue);
      // Convert to UTC end of day
      toDate = new Date(Date.UTC(
        toDate.getUTCFullYear(),
        toDate.getUTCMonth(),
        toDate.getUTCDate(),
        23, 59, 59, 999
      ));
    }
    conditions[Op.lte] = toDate;
  }

  if (Object.keys(conditions).length === 0) {
    return undefined;
  }

  return { [field]: conditions };
}

/**
 * Build order clause from sort parameters
 * @param sortBy - Field to sort by
 * @param sortOrder - Sort direction ('ASC' | 'DESC')
 * @returns Array of [field, direction] for Sequelize order
 */
export function buildOrderClause(
  sortBy?: string,
  sortOrder?: 'ASC' | 'DESC'
): [string, 'ASC' | 'DESC'][] | undefined {
  if (!sortBy) {
    return undefined;
  }

  const order: 'ASC' | 'DESC' = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
  return [[sortBy, order]];
}

/**
 * Build search clause for general text search across multiple fields
 * @param searchTerm - Search term to match
 * @param fields - Array of field names to search in
 * @returns Sequelize OR condition for searching across multiple fields
 */
export function buildSearchClause(
  searchTerm: string | undefined,
  fields: string[]
): WhereOptions | undefined {
  if (!searchTerm || !fields || fields.length === 0) {
    return undefined;
  }

  const searchConditions = fields.map((field) => ({
    [field]: {
      [Op.iLike]: `%${searchTerm}%`,
    },
  }));

  return {
    [Op.or]: searchConditions,
  };
}

