# Cloud Run Deployment Guide

This guide explains how to deploy the Notification System (Emails-Back) to Google Cloud Run.

## Prerequisites

1. Google Cloud Platform account with billing enabled
2. Google Cloud SDK (gcloud) installed and configured
3. Docker installed (for local testing)
4. A PostgreSQL database (Cloud SQL recommended)
5. Service account created: `notification-system@PROJECT_ID.iam.gserviceaccount.com`

## Environment Variables

The following environment variables need to be configured in Cloud Run:

### Required Variables

- `DB_HOST` - PostgreSQL database host (Cloud SQL socket path: `/cloudsql/INSTANCE_CONNECTION_NAME`)
- `DB_PORT` - PostgreSQL database port (default: 5432)
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_DATABASE` - Database name
- `JWT_SECRET` - Secret key for JWT token signing
- `CORS_ORIGIN` - Comma-separated list of allowed CORS origins
- `ENCRYPTION_KEY` - 32-character encryption key for data encryption

### Optional Variables

- `PORT` - Server port (Cloud Run sets this automatically, default: 8080)
- `NODE_ENV` - Environment (set to `production` for Cloud Run)
- `JWT_EXPIRES_IN` - JWT token expiration time (default: 24h)

## Deployment Steps

### Option 1: Using Cloud Build (Recommended)

1. **Update substitution variables in cloudbuild.yaml**:
   - Replace `_CLOUDSQL_INSTANCE` with your Cloud SQL instance connection name (format: `PROJECT_ID:REGION:INSTANCE_NAME`)
   - Replace `_DB_USER`, `_DB_PASSWORD`, `_DB_DATABASE` with your database credentials
   - Replace `_JWT_SECRET` with a strong secret key
   - Update `_CORS_ORIGIN` with your frontend URL(s)
   - Update `_ENCRYPTION_KEY` with a 32-character encryption key
   - Update `_REGION` if needed (default: `europe-west1`)

2. **Set up Cloud Build trigger** (one-time setup):
   ```bash
   gcloud builds triggers create github \
     --repo-name=YOUR_REPO_NAME \
     --repo-owner=YOUR_GITHUB_USERNAME \
     --branch-pattern="^main$" \
     --build-config=cloudbuild.yaml \
     --region=europe-west1
   ```

3. **Manual build and deploy using npm script**:
   ```bash
   cd Emails-Back
   npm run deploy:build
   ```

   Or directly:
   ```bash
   cd Emails-Back
   gcloud builds submit --config cloudbuild.yaml .
   ```

   With custom substitutions:
   ```bash
   cd Emails-Back
   gcloud builds submit --config cloudbuild.yaml . \
     --substitutions=_REGION=europe-west1,_CLOUDSQL_INSTANCE=YOUR_PROJECT_ID:europe-west1:YOUR_INSTANCE_NAME,_DB_USER=postgres,_DB_PASSWORD=YOUR_PASSWORD,_DB_DATABASE=notification_system_db,_JWT_SECRET=YOUR_SECRET,_CORS_ORIGIN=https://your-frontend.run.app,_ENCRYPTION_KEY=your-32-character-key-here
   ```

### Option 2: Manual Deployment with Source

1. **Deploy directly from source using npm script**:
   ```bash
   cd Emails-Back
   npm run deploy
   ```

   Or manually:
   ```bash
   cd Emails-Back
   gcloud run deploy notification-system \
     --source . \
     --region europe-west1 \
     --allow-unauthenticated \
     --service-account notification-system@$(gcloud config get-value project).iam.gserviceaccount.com \
     --add-cloudsql-instances erudite-descent-460013-b7:europe-west1:arabiagateway \
     --timeout 300s \
     --memory 512Mi \
     --cpu 1 \
     --max-instances 10 \
     --set-env-vars "NODE_ENV=production,DB_HOST=/cloudsql/erudite-descent-460013-b7:europe-west1:arabiagateway,DB_PORT=5432,DB_USER=postgres,DB_PASSWORD=YOUR_PASSWORD,DB_DATABASE=notification_system_db,JWT_SECRET=YOUR_JWT_SECRET,JWT_EXPIRES_IN=24h,CORS_ORIGIN=https://gift-voucher-dashboard-1082379018873.europe-west1.run.app,ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY,PORT=8080"
   ```

### Option 3: Manual Deployment with Pre-built Image

1. **Build the Docker image**:
   ```bash
   cd Emails-Back
   docker build -t gcr.io/YOUR_PROJECT_ID/notification-system .
   ```

2. **Push to Container Registry**:
   ```bash
   docker push gcr.io/YOUR_PROJECT_ID/notification-system
   ```

3. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy notification-system \
     --image gcr.io/YOUR_PROJECT_ID/notification-system \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --service-account notification-system@YOUR_PROJECT_ID.iam.gserviceaccount.com \
     --set-env-vars "NODE_ENV=production,DB_HOST=/cloudsql/YOUR_PROJECT_ID:europe-west1:YOUR_INSTANCE_NAME,DB_PORT=5432,DB_USER=postgres,DB_PASSWORD=YOUR_PASSWORD,DB_DATABASE=notification_system_db,JWT_SECRET=YOUR_JWT_SECRET,JWT_EXPIRES_IN=24h,CORS_ORIGIN=https://your-frontend.run.app,ENCRYPTION_KEY=YOUR_ENCRYPTION_KEY,PORT=8080" \
     --add-cloudsql-instances YOUR_PROJECT_ID:europe-west1:YOUR_INSTANCE_NAME \
     --memory 512Mi \
     --cpu 1 \
     --max-instances 10 \
     --timeout 300s
   ```

## Service Account Setup

Before deploying, ensure the service account exists:

```bash
gcloud iam service-accounts create notification-system \
  --display-name="Notification System Service Account"

# Grant necessary permissions (if needed)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:notification-system@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

## Post-Deployment

After deployment, the service will be available at:
```
https://notification-system-<PROJECT_NUMBER>.europe-west1.run.app
```

## Troubleshooting

### Database Connection Issues
- Verify Cloud SQL instance is running
- Check that Cloud Run service account has `roles/cloudsql.client` permission
- Ensure the Cloud SQL instance connection name is correct
- Verify database credentials are correct

### CORS Issues
- Check that `CORS_ORIGIN` environment variable includes your frontend URL
- Ensure multiple origins are comma-separated without spaces

### Service Account Issues
- Verify service account exists: `gcloud iam service-accounts list`
- Check service account permissions in Cloud Run console

## Environment-Specific Configuration

### Development
```bash
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
CORS_ORIGIN=http://localhost:5173
```

### Production
```bash
NODE_ENV=production
DB_HOST=/cloudsql/YOUR_PROJECT_ID:REGION:INSTANCE_NAME
DB_PORT=5432
CORS_ORIGIN=https://your-frontend-domain.com
```

## Database Setup

Before running migrations, ensure the database exists and has the necessary extensions:

1. **Set up the database** (creates database and extensions):
   ```bash
   npm run db:setup
   ```

   This script will:
   - Create the `notification_system_db` database if it doesn't exist
   - Create required PostgreSQL extensions (`uuid-ossp`, `pgcrypto`)
   - Set up the `update_updated_at_column()` function

2. **Run migrations**:
   ```bash
   npm run db:migrate
   ```

## Database Structure

The service uses a dedicated database: `notification_system_db`

Key tables:
- `roles` - User roles
- `users` - User accounts
- `projects` - Project/tenant information
- `user_projects` - Many-to-many relationship between users and projects
- `emails_transporters` - Email service configurations
- `user_emails` - User email records
- `email_tracking` - Email tracking and logs

