/**
 * Work Location enum for users
 */
export enum WorkLocation {
  IN_OFFICE = 'in-office',
  HYBRID = 'hybrid',
  REMOTE = 'remote',
}

/**
 * User Role enum (re-exported from shared for consistency)
 * Note: RoleName enum exists in shared/enums, but this provides a cleaner API
 */
export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

