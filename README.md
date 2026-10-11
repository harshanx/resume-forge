# ResumeForge - ATS-Friendly One-Page Resume Builder

Build professional, ATS-friendly resumes in minutes using resume analysis tools and LaTeX templates. Create multiple versions tailored to different job applications with Supabase.

## ✨ Features

- **Structured Input**: Multi-step form to fill resume details (7 steps)
- **LaTeX-Powered**: Professional PDF generation with customizable templates
- **One-Page Guarantee**: Automatic content optimization to fit on one page
- **ATS-Friendly**: Standard section headings, text-selectable PDFs, optimized for all major ATSs
- **Multiple Versions**: Save and manage multiple resume versions for different applications
- **Job Analyzer**: Analyze job descriptions and compare with your resume
- **AI Enhancements**:
  - Grammar checking and spell correction
  - Bullet point improvement with action verbs
  - Keyword suggestions based on industry/role
  - Job-specific resume tailoring
  - ATS compatibility scoring
  - Content optimization for one-page format

## 🏗️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, TypeScript |
| **Backend** | FastAPI (Python 3.11), Uvicorn |
| **Database** | Supabase Postgres |
| **Authentication** | Supabase Auth |
| **Storage** | Supabase Storage (optional for generated PDFs) |
| **LaTeX** | TeX Live (Dockerized), Jinja2 templates |
| **PDF Generation** | pdflatex compilation + ReportLab fallback |
| **Deployment** | Docker, Docker Compose |

## 📊 Project Status

The core builder and resume-generation flow are implemented. Production readiness still depends on configuring Supabase policies/secrets and validating the deployment environment. The AI helpers currently use local rule-based logic; they do not call an external LLM.

### Saving resumes with Supabase

Run [supabase_schema.sql](supabase_schema.sql) in the Supabase SQL Editor before creating accounts. If accounts were created before the profile trigger was set up, run [supabase_save_fix.sql](supabase_save_fix.sql) once to backfill their profile rows and restore the required Row Level Security policies.

### Application tracker and password recovery

Run [supabase_applications_migration.sql](supabase_applications_migration.sql) in the Supabase SQL Editor to create the user-protected application tracker table. In Supabase Authentication settings, add your local and deployed app origins to the allowed redirect URLs so signup confirmation and password recovery links can return to the app. Password recovery uses `/reset-password` on the same origin.

### Recent product updates

- The builder adapts to mobile with Edit/Preview switching and keeps a browser-local draft while a new resume is in progress.
- Login redirects return users to the page they originally requested. Signup confirmation and forgot/reset password screens are available.
- The dashboard supports searching, renaming, duplicating, editing, and confirming deletion of saved resumes.
- The analyzer disables saved-resume comparison when there are no resumes to compare.
- The application tracker supports creating and editing role details, attaching a saved resume, follow-up dates, notes, status filters, status changes, and confirmed deletion.
- The monochrome light/dark theme is applied across the product pages with responsive navigation.

The app can run before the application tracker migration is applied; the tracker page will show a setup message until its table exists. Resume saving still depends on the Supabase schema and policies above. AI helper features currently use local rule-based logic, not an external LLM.

### ✅ Backend (FastAPI) - Complete

- ✅ 14+ REST API endpoints
- ✅ Supabase integration for saved resume versions
- ✅ JWT authentication (register/login/user profile)
- ✅ Resume generation (LaTeX → PDF)
- ✅ PDF validation & page counting
- ✅ Resume versioning (save/load/delete)
- ✅ **7 AI Services** (all fully implemented):
  - ✅ **Grammar Checker** - 300+ spelling mistakes, grammar rules, resume-specific errors
  - ✅ **AI Improver** - Action verbs, weak phrase detection, quantitative metric suggestions
  - ✅ **Keyword Suggester** - Industry vs role-specific keywords (5 industries, 5 roles)
  - ✅ **Job Analyzer** - Skill extraction, experience level detection, education requirements
  - ✅ **Job Tailor** - Resume-to-job matching, skill gap identification
  - ✅ **ATS Checker** - 7-point compatibility check with 0-100 scoring
  - ✅ **Content Optimizer** - 4-level optimization strategy for one-page format
- ✅ LaTeX template system (2 templates ready: ats-one-page, modern-clean)

### ✅ Frontend (Next.js + React) - Complete

- ✅ **Authentication Pages**:
  - ✅ Register with Supabase Auth
  - ✅ Login with email/password
- ✅ **Resume Builder** (7-step multi-step form):
  - ✅ Personal Information
  - ✅ Education
  - ✅ Skills
  - ✅ Experience
  - ✅ Projects
  - ✅ Certifications
  - ✅ Achievements
- ✅ **Dashboard**:
  - ✅ List all saved resumes
  - ✅ Create new resumes
  - ✅ Edit existing resumes
  - ✅ Delete resumes
  - ✅ Display user info
- ✅ **Job Analyzer**:
  - ✅ Analyze job descriptions
  - ✅ Extract requirements (skills, education, experience)
  - ✅ Compare saved Supabase resumes with job requirements
  - ✅ Calculate match percentage
  - ✅ Show missing skills
  - ✅ Provide tailoring recommendations

### ✅ Infrastructure - Complete

- ✅ Docker setup (backend, frontend, LaTeX services)
- ✅ Docker Compose orchestration
- ✅ Environment variable configuration
- ✅ Supabase client configuration via environment variables
- ⚠️ Deployment status depends on the target environment
- ✅ Development mode support with hot reload

## 📋 Pending Works & Roadmap

### 🔴 High Priority

1. **Text Refinement Layer** (NEW)
   - **Description**: Add an intermediate processing layer that automatically refines user input text
   - **Features**:
     - Automatic capitalization of proper nouns (names, companies, locations)
     - Sentence case conversion for descriptions
     - Title case for job titles and section headers
     - Smart formatting for phone numbers, emails, URLs
     - Remove extra whitespace and normalize spacing
     - Auto-format bullet points (ensure consistent punctuation)
   - **Implementation**: Create backend service `text_refiner.py` with API endpoint
   - **Impact**: Improves resume quality by ensuring professional formatting regardless of user input style
   - **Estimated Effort**: 4-6 hours

2. **Frontend Development Mode Configuration**
   - **Description**: Update docker-compose.yml to support development mode with hot reload
   - **Changes**:
     - Change frontend command from `npm start` to `npm run dev`
     - Remove `.next` volume mount in development
     - Keep node_modules volume mount
   - **Impact**: Eliminates need for frequent Docker rebuilds during development
   - **Estimated Effort**: 30 minutes

3. **Update SECRET_KEY in Production**
   - **Description**: Replace default secret key with strong random value in docker-compose.yml
   - **Changes**: Update line 10 in docker-compose.yml with secure secret
   - **Impact**: Critical security improvement for production deployment
   - **Estimated Effort**: 5 minutes

### 🟡 Medium Priority

4. **Additional LaTeX Templates**
   - **Description**: Add more resume template designs
   - **Templates to Add**:
     - Creative/Design-focused template
     - Executive/Professional template
     - Academic/CV template
   - **Impact**: More options for different industries and roles
   - **Estimated Effort**: 8-12 hours per template

5. **Resume Export to DOCX**
   - **Description**: Add option to export resume as Microsoft Word document
   - **Implementation**: Use python-docx library
   - **Impact**: Provides editable format for recruiters
   - **Estimated Effort**: 6-8 hours

6. **AI Service Integration with OpenAI API**
   - **Description**: Connect to OpenAI API for advanced AI suggestions
   - **Features**:
     - GPT-powered bullet point generation
     - Smart content rewriting
     - Professional tone adjustment
   - **Impact**: Significantly improve AI-powered suggestions
   - **Estimated Effort**: 10-15 hours

### 🟢 Low Priority

7. **Resume Analytics Dashboard**
   - **Description**: Track resume views, downloads, and application success
   - **Features**:
     - View count per resume
     - Download history
     - Application tracking
   - **Impact**: Help users understand which resumes perform best
   - **Estimated Effort**: 12-16 hours

8. **Email Notifications**
   - **Description**: Send email notifications for important events
   - **Features**:
     - Resume generated
     - Resume shared
     - Weekly resume tips
   - **Impact**: Keep users engaged with the platform
   - **Estimated Effort**: 8-10 hours

9. **Multi-language Support**
    - **Description**: Add support for multiple languages
    - **Languages**: Spanish, French, German, Portuguese
    - **Impact**: Expand user base globally
    - **Estimated Effort**: 20-30 hours

10. **Mobile App (React Native)**
    - **Description**: Build mobile companion app
    - **Features**:
      - View resumes on mobile
      - Quick edits
      - Share via email/link
    - **Impact**: Access resumes on-the-go
    - **Estimated Effort**: 40-60 hours

11. **Collaboration Features**
    - **Description**: Allow users to share resumes for feedback
    - **Features**:
      - Shareable links
      - Comment system
      - Version comparison
    - **Impact**: Peer review and mentorship capabilities
    - **Estimated Effort**: 16-20 hours

12. **Enhanced Job Analyzer**
    - **Description**: Improve job description analysis with more AI
    - **Features**:
      - Salary range extraction
      - Company research integration
      - Culture fit analysis
    - **Impact**: Better job matching insights
    - **Estimated Effort**: 12-15 hours

---

## � Text Refinement Layer - Feature Proposal

### Overview
The Text Refinement Layer is an intermediate processing service that automatically enhances user input text to ensure professional formatting in resumes. This layer sits between the frontend form submission and backend data storage, processing all text inputs before they are saved.

### Problem Statement
Users often enter resume data in various formats:
- All lowercase: "john doe", "software engineer at google"
- Inconsistent capitalization: "JAVA", "Python", "javascript"
- Poor formatting: "  extra  spaces  ", missing punctuation
- Incorrect case for proper nouns: "san francisco, ca" instead of "San Francisco, CA"
- Inconsistent bullet points: some with periods, some without

### Solution Architecture

#### Backend Implementation
**New Service**: `backend/app/services/text_refiner.py`

```python
# Key Functions:
- refine_text(text: str, field_type: str) -> str
- capitalize_proper_nouns(text: str) -> str
- format_job_title(text: str) -> str
- format_company_name(text: str) -> str
- format_location(text: str) -> str
- format_email(text: str) -> str
- format_phone(text: str) -> str
- normalize_bullet_point(text: str) -> str
- remove_extra_whitespace(text: str) -> str
```

**New API Endpoint**: `POST /api/text/refine`

Request:
```json
{
  "text": "john doe",
  "field_type": "name"
}
```

Response:
```json
{
  "original": "john doe",
  "refined": "John Doe",
  "changes": [
    {
      "type": "capitalization",
      "description": "Converted to title case"
    }
  ]
}
```

#### Frontend Integration
**Two Implementation Options:**

**Option 1: Real-time Refinement (Recommended)**
- Apply refinement as user types in form fields
- Show refined text with option to undo
- Provides immediate feedback
- Better user experience

**Option 2: Post-submission Refinement**
- Apply refinement when user clicks "Save" or "Generate PDF"
- Show summary of changes before final save
- Less intrusive but less immediate

### Field-Specific Refinement Rules

| Field Type | Refinement Rules | Example |
|------------|------------------|---------|
| **Name** | Title case | "john doe" → "John Doe" |
| **Email** | Lowercase, trim spaces | " JOHN@EXAMPLE.COM " → "john@example.com" |
| **Phone** | Format to +1-XXX-XXX-XXXX | "1234567890" → "+1-234-567-8900" |
| **Location** | Title case, standard format | "san francisco ca" → "San Francisco, CA" |
| **Job Title** | Title case | "software engineer" → "Software Engineer" |
| **Company** | Title case | "google" → "Google" |
| **Degree** | Title case | "bachelor of science" → "Bachelor of Science" |
| **University** | Title case | "state university" → "State University" |
| **Skills** | Proper noun capitalization | "python, react" → "Python, React" |
| **Bullet Points** | Sentence case, consistent punctuation | "implemented feature" → "Implemented feature." |
| **URLs** | Lowercase, trim spaces | " HTTPS://GITHUB.COM/USER " → "https://github.com/user" |

### Smart Features

1. **Context-Aware Capitalization**
   - Recognize common tech terms: JavaScript, Python, React, AWS, etc.
   - Preserve acronyms: CEO, CTO, MBA, PhD
   - Handle compound words: e-commerce, full-stack

2. **Intelligent Formatting**
   - Detect and format phone numbers from various input formats
   - Validate email format
   - Normalize URLs (add https:// if missing)
   - Format dates consistently

3. **Localization Support**
   - Handle different address formats by country
   - Support various phone number formats
   - Capitalization rules for different languages

### Implementation Steps

1. **Create Text Refiner Service**
   ```bash
   # File: backend/app/services/text_refiner.py
   # Implement refinement functions
   # Add unit tests
   ```

2. **Add API Endpoint**
   ```python
   # File: backend/app/routes/text_refiner.py
   # POST /api/text/refine endpoint
   # Integration with resume routes
   ```

3. **Frontend Integration**
   ```typescript
   # File: frontend/lib/textRefiner.ts
   # API client for text refinement
   # Form component integration
   ```

4. **UI Components**
   ```tsx
   # Add refinement toggle in form components
   # Show "Refined: John Doe" indicator
   # Add "Undo" button for each field
   ```

5. **Testing**
   - Unit tests for each refinement function
   - Integration tests for API endpoint
   - E2E tests for form submission

### Benefits

✅ **Professional Quality**: Ensures all resumes have consistent, professional formatting
✅ **User Experience**: Reduces user effort - they can type naturally
✅ **ATS Compatibility**: Proper formatting improves ATS parsing
✅ **Consistency**: All resumes follow the same formatting standards
✅ **Error Reduction**: Catches common formatting mistakes automatically

### Example Workflow

**Before:**
```
User Input:
  name: "john doe"
  email: " JOHN@EXAMPLE.COM "
  location: "san francisco ca"
  job_title: "software engineer"
  company: "google"
  bullets: ["implemented feature", "fixed bug"]
```

**After Refinement:**
```
Refined Output:
  name: "John Doe"
  email: "john@example.com"
  location: "San Francisco, CA"
  job_title: "Software Engineer"
  company: "Google"
  bullets: ["Implemented feature.", "Fixed bug."]
```

### Configuration Options

Users can customize refinement behavior:
- **Strict Mode**: Apply all refinements automatically
- **Suggestion Mode**: Show refinements but require approval
- **Disabled**: Skip refinement entirely (advanced users)

---

## �🎯 Feature Implementation Status

| Feature | Frontend | Backend | Database | Status |
|---------|----------|---------|----------|--------|
| User Registration | ✅ | ✅ | ✅ | Complete |
| User Login | ✅ | ✅ | ✅ | Complete |
| Build Resume | ✅ | - | ✅ | Complete |
| Save Resume | ✅ | ✅ | ✅ | Complete |
| Load Resume | ✅ | ✅ | ✅ | Complete |
| List Resumes | ✅ | ✅ | ✅ | Complete |
| Delete Resume | ✅ | ✅ | ✅ | Complete |
| Generate PDF | ✅ | ✅ | - | Complete |
| Download PDF | ✅ | ✅ | - | Complete |
| Export LaTeX | ✅ | ✅ | - | Complete |
| Analyze Job | ✅ | ✅ | - | Complete |
| Compare Resume | ✅ | ✅ | - | Complete |
| Improve Bullets | ✅ | ✅ | - | Complete |
| Check Grammar | ✅ | ✅ | - | Complete |
| Suggest Keywords | ✅ | ✅ | - | Complete |
| Tailor Resume | ✅ | ✅ | - | Complete |
| Check ATS | ✅ | ✅ | - | Complete |

## 📁 Project Structure

```
resume-forge/
├── frontend/                    # Next.js 14 Application
│   ├── app/
│   │   ├── page.tsx            # Landing page
│   │   ├── builder/page.tsx     # Resume builder (7-step form)
│   │   ├── dashboard/page.tsx   # Resume management dashboard
│   │   ├── job-analyzer/page.tsx # Job analysis & comparison
│   │   ├── login/page.tsx       # Login page
│   │   ├── register/page.tsx    # Registration page
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   ├── forms/              # 7 Form components (PersonalInfo, Education, Skills, etc.)
│   │   ├── ui/                 # UI components (Input, etc.)
│   │   └── ResumePreview.tsx
│   ├── lib/
│   │   ├── firebase.ts         # Firebase config & initialization
│   │   └── utils.ts
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── next.config.js
│   └── Dockerfile
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── main.py             # FastAPI setup, routers, CORS
│   │   ├── auth.py             # JWT, password hashing, security
│   │   ├── database.py         # Firebase Firestore client
│   │   ├── models/             # Firestore models
│   │   │   ├── user.py         # User class
│   │   │   ├── resume_version.py
│   │   │   └── __init__.py
│   │   ├── routes/             # API endpoints
│   │   │   ├── auth.py         # 3 endpoints: register, login, me
│   │   │   ├── resume.py       # 7 endpoints: generate, download, validate, etc.
│   │   │   └── resume_version.py # 4 endpoints: CRUD operations
│   │   ├── schemas/            # Pydantic validation schemas
│   │   │   ├── resume.py
│   │   │   ├── auth.py
│   │   │   ├── job.py
│   │   │   └── ai.py
│   │   ├── services/           # Business logic (7 AI services)
│   │   │   ├── ai_improver.py  # Bullet point improvement
│   │   │   ├── ats_checker.py  # ATS compatibility (0-100 score)
│   │   │   ├── content_optimizer.py # 4-level optimization
│   │   │   ├── grammar_checker.py  # 300+ rules
│   │   │   ├── job_analyzer.py # Extract job requirements
│   │   │   ├── job_tailor.py   # Resume-job matching
│   │   │   ├── keyword_suggester.py # Industry/role keywords
│   │   │   ├── latex_generator.py # Jinja2 template rendering
│   │   │   ├── pdf_generator.py # pdflatex compilation
│   │   │   └── pdf_validator.py # Page count validation
│   │   └── utils/
│   │       └── latex_escape.py  # LaTeX special chars escaping
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── init_db.py              # Firestore initialization
│   ├── .env.example
│   └── test_template.py
│
├── latex/templates/            # LaTeX Templates
│   ├── ats-one-page/          # ATS-friendly, one-page template
│   │   ├── resume.tex         
│   │   └── config.tex
│   └── modern-clean/          # Modern design template
│       └── resume.tex
│
├── docker/
│   └── latex/Dockerfile        # LaTeX environment for PDF compilation
│
├── database/
│   └── migrations/             # (For future use)
│
└── Configuration & Documentation
    ├── docker-compose.yml       # Container orchestration
    ├── README.md               # This file
    ├── FIREBASE_QUICKSTART.md  # 5-minute setup guide
    ├── FIREBASE_SETUP.md       # Comprehensive Firebase guide
    ├── FIREBASE_MIGRATION.md   # PostgreSQL → Firebase migration details
    ├── FREE_DEPLOYMENT.md      # Free deployment options
    └── SETUP.md                # Manual development setup
```

## 🚀 Quick Start Guide

### Prerequisites

You have already created:
- ✅ Firebase project with Firestore
- ✅ Firebase Authentication enabled
- ✅ Firebase Storage bucket
- ✅ Service account credentials (`firebase-credentials.json`)

### Option 1: Docker (Recommended - Fastest)

```bash
# Navigate to project root
cd resume-forge

# Set Firebase credentials as environment variable
export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)

# Build and run all services
docker-compose up -d

# Access the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:8000
# API Docs:  http://localhost:8000/docs
```

### Option 2: Manual Setup (Development)

#### Backend Setup
```bash
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate          # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Setup environment file
cp .env.example .env

# Edit .env and add:
# FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Place firebase-credentials.json in backend folder
# cp /path/to/firebase-credentials.json .

# Initialize Firestore
python init_db.py

# Run FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Setup environment file
cp .env.example .env.local

# Get Firebase config from Firebase Console > Project Settings
# Edit .env.local with your Firebase credentials:
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
# (other Firebase config values)

# Run development server
npm run dev
```

Now visit **http://localhost:3000** and start building resumes!

## 📚 API Overview

### Authentication Endpoints (3)
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Resume Generation (7)
- `POST /api/resume/generate` - Generate PDF (preview)
- `POST /api/resume/download` - Download resume PDF
- `POST /api/resume/validate` - Validate resume data
- `GET /api/resume/templates` - List available templates
- `POST /api/resume/latex-source` - Export LaTeX source code
- (AI service endpoints integrated in resume routes)

### Resume Versioning (4)
- `POST /api/resume-versions/` - Save new resume version
- `GET /api/resume-versions/` - List all user's resumes
- `GET /api/resume-versions/{version_id}` - Get specific resume
- `DELETE /api/resume-versions/{version_id}` - Delete resume

Full API documentation available at: **http://localhost:8000/docs**

## 🔐 Firebase Configuration

### Step 1: Download Service Account Key
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to **Project Settings** (⚙️ icon)
4. Click **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the JSON file as `firebase-credentials.json`

### Step 2: Secure the Credentials
```bash
# Add to .gitignore (never commit credentials!)
echo "firebase-credentials.json" >> backend/.gitignore
```

### Step 3: Configure Backend
Copy to backend folder:
```bash
cp /path/to/firebase-credentials.json backend/firebase-credentials.json
```

Or use environment variable (for Docker/Cloud):
```bash
export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)
```

### Step 4: Configure Frontend
1. Go to Firebase Console → **Project Settings**
2. Under "Your apps" section, copy the config object
3. Update `frontend/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 📊 Database Schema

### Firestore Collections

#### Users Collection: `/users/{uid}`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z",
  "resumes": []
}
```

#### Resumes Collection: `/resumes/{doc_id}`
```json
{
  "userId": "firebase_uid",
  "name": "Google Resume",
  "createdAt": "2024-01-15T10:30:00Z",
  "data": {
    "personal": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1-234-567-8900",
      "linkedin": "linkedin.com/in/johndoe",
      "github": "github.com/johndoe",
      "location": "San Francisco, CA"
    },
    "education": [
      {
        "degree": "Bachelor of Science",
        "institution": "State University",
        "university": "University Name",
        "cgpa": "3.8",
        "graduation_year": 2022
      }
    ],
    "skills": {
      "technical": "Python, JavaScript, React, FastAPI",
      "professional": "Leadership, Communication, Problem Solving"
    },
    "experience": [
      {
        "job_title": "Senior Engineer",
        "company": "Tech Corp",
        "date": "2022 - Present",
        "bullets": ["Achievement 1", "Achievement 2"]
      }
    ],
    "projects": [
      {
        "name": "Project Name",
        "technologies": "Tech Stack",
        "bullets": ["Feature 1", "Feature 2"]
      }
    ],
    "certifications": [
      {
        "name": "AWS Solutions Architect",
        "organization": "Amazon Web Services",
        "date": "2023",
        "certificate_id": "ABC123"
      }
    ],
    "achievements": ["Achievement 1", "Achievement 2"]
  }
}
```

## 🎯 AI Services Details

### Grammar Checker
- **Spelling**: 300+ common misspellings
- **Grammar**: Misplaced apostrophes, common confusions (their/there)
- **Resume-specific**: Lowercase "i", missing apostrophes
- **Smart filtering**: Ignores emails, URLs, phone numbers

### AI Improver
- **Action Verbs**: 23 high-impact verbs (developed, designed, implemented, etc.)
- **Weak Phrase Detection**: Replaces "helped" → "Collaborated on", etc.
- **Quantitative Analysis**: Suggests adding metrics and percentages
- **Scoring**: Calculates improvement percentage (0-100)

### Keyword Suggester
- **Industries**: 5 categories (Software, Data Science, Product, Web Dev, DevOps)
- **Roles**: 5 role types (Frontend, Backend, Full-stack, Data Scientist, DevOps)
- **Soft Skills**: 11 professional skills
- **Context-aware**: Suggests based on job description

### Job Analyzer
- **Skill Extraction**: Finds 40+ technical skills
- **Experience Detection**: Entry/Mid/Senior level
- **Education Requirements**: Degree types
- **Responsibility Parsing**: Extracts key duties
- **Keyword Analysis**: Finds repeated terms

### Job Tailor
- **Gap Analysis**: Identifies missing skills
- **Match Scoring**: 0-100 score
- **Recommendations**: Customized suggestions
- **Skill Mapping**: Maps resume to job requirements

### ATS Checker (7-Point Check)
1. ✅ Contact Information completeness
2. ✅ Education section presence & detail
3. ✅ Skills section completeness
4. ✅ Experience formatting
5. ✅ Document formatting (no tables, images)
6. ✅ Keyword presence
7. ✅ Resume length (1-2 pages)
- **Score**: 0-100 percentage

### Content Optimizer (4 Levels)
- **Level 1**: Reduce bullets (max 3 per section)
- **Level 2**: Reduce projects (max 3)
- **Level 3**: Reduce experience (max 2 positions)
- **Level 4**: Reduce achievements (max 5)

## 🔧 Environment Variables

### Backend (.env)
```env
# Firebase Configuration
FIREBASE_CREDENTIALS_PATH=firebase-credentials.json
# OR
FIREBASE_CREDENTIALS={"type":"service_account",...}

# JWT Settings
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Application
DEBUG=false
ENVIRONMENT=development
FRONTEND_URL=http://localhost:3000
LATEX_TEMPLATE_PATH=../latex/templates
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyD...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=resumeforge.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=resumeforge
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=resumeforge.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123...
```

## 🐛 Troubleshooting

### Firebase Credentials Not Found
```bash
# Check if file exists
ls -la backend/firebase-credentials.json

# Or set environment variable
export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)
docker-compose up -d
```

### Port Already in Use
```bash
# For Linux/Mac
lsof -i :8000
kill -9 <PID>

# For Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### LaTeX Compilation Error
- Ensure `pdflatex` is installed (test: `pdflatex --version`)
- Or use Docker which includes TeX Live
- Check LaTeX template syntax

### Firebase Permission Denied
1. Go to Firebase Console → **Firestore Database**
2. Click **Rules** tab
3. Update for development:
```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### Collection Not Appearing in Firebase Console
- Collections auto-create on first write
- Run `python init_db.py` to initialize
- Or make first API call (register a user)

## 📚 Complete Documentation

| Document | Purpose |
|----------|---------|
| [FIREBASE_QUICKSTART.md](FIREBASE_QUICKSTART.md) | 5-minute setup guide |
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Comprehensive Firebase configuration |
| [FIREBASE_MIGRATION.md](FIREBASE_MIGRATION.md) | Technical migration details (PostgreSQL → Firebase) |
| [SETUP.md](SETUP.md) | Manual development setup instructions |
| [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) | Free cloud deployment options |

## 🚀 Deployment Options

### Docker
```bash
export FIREBASE_CREDENTIALS=$(cat firebase-credentials.json)
docker-compose up -d
```

### Production Checklist
- [ ] Generate strong SECRET_KEY
- [ ] Set ENVIRONMENT=production
- [ ] Configure proper CORS origins
- [ ] Update Firebase security rules
- [ ] Use production Firebase project
- [ ] Set up SSL/HTTPS
- [ ] Configure logging/monitoring
- [ ] Enable rate limiting
- [ ] Backup Firestore
- [ ] Set up CI/CD

### Free Deployment
- **Frontend**: Vercel (free tier)
- **Backend**: Render.com or Railway (free tier)
- **Database**: Firebase Firestore (free tier: 50k reads/day)

See [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md) for detailed instructions.

## 📈 Project Statistics

| Metric | Value |
|--------|-------|
| Backend Endpoints | 14+ |
| AI Services | 7 |
| Frontend Pages | 7 |
| Form Components | 7 |
| LaTeX Templates | 2 |
| Lines of Code | 3000+ |
| Firestore Collections | 2 |
| API Response Types | 10+ |
| Supported Resume Versions | Unlimited |

## 🎓 Learning Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Tutorial](https://fastapi.tiangolo.com)
- [Firebase Firestore Guide](https://firebase.google.com/docs/firestore)
- [Jinja2 Template Engine](https://jinja.palletsprojects.com)
- [LaTeX Guide](https://www.latex-project.org/help/)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - See LICENSE file for details

## ❓ Support & Issues

- 📖 Check documentation files
- 🐛 Report bugs via GitHub Issues
- 💬 Discussions for general questions
- 📧 Email: support@resumeforge.dev

---

## 🎯 Next Steps

1. **Clone/Download** the project
2. **Add Firebase credentials** to `backend/firebase-credentials.json`
3. **Update** `frontend/.env.local` with Firebase config
4. **Run** `docker-compose up -d` (or manual setup)
5. **Visit** http://localhost:3000
6. **Start building resumes!** 🎉

### Future Enhancements Pipeline
- ✨ Connect to OpenAI API for advanced AI suggestions
- 📄 DOCX export format
- 👥 Collaboration features
- 📱 Mobile app (React Native)
- 📊 Resume analytics & tracking
- 🎨 More LaTeX templates
- 🔔 Email notifications
- 🌐 Multi-language support

---

**Built with ❤️ for job seekers worldwide**

Last Updated: October 2026 | Status: Production Ready ✅
