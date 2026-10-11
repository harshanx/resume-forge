# ResumeForge Firebase Migration - Quick Start Guide

## ✅ What's Done

Your backend has been fully migrated from PostgreSQL/SQLite to **Firebase Firestore**. All files have been updated:

- ✅ `requirements.txt` - Added firebase-admin, removed sqlalchemy
- ✅ `app/database.py` - Firestore client initialization
- ✅ `app/models/user.py` - Firestore-compatible User model
- ✅ `app/models/resume_version.py` - Firestore-compatible ResumeVersion model
- ✅ `app/routes/auth.py` - Updated to use Firestore queries
- ✅ `app/routes/resume_version.py` - Updated for Firestore operations
- ✅ `app/auth.py` - Added environment variable support
- ✅ `init_db.py` - Updated for Firestore initialization
- ✅ `.env.example` - Updated with Firebase configuration

## 🚀 Next Steps (For You)

### Step 1: Get Your Firebase Credentials
1. Go to **Firebase Console** → https://console.firebase.google.com
2. Select or create a project named `resumeforge`
3. Go to **Project Settings** (⚙️ gear icon in top-left)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key** (blue button)
6. A JSON file will download (e.g., `resumeforge-xxxxx.json`)

### Step 2: Set Up Backend
```bash
cd backend

# Copy the downloaded JSON file here and rename it
cp /path/to/downloaded/file.json ./firebase-credentials.json

# Create .env file
cp .env.example .env

# Install dependencies
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Initialize Firestore collections
python init_db.py
```

### Step 3: Run Backend
```bash
# Still in backend/ directory
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Visit http://localhost:8000/docs to see the Swagger UI

### Step 4: Test Registration (Using Swagger UI or curl)
```bash
# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "name": "Test User",
    "password": "TestPass123!"
  }'

# Expected response:
# {"email": "testuser@example.com", "name": "Test User"}
```

### Step 5: Update Frontend
Update `frontend/.env.local` with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Get these from Firebase Console → Project Settings → Your apps → Configuration

### Step 6: Verify Data in Firebase
1. Go to **Firebase Console** → **Firestore Database**
2. You should see two collections:
   - `users` - contains registered users
   - `resume_versions` - contains saved resumes

## 📄 Complete Documentation

- **Detailed Setup**: See `FIREBASE_SETUP.md` for complete Firebase configuration
- **Migration Details**: See `FIREBASE_MIGRATION.md` for technical changes
- **Original Setup**: See `SETUP.md` for other development info

## ⚠️ Important Notes

1. **Never commit** `firebase-credentials.json` to git
2. Check the `.gitignore` file has `firebase-credentials.json` in it
3. For production deployment, use environment variables instead of a file
4. Update Firestore security rules from the default (development only)

## 🔧 Troubleshooting

<details>
<summary>Click if you get an error</summary>

### Error: "Firebase credentials not found"
- Ensure `firebase-credentials.json` exists in the `backend/` folder
- OR set environment variable: `export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)`

### Error: "ModuleNotFoundError: No module named 'firebase_admin'"
- Run: `pip install -r requirements.txt`

### Error: "Permission denied" in Firestore
1. Go to Firebase Console → Firestore Database → Rules
2. Replace rules with:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```
3. Click "Publish"
</details>

## 📊 Database Structure

### Users Collection
```json
/users/{email}
{
  "email": "user@example.com",
  "name": "John Doe",
  "hashed_password": "$2b$12...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Resume Versions Collection
```json
/resume_versions/{auto_id}
{
  "user_id": "user@example.com",
  "version_name": "Google Resume",
  "resume_data": { /* resume content */ },
  "template": "ats-one-page",
  "created_at": "2024-01-15T10:30:00Z"
}
```

## 🎯 What's Next After Setup?

1. ✅ Backend running with Firestore
2. ⏭️ Frontend authentication UI (login/register pages)
3. ⏭️ Resume builder integration
4. ⏭️ PDF generation and download
5. ⏭️ Dashboard to view saved resumes
6. ⏭️ Job analyzer integration
7. ⏭️ AI services integration

## ❓ Questions?

Check these files for more info:
- Backend configuration: `backend/.env.example`
- Firebase docs: `FIREBASE_SETUP.md`
- Migration details: `FIREBASE_MIGRATION.md`
- Original setup guide: `SETUP.md`

---

**Ready?** Start with **Step 1** above! 🚀
