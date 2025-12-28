# Voucher Management System

A comprehensive NestJS-based backend API for managing gift vouchers, users, projects, and roles. This system provides secure authentication, role-based access control, and complete CRUD operations for voucher management.

---

## 🚀 Quick Start Guide (For Beginners)

This guide will help you set up and run the backend API server step by step, even if you're not familiar with technical terms.

### 📋 What You Need Before Starting

Before you begin, make sure you have these installed on your computer:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Choose the "LTS" (Long Term Support) version
   - Install it by following the installation wizard
   - To verify installation, open a terminal/command prompt and type: `node --version`
   - You should see a version number like `v18.x.x` or higher

2. **PostgreSQL Database** (v12 or higher)
   - Download from: https://www.postgresql.org/download/
   - Install PostgreSQL following the installation wizard
   - Remember the password you set for the `postgres` user (you'll need it later)
   - To verify installation, open a terminal and type: `psql --version`

3. **Git** (Optional, if cloning from repository)
   - Download from: https://git-scm.com/downloads
   - Install Git following the installation wizard

### 🔧 Step-by-Step Setup Instructions

1. **Open Terminal/Command Prompt**
   - On Windows: Press `Win + R`, type `cmd`, and press Enter
   - On Mac: Press `Cmd + Space`, type `Terminal`, and press Enter
   - On Linux: Press `Ctrl + Alt + T`

2. **Navigate to the Backend Folder**
   ```bash
   cd "C:\Users\YourName\Desktop\sparkflares\Voucher Management System\Coding\GiftVoucherGenerator"
   ```
   *(Replace the path with your actual project location)*

3. **Install Backend Dependencies**
   ```bash
   npm install
   ```
   - This will download all required packages (may take 2-5 minutes)
   - Wait until you see "added X packages" message

4. **Create Environment File**
   - In the `GiftVoucherGenerator` folder, create a new file named `.env`
   - Copy and paste the following content into the `.env` file:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_postgres_password
   DB_DATABASE=voucher_system

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRES_IN=24h

   # Application Configuration
   NODE_ENV=development
   PORT=3000

   # Encryption Key (for voucher templates)
   ENCRYPTION_KEY=your_32_character_encryption_key_here
   ```
   - **Important**: Replace `your_postgres_password` with the password you set when installing PostgreSQL
   - Replace `your_super_secret_jwt_key_change_this_in_production` with any random string (at least 32 characters)
   - Replace `your_32_character_encryption_key_here` with a random 32-character string

5. **Create the Database**
   - Open PostgreSQL (usually called "pgAdmin" or "SQL Shell")
   - Or use command line:
   ```bash
   psql -U postgres
   ```
   - Enter your PostgreSQL password when prompted
   - Run this command:
   ```sql
   CREATE DATABASE voucher_system;
   ```
   - Type `\q` and press Enter to exit

6. **Run Database Migrations**
   - Go back to your terminal in the `GiftVoucherGenerator` folder
   ```bash
   npm run db:migrate
   ```
   - This creates all the necessary database tables
   - You should see messages like "migration: X has been executed"

7. **Start the Backend Server**
   ```bash
   npm run start:dev
   ```
   - You should see messages like "Nest application successfully started"
   - The backend is now running at: **http://localhost:3000**
   - API documentation is available at: **http://localhost:3000/api**
   - **Keep this terminal window open** - don't close it!

### ✅ Verification Checklist

- [ ] Backend server is running (terminal shows "Nest application successfully started")
- [ ] You can access http://localhost:3000/api (should show Swagger API documentation)
- [ ] Database connection is successful (no error messages in terminal)

### 🛑 How to Stop the Server

- **To stop the backend**: In the terminal, press `Ctrl + C`

### 🔄 How to Start Again Later

1. **Open Terminal/Command Prompt**
2. **Navigate to the Backend Folder**:
   ```bash
   cd "path\to\GiftVoucherGenerator"
   ```
3. **Start the Server**:
   ```bash
   npm run start:dev
   ```

### ❓ Common Issues and Solutions

**Problem**: "npm: command not found"
- **Solution**: Node.js is not installed or not in your PATH. Reinstall Node.js and restart your terminal.

**Problem**: "Cannot connect to database"
- **Solution**: Make sure PostgreSQL is running. Check your `.env` file has the correct database password and that the database `voucher_system` exists.

**Problem**: "Port 3000 already in use"
- **Solution**: Another application is using port 3000. Either stop that application or change `PORT=3000` to `PORT=3001` in your `.env` file.

**Problem**: "Migration failed" or "Table already exists"
- **Solution**: The database might already be set up. Try running `npm run db:migrate:undo:all` first, then `npm run db:migrate` again.

**Problem**: "JWT_SECRET is not defined"
- **Solution**: Make sure your `.env` file exists and contains all required variables. Check that there are no spaces around the `=` sign in your `.env` file.

---

## 🚀 Features

### Core Features

- **Authentication & Authorization**: 
  - JWT-based authentication with secure token management
  - Role-based access control (RBAC) with Admin and User roles
  - Protected routes with authentication guards
  - Public endpoints for registration and login

- **User Management**: 
  - Complete CRUD operations for users
  - Admin and regular user role assignment
  - User profile management
  - User-project assignments (many-to-many relationship)
  - User-voucher assignments (many-to-many relationship)
  - Soft delete functionality

- **Project Management**: 
  - Create, read, update, and delete projects
  - Project-user assignments
  - Active/inactive project status
  - Project logo and metadata management
  - Project filtering and search

- **Voucher Management**: 
  - Create and manage voucher templates
  - Voucher assignment to users
  - Voucher tracking and generation
  - Template encryption and compression (AES-256-GCM)
  - PDF generation with Playwright
  - Background images and activity names support
  - Voucher preview functionality

- **Voucher Tracking**: 
  - Track generated vouchers with detailed information
  - Voucher number, contact details, dates
  - Pickup and dropoff locations
  - Number of passengers (PAX)
  - Valid from/to date ranges
  - CSV export functionality
  - Advanced filtering (search, project, date range)
  - Sorting capabilities (ascending/descending)

- **Role Management**: 
  - Flexible role-based permissions system
  - Role CRUD operations
  - Role assignment to users

- **Advanced Filtering & Sorting**: 
  - Multi-field search functionality
  - Project-based filtering
  - Date range filtering
  - Column sorting (ascending/descending)
  - Pagination support
  - Nested field sorting (e.g., voucher.voucher_name)

- **Data Export**: 
  - CSV export for voucher tracking data
  - Formatted CSV with all tracking fields

- **Security Features**: 
  - Password hashing with bcrypt
  - JWT token authentication
  - Rate limiting (10 req/min general, 5 req/min login)
  - CORS configuration
  - Input validation with class-validator
  - SQL injection prevention with Sequelize ORM
  - Template encryption for sensitive data

- **API Documentation**: 
  - Interactive Swagger/OpenAPI documentation
  - Complete endpoint descriptions
  - Request/response schemas
  - Try-it-out functionality

- **Database**: 
  - PostgreSQL database
  - Sequelize ORM with TypeScript
  - Database migrations
  - Seeders support
  - Soft deletes
  - Many-to-many relationships

## 🛠️ Tech Stack

### Backend Technologies

- **Framework**: NestJS (Node.js) - Enterprise-grade Node.js framework
- **Language**: TypeScript - Type-safe JavaScript
- **Database**: PostgreSQL (v12+) - Relational database
- **ORM**: Sequelize with TypeScript - Database ORM with migrations
- **Authentication**: 
  - JWT (JSON Web Tokens) - Token-based authentication
  - Passport.js - Authentication middleware
  - bcrypt - Password hashing
- **PDF Generation**: Playwright - Headless browser for PDF creation
- **Encryption**: 
  - AES-256-GCM - Advanced encryption standard
  - Node.js crypto module - Built-in encryption utilities
  - zlib - Data compression
- **Documentation**: Swagger/OpenAPI - API documentation
- **Validation**: 
  - class-validator - Decorator-based validation
  - class-transformer - Object transformation
- **Security**: 
  - @nestjs/throttler - Rate limiting
  - CORS - Cross-origin resource sharing
- **CSV Export**: csv-stringify - CSV generation
- **Testing**: Jest - Testing framework

### Project Structure

```
GiftVoucherGenerator/
├── src/
│   ├── auth/              # Authentication module
│   │   ├── decorators/     # Custom decorators (@Roles, @Public)
│   │   ├── dto/           # Data transfer objects
│   │   ├── auth.guard.ts  # Authentication guard
│   │   └── auth.service.ts
│   ├── users/             # User management module
│   │   ├── dto/           # User DTOs
│   │   ├── entities/      # User entity
│   │   └── users.service.ts
│   ├── projects/          # Project management module
│   ├── roles/             # Role management module
│   ├── voucher/           # Voucher management module
│   │   ├── dto/           # Voucher DTOs
│   │   ├── entities/      # Voucher entity
│   │   └── voucher.service.ts
│   └── shared/            # Shared utilities
│       ├── database/      # Database config & entities
│       │   ├── entities/  # Junction tables & tracking entities
│       │   └── migrations/# Database migrations
│       ├── dto/           # Base DTOs
│       ├── enums/         # Enumerations
│       └── utils/         # Utility functions
│           ├── compression-encryption.util.ts
│           ├── filter.util.ts      # Filter building utilities
│           ├── pagination.util.ts  # Pagination utilities
│           ├── pdf.util.ts         # PDF generation
│           └── template-replacer.util.ts
├── test/                  # Test files
└── dist/                  # Compiled JavaScript
```

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)
- Git

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd GiftVoucherGenerator
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_DATABASE=voucher_system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000

# SSL Configuration (for production)
DB_SSL_CA=path_to_ssl_certificate
```

### 4. Database Setup

#### Create Database
```bash
# Connect to PostgreSQL and create database
psql -U your_username -h localhost
CREATE DATABASE voucher_system;
\q
```

#### Run Migrations
```bash
npm run db:migrate
```

#### Run Seeders (Optional)
```bash
npm run db:seed
```

### 5. Start the Application

#### Development Mode
```bash
npm run start:dev
```

#### Production Mode
```bash
npm run build
npm run start:prod
```

The application will be available at:
- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api

## 📚 API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/auth/register` | Register a new user | Public |
| POST | `/auth/login` | Login user | Public |

### Users (`/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/users` | Create a new user | Admin |
| POST | `/users/admin` | Create a new admin user | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| PATCH | `/users/:id` | Update user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |
| GET | `/users/:id/vouchers` | Get user's vouchers | Admin |

### Roles (`/roles`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/roles` | Create a new role | Admin |
| GET | `/roles` | Get all roles | Admin |
| GET | `/roles/:id` | Get role by ID | Admin |
| PATCH | `/roles/:id` | Update role | Admin |
| DELETE | `/roles/:id` | Delete role | Admin |

### Projects (`/projects`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/projects` | Create a new project | Admin |
| GET | `/projects` | Get all projects | Admin |
| GET | `/projects/:id` | Get project by ID | Admin |
| PATCH | `/projects/:id` | Update project | Admin |
| DELETE | `/projects/:id` | Delete project | Admin |
| POST | `/projects/:projectId/assign-user/:userId` | Assign user to project | Admin |
| DELETE | `/projects/:projectId/unassign-user/:userId` | Unassign user from project | Admin |

### Vouchers (`/vouchers`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/vouchers` | Create a new voucher | Admin |
| GET | `/vouchers` | Get all vouchers (with filtering, sorting, pagination) | Admin |
| GET | `/vouchers/my-vouchers` | Get current user's vouchers | Admin, User |
| GET | `/vouchers/users-with-vouchers` | Get all users with vouchers | Admin |
| GET | `/vouchers/:id` | Get voucher by ID | Admin |
| PATCH | `/vouchers/:id` | Update voucher | Admin |
| DELETE | `/vouchers/:id` | Delete voucher (soft delete) | Admin |
| POST | `/vouchers/:voucherId/assign/:userId` | Assign voucher to user | Admin |
| DELETE | `/vouchers/:voucherId/unassign/:userId` | Unassign voucher from user | Admin |
| POST | `/vouchers/generate` | Generate voucher PDF and tracking record | Admin, User |
| GET | `/vouchers/my-voucher-tracking` | Get user's voucher tracking records (with filters) | Admin, User |
| GET | `/vouchers/my-voucher-tracking/csv` | Export user's tracking data as CSV | Admin, User |
| GET | `/vouchers/get-tracking-data` | Get all tracking data (admin view, with filters) | Admin |

### Query Parameters for Filtering

All GET endpoints support the following query parameters:

- `search` - Search across multiple fields
- `project` - Filter by project name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sortBy` - Field to sort by (e.g., 'createdAt', 'voucher_name')
- `sortOrder` - Sort direction ('ASC' or 'DESC')
- `is_active` - Filter by active status (boolean)
- `valid_from` - Start date for date range filter
- `valid_to` - End date for date range filter

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your_jwt_token>
```

### Role-Based Access Control

- **Admin**: Full access to all endpoints
- **User**: Limited access to their own data and assigned vouchers

## 📊 Database Schema

### Core Entities

- **Users**: User accounts with roles, email, name, password (hashed)
- **Roles**: Permission levels (admin, user) with name and description
- **Projects**: Business projects with name, logo_url, is_active status
- **Vouchers**: Gift voucher templates with:
  - Template (encrypted and compressed)
  - Voucher name, type
  - Project association
  - Background image
  - Activity name
  - Active/inactive status
- **VoucherTracking**: Generated voucher instances with:
  - Voucher number
  - Contact information (email, phone)
  - Number of passengers (PAX)
  - Valid from/to dates
  - Pickup and dropoff locations
  - User association
- **UserVoucher**: Many-to-many relationship between users and vouchers
- **UserProject**: Many-to-many relationship between users and projects (with is_active flag)
- **UserVoucherTracking**: Historical tracking of voucher generation by users

### Relationships

- User ↔ Role: Many-to-One (each user has one role)
- User ↔ Project: Many-to-Many (users can be assigned to multiple projects)
- User ↔ Voucher: Many-to-Many (users can have multiple vouchers)
- Voucher ↔ Project: Many-to-One (each voucher belongs to one project)
- VoucherTracking ↔ Voucher: Many-to-One (each tracking record references one voucher)
- VoucherTracking ↔ User: Many-to-One (each tracking record belongs to one user)

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Test with Watch Mode
```bash
npm run test:watch
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | Start the application |
| `npm run start:dev` | Start in development mode with hot reload |
| `npm run start:debug` | Start in debug mode |
| `npm run start:prod` | Start in production mode |
| `npm run build` | Build the application |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run test:cov` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run db:migrate` | Run database migrations |
| `npm run db:migrate:undo` | Undo last migration |
| `npm run db:seed` | Run database seeders |
| `npm run doc` | Generate API documentation |

## 🔧 Configuration

### Database Configuration
The application uses Sequelize ORM with PostgreSQL. Database configuration is handled through environment variables and can be found in `src/shared/database/config.js`.

**Supported Features**:
- Connection pooling
- SSL support (for production)
- Migration system
- Seeder support
- Soft deletes

### CORS Configuration
CORS is configured to allow requests from `http://localhost:5173` (Vite default port) for frontend integration. Can be customized in `src/main.ts`.

### Rate Limiting
The application implements rate limiting with:
- 10 requests per minute for general endpoints
- 5 requests per minute for login endpoint
- Configurable via `@nestjs/throttler`

### Encryption & Compression

**Template Encryption**:
- Algorithm: AES-256-GCM
- Compression: Gzip (level 9)
- Storage: Base64 encoded encrypted data
- Security: Authentication tags for data integrity

**Utilities**:
- `CompressionEncryptionUtil`: Backend encryption/compression
- Handles template data securely
- Prevents unauthorized template access

### PDF Generation

**Features**:
- Multi-page PDF support
- HTML to PDF conversion
- Image embedding (base64 conversion)
- Custom page sizes
- Print media emulation

**Technology**: Playwright (Chromium)
- Headless browser rendering
- Browser instance pooling
- Timeout handling
- Error recovery

### Filtering & Sorting Utilities

**Filter Utilities** (`filter.util.ts`):
- `buildWhereClause`: Build Sequelize where conditions
- `buildSearchClause`: Multi-field search
- `buildDateRangeClause`: Date range filtering
- `buildOrderClause`: Sorting support
- `buildNestedWhereClause`: Nested model filtering

**Pagination Utilities** (`pagination.util.ts`):
- `calculateOffset`: Calculate database offset
- `getPaginationParams`: Get page and limit with defaults
- `getPaginationMetadata`: Generate pagination metadata
- `calculateTotalPages`: Calculate total pages

### Template System

**Template Replacement** (`template-replacer.util.ts`):
- Placeholder replacement (e.g., `{{voucher_number}}`)
- Dynamic content insertion
- Form data mapping
- HTML template processing

## 📖 API Documentation

Interactive API documentation is available at `http://localhost:3000/api` when the application is running. The documentation includes:

- Complete endpoint descriptions
- Request/response schemas
- Authentication requirements
- Example requests and responses
- Try-it-out functionality

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PORT=5432
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_DATABASE=your_production_db_name
JWT_SECRET=your_strong_jwt_secret
PORT=3000
DB_SSL_CA=path_to_ssl_certificate
```

### Build for Production

```bash
npm run build
npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the UNLICENSED License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

## 🔄 Version History

- **v0.0.1** - Initial release with core voucher management functionality

---

**Note**: Make sure to keep your environment variables secure and never commit them to version control.