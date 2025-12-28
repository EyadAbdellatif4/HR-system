/**
 * Role Names enum
 */
export enum RoleName {
  ADMIN = 'admin',
  USER = 'user',
}

/**
 * Response Messages enum
 */
export enum ResponseMessage {
  // Auth
  USER_REGISTERED = 'User registered successfully',
  USER_LOGGED_IN = 'User logged in successfully',
  
  // Employees
  EMPLOYEE_CREATED = 'Employee created successfully',
  ADMIN_EMPLOYEE_CREATED = 'Admin employee created successfully',
  EMPLOYEE_UPDATED = 'Employee updated successfully',
  EMPLOYEE_DELETED = 'Employee deactivated successfully',
  EMPLOYEE_RETRIEVED = 'Employee retrieved successfully',
  EMPLOYEES_RETRIEVED = 'Employees retrieved successfully',
  
  // Roles
  ROLE_CREATED = 'Role created successfully',
  ROLE_UPDATED = 'Role updated successfully',
  ROLE_DELETED = 'Role deactivated successfully',
  ROLE_RETRIEVED = 'Role retrieved successfully',
  ROLES_RETRIEVED = 'Roles retrieved successfully',
  
}

/**
 * Default Values enum
 */
export const DefaultValues = {
  IS_ACTIVE: true,
  IS_INACTIVE: false,
} as const;

/**
 * Validation Patterns enum
 */
export enum ValidationPattern {
  NAME = '^[a-zA-Z\\s]+$',
  INVOICE_NUMBER = '^[A-Z0-9-_]+$',
  PHONE_NUMBER = '^\\+?[1-9]\\d{1,14}$',
  ROLE_NAME = '^[a-zA-Z_]+$',
}

/**
 * Error Messages enum
 */
export enum ErrorMessage {
  // Validation
  NAME_REQUIRED = 'Name is required',
  EMAIL_REQUIRED = 'Email is required',
  USERNAME_REQUIRED = 'Username is required',
  USER_NUMBER_REQUIRED = 'User number is required',
  PASSWORD_REQUIRED = 'Password is required',
  ADDRESS_REQUIRED = 'Address is required',
  WORK_LOCATION_REQUIRED = 'Work location is required',
  JOIN_DATE_REQUIRED = 'Join date is required',
  SOCIAL_INSURANCE_REQUIRED = 'Social insurance status is required',
  MEDICAL_INSURANCE_REQUIRED = 'Medical insurance status is required',
  TITLE_ID_REQUIRED = 'Title ID is required',
  DEPARTMENT_ID_REQUIRED = 'Department ID is required',
  ROLE_NAME_REQUIRED = 'Role name is required',
  
  // Type validation
  NAME_MUST_BE_STRING = 'Name must be a string',
  EMAIL_MUST_BE_STRING = 'Email must be a string',
  USERNAME_MUST_BE_STRING = 'Username must be a string',
  USER_NUMBER_MUST_BE_STRING = 'User number must be a string',
  PASSWORD_MUST_BE_STRING = 'Password must be a string',
  ADDRESS_MUST_BE_STRING = 'Address must be a string',
  WORK_LOCATION_MUST_BE_ENUM = 'Work location must be one of "in-office", "hybrid", "remote"',
  JOIN_DATE_MUST_BE_DATE = 'Join date must be a valid date string',
  SOCIAL_INSURANCE_MUST_BE_BOOLEAN = 'Social insurance must be a boolean value',
  MEDICAL_INSURANCE_MUST_BE_BOOLEAN = 'Medical insurance must be a boolean value',
  TITLE_ID_MUST_BE_UUID = 'Title ID must be a valid UUID',
  DEPARTMENT_ID_MUST_BE_UUID = 'Department ID must be a valid UUID',
  ROLE_NAME_MUST_BE_STRING = 'Role name must be a string',
  IS_ACTIVE_MUST_BE_BOOLEAN = 'is_active must be a boolean value',
  
  // Length validation
  NAME_MIN_LENGTH = 'Name must be at least 3 characters long',
  NAME_MAX_LENGTH = 'Name cannot exceed 100 characters',
  EMAIL_MAX_LENGTH = 'Email cannot exceed 50 characters',
  USERNAME_MAX_LENGTH = 'Username cannot exceed 255 characters',
  PASSWORD_MIN_LENGTH = 'Password must be at least 6 characters long',
  PASSWORD_MAX_LENGTH = 'Password cannot exceed 255 characters',
  ROLE_NAME_MIN_LENGTH = 'Role name must be at least 2 characters long',
  ROLE_NAME_MAX_LENGTH = 'Role name cannot exceed 50 characters',
  
  // Format validation
  EMAIL_INVALID = 'Please provide a valid email address',
  
  // Not Found
  EMPLOYEE_NOT_FOUND = 'Employee not found',
  ROLE_NOT_FOUND = 'Role not found',
  TITLE_NOT_FOUND = 'Title not found',
  DEPARTMENT_NOT_FOUND = 'Department not found',
  DEFAULT_USER_ROLE_NOT_FOUND = 'Default user role not found',
  DEFAULT_ADMIN_ROLE_NOT_FOUND = 'Default admin role not found',
  
  // Conflicts
  EMAIL_EXISTS = 'Employee with this email already exists',
  USERNAME_EXISTS = 'User with this username already exists',
  USER_NUMBER_EXISTS = 'User with this user number already exists',
  NAME_EMAIL_EXISTS = 'Employee with this email or name already exists',
  ROLE_NAME_EXISTS = 'Role with this name already exists',
  
  // Authentication
  ACCESS_TOKEN_REQUIRED = 'Access token is required',
  INVALID_USER_ROLE = 'Invalid user role',
  INSUFFICIENT_PERMISSIONS = 'Insufficient permissions',
  INVALID_CREDENTIALS = 'Invalid credentials',
  USER_NOT_ACTIVE = 'User is not active',
  INVALID_OR_EXPIRED_TOKEN = 'Invalid or expired token',
  
  // General
  INVALID_UUID_FORMAT = 'Invalid UUID format',
}
