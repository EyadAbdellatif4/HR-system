import { Transform } from 'class-transformer';

/**
 * Transforms string 'true'/'false' or boolean values to boolean
 * Used for form data and query parameters that come as strings
 */
export function TransformBoolean() {
  return Transform(({ value }) => {
    if (value === true || value === 'true') return true;
    if (value === false || value === 'false') return false;
    return value;
  });
}

