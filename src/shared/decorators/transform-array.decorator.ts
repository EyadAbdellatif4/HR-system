import { Transform } from 'class-transformer';

/**
 * Transform decorator for handling arrays in multipart/form-data
 * Handles: JSON strings, comma-separated strings, or already arrays
 * Returns undefined for empty values to allow optional fields
 */
export function TransformArray() {
  return Transform(({ value }) => {
    // Return undefined for empty/null/undefined values
    if (!value || value === '' || value === null || value === undefined) {
      return undefined;
    }
    
    // If already an array, return it (filter empty strings)
    if (Array.isArray(value)) {
      const filtered = value.filter(item => item !== '' && item !== null && item !== undefined);
      return filtered.length > 0 ? filtered : undefined;
    }
    
    // If string, try to parse
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed === '' || trimmed === '[]' || trimmed === 'null') {
        return undefined;
      }
      
      // Try to parse as JSON first
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          const filtered = parsed.filter(item => item !== '' && item !== null && item !== undefined);
          return filtered.length > 0 ? filtered : undefined;
        }
        return [parsed];
      } catch {
        // If not JSON, try comma-separated
        const items = trimmed.split(',').map(item => item.trim()).filter(item => item);
        return items.length > 0 ? items : undefined;
      }
    }
    
    return [value];
  });
}

