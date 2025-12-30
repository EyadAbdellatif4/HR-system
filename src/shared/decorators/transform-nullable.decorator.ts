import { Transform } from 'class-transformer';

/**
 * Transforms empty strings, undefined, or null to null
 * Useful for optional fields that should be null instead of empty strings
 */
export function TransformNullable() {
  return Transform(({ value }) =>
    value === '' || value === undefined || value === null ? null : value,
  );
}

