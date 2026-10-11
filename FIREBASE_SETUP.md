# Firebase Setup Guide for ResumeForge Backend

This guide walks you through setting up Firebase Firestore for the ResumeForge backend.

## Prerequisites

- Firebase account (free tier available at firebase.google.com)
- Python 3.8+
- Git

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project" or "Create a project"
3. Enter project name: `resumeforge` (or your preferred name)
4. Accept the terms and click "Continue"
5. Disable Google Analytics (optional) and click "Create project"
6. Wait for the project to be created

## Step 2: Create a Firestore Database

1. In the Firebase Console, go to **Build** > **Firestore Database**
2. Click "Create database"
3. Choose location closest to you (e.g., `us-central1`)
4. Select **Start in production mode** (you can change security rules later)
5. Click "Create"

## Step 3: Generate Service Account Key

1. In Firebase Console, go to **Project Settings** (click the gear icon)
2. Go to **Service Accounts** tab
3. Click "Generate New Private Key"
4. A JSON file will download (e.g., `resumeforge-xxxxx.json`)
5. Save this file as `firebase-credentials.json` in your backend directory

⚠️ **IMPORTANT:** Keep this file secure! Add it to `.gitignore`:

```bash
echo "firebase-credentials.json" >> backend/.gitignore
```

## Step 4: Set Up Environment Variables

1. Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

2. Update `backend/.env`:
```dotenv
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
DEBUG=false
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
```

## Step 5: Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Step 6: Initialize Firestore Collections

```bash
python init_db.py
```

You should see output like:
```
Initializing Firebase Firestore...
✓ Users collection initialized
✓ Resume versions collection initialized
Firebase Firestore initialization complete!
```

## Step 7: Run the Backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs to test the API.

## Firestore Security Rules

By default, the database is in production mode (most secure). To allow development testing, update your security rules:

1. Go to **Firestore Database** > **Rules**
2. Replace with:

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{document=**} {
      allow read, write: if request.auth != null;
    }
    match /resume_versions/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

**Note:** This allows authenticated writes. For production, implement stricter rules.

## Firestore Collections Structure

ResumeForge uses two main collections:

### Users Collection
```
/users/{email}
{
  "email": "user@example.com",
  "name": "John Doe",
  "hashed_password": "$2b$12...",
  "created_at": 2024-01-15T10:30:00Z
}
```

### Resume Versions Collection
```
/resume_versions/{document_id}
{
  "user_id": "user@example.com",
  "version_name": "Google Resume",
  "resume_data": { ... },
  "template": "ats-one-page",
  "created_at": 2024-01-15T10:30:00Z
}
```

## Docker Deployment

For Docker deployments, pass credentials as an environment variable:

```bash
docker-compose up -d \
  -e FIREBASE_CREDENTIALS='{"type":"service_account",...}'
```

Or update `docker-compose.yml`:
```yaml
environment:
  FIREBASE_CREDENTIALS: ${FIREBASE_CREDENTIALS}
```

Then run:
```bash
export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)
docker-compose up -d
```

## Troubleshooting

### "Firebase credentials not found"
- Ensure `firebase-credentials.json` exists in the `backend/` directory
- OR set the `FIREBASE_CREDENTIALS` environment variable with JSON content

### "Permission denied" errors
- Check your Firestore security rules
- Ensure the service account has proper permissions in Firebase Console

### Collections not appearing in Firestore Console
- Collections are created automatically on first write
- Run `python init_db.py` to create them
- Or make an API call (e.g., register a user)

## Next Steps

1. **Frontend Setup:** Update `/frontend/.env.local` with your Firebase config
2. **Testing:** Test register/login endpoints
3. **Deployment:** Deploy to production (Render, Railway, etc.)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Python SDK](https://cloud.google.com/python/docs/reference/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
