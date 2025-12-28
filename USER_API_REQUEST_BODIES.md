# User API Request Bodies

## 1. Create User (POST /users)

**Request Body:**
```json
{
  "user_number": "EMP001",
  "name": "John Doe",
  "address": "123 Main St, City, Country",
  "work_location": "hybrid",
  "social_insurance": true,
  "medical_insurance": true,
  "join_date": "2025-01-01",
  "contract_date": "2025-12-31",
  "exit_date": null,
  "role_id": "uuid-of-role",
  "title_id": "uuid-of-title",
  "phones": [
    {
      "number": "+1234567890",
      "company": "Verizon",
      "current_plan": "Unlimited Plan",
      "legal_owner": "John Doe",
      "comment": "Company provided phone",
      "is_active": true
    }
  ],
  "department_ids": ["uuid-of-department-1", "uuid-of-department-2"]
}
```

**Minimal Request Body (required fields only):**
```json
{
  "user_number": "EMP001",
  "name": "John Doe",
  "address": "123 Main St, City, Country",
  "work_location": "hybrid",
  "social_insurance": true,
  "medical_insurance": true,
  "join_date": "2025-01-01",
  "role_id": "uuid-of-role"
}
```

---

## 2. Get All Users (GET /users)

**Query Parameters:**
```
?page=1&limit=10&sortBy=createdAt&sortOrder=DESC&search=john&user_number=EMP001&name=John&work_location=hybrid&social_insurance=true&medical_insurance=true&role_id=uuid&title_id=uuid&department_id=uuid&joinDateFrom=2025-01-01&joinDateTo=2025-12-31
```

**Example Request:**
```
GET /users?page=1&limit=10&search=john&work_location=hybrid
```

**Response:**
```json
{
  "message": "Users retrieved successfully",
  "users": [...],
  "count": 10,
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5
}
```

---

## 3. Get User by ID (GET /users/:id)

**Request:**
```
GET /users/uuid-of-user
```

**Response:**
```json
{
  "message": "User retrieved successfully",
  "user": {
    "id": "uuid",
    "user_number": "EMP001",
    "name": "John Doe",
    "address": "123 Main St",
    "work_location": "hybrid",
    "social_insurance": true,
    "medical_insurance": true,
    "join_date": "2025-01-01",
    "contract_date": "2025-12-31",
    "exit_date": null,
    "role_id": "uuid",
    "title_id": "uuid",
    "role": {...},
    "title": {...},
    "phones": [...],
    "departments": [...]
  }
}
```

---

## 4. Update User (PATCH /users/:id)

**Request Body (all fields optional):**
```json
{
  "user_number": "EMP002",
  "name": "Jane Doe",
  "address": "456 Oak Ave, City, Country",
  "work_location": "remote",
  "social_insurance": false,
  "medical_insurance": true,
  "join_date": "2025-02-01",
  "contract_date": "2026-12-31",
  "exit_date": null,
  "role_id": "uuid-of-new-role",
  "title_id": "uuid-of-new-title",
  "department_ids": ["uuid-of-department-1"]
}
```

**Minimal Update (only change what you need):**
```json
{
  "name": "Jane Doe Updated",
  "work_location": "in-office"
}
```

**Request:**
```
PATCH /users/uuid-of-user
```

---

## 5. Delete User (Soft Delete) (DELETE /users/:id)

**Request:**
```
DELETE /users/uuid-of-user
```

**Response:**
```json
{
  "message": "User deleted successfully",
  "userId": "uuid-of-user"
}
```

**Note:** This is a soft delete - the user's `deletedAt` field is set to the current timestamp. The user record remains in the database but is excluded from normal queries.

---

## Field Descriptions

### Required Fields (Create):
- `user_number`: Unique identifier for the user (string)
- `name`: User's full name (string)
- `address`: User's address (string)
- `work_location`: One of: `'in-office'`, `'hybrid'`, `'remote'` (enum)
- `social_insurance`: Boolean
- `medical_insurance`: Boolean
- `join_date`: Date in format `YYYY-MM-DD` (string)
- `role_id`: UUID of the role (string)

### Optional Fields:
- `contract_date`: Date in format `YYYY-MM-DD` (string, nullable)
- `exit_date`: Date in format `YYYY-MM-DD` (string, nullable)
- `title_id`: UUID of the title (string, nullable)
- `phones`: Array of phone objects (optional)
- `department_ids`: Array of department UUIDs (optional)

### Phone Object Structure:
- `number`: Phone number (required)
- `company`: Phone company (optional)
- `current_plan`: Current plan name (optional)
- `legal_owner`: Legal owner name (optional)
- `comment`: Additional comments (optional)
- `is_active`: Boolean (default: true, optional)

---

## Relationships

- **User → Title**: Many-to-One (user has one title, title has many users)
- **User → Phone**: One-to-Many (user has many phones, phone belongs to one user)
- **User → Department**: Many-to-Many (user can work in multiple departments, department has many users)

