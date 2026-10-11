# ResumeForge Setup Guide

## Prerequisites

- Docker and Docker Compose installed
- Git (for cloning)
- Basic knowledge of command line

## Quick Start (Docker)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resume-forge
   ```

2. **Configure environment variables**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Manual Setup (Development)

### Backend Setup

1. **Install Python dependencies**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Install LaTeX (required for PDF generation)**
   
   **Ubuntu/Debian:**
   ```bash
   sudo apt-get update
   sudo apt-get install texlive-full
   ```
   
   **macOS:**
   ```bash
   brew install mactex
   ```
   
   **Windows:**
   Download and install from: https://www.tug.org/texlive/acquire-netinstall.html

3. **Set up SQLite Database**
   ```bash
   # Initialize the database (creates resumeforge.db)
   python init_db.py
   ```

   **Note**: SQLite is used by default for simplicity. For production, you can switch to PostgreSQL by changing the DATABASE_URL in .env.

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

5. **Run the backend**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Install Node.js dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Edit .env.local if backend is not at localhost:8000
   ```

3. **Run the frontend**
   ```bash
   npm run dev
   ```

4. **Access the application**
   Open http://localhost:3000 in your browser

## Project Structure

```
resume-forge/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── models/         # Database models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   │   ├── latex_generator.py    # LaTeX template rendering
│   │   │   ├── pdf_generator.py      # PDF compilation
│   │   │   ├── pdf_validator.py      # One-page validation
│   │   │   └── content_optimizer.py  # Content optimization
│   │   └── utils/          # Utility functions
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── page.tsx        # Landing page
│   │   ├── builder/        # Resume builder page
│   │   └── layout.tsx
│   ├── components/
│   │   ├── forms/          # Form components
│   │   ├── ui/             # UI components
│   │   └── ResumePreview.tsx
│   ├── package.json
│   └── Dockerfile
├── latex/                  # LaTeX templates
│   └── templates/
│       └── ats-one-page/   # ATS-friendly template
│           ├── resume.tex
│           └── config.tex
├── docker/
│   └── latex/
│       └── Dockerfile      # LaTeX compiler container
├── docker-compose.yml      # Multi-container orchestration
└── README.md
```

## API Endpoints

### Generate Resume
```bash
POST /api/resume/generate
Content-Type: application/json

{
  "personal": {
    "name": "Harshan P V",
    "phone": "+91 9778566031",
    "email": "harshanpv3@gmail.com",
    "linkedin": "linkedin.com/in/harshan-p-v",
    "github": "github.com/harshanx",
    "location": "Malappuram, Kerala"
  },
  "education": [...],
  "skills": {...},
  "experience": [...],
  "projects": [...],
  "certifications": [...],
  "achievements": [...]
}
```

### Download Resume
```bash
POST /api/resume/download
Content-Type: application/json

{... same payload as generate ...}
```

### Validate Resume
```bash
POST /api/resume/validate
Content-Type: application/json

{... same payload as generate ...}
```

## Features Implemented

### Phase 1 (Complete)
- ✅ Landing page
- ✅ Multi-step resume form
- ✅ Personal information form
- ✅ Education form (multiple entries)
- ✅ Skills form (technical & professional)
- ✅ Experience form (with bullets)
- ✅ Projects form (with bullets)
- ✅ Certifications form
- ✅ Achievements form
- ✅ ATS-friendly LaTeX template
- ✅ LaTeX to PDF compilation
- ✅ One-page PDF validation
- ✅ Automatic content optimization
- ✅ Live resume preview
- ✅ PDF download

### Phase 2 (Complete)
- ✅ User authentication (JWT-based)
- ✅ Resume versioning system
- ✅ Multiple LaTeX templates (ATS-One-Page, Modern-Clean)
- ✅ Download LaTeX source
- ✅ ATS compatibility checker
- ✅ Job description analyzer

### Phase 3 (Complete)
- ✅ AI bullet improvement
- ✅ Grammar correction
- ✅ Keyword suggestions
- ✅ Job-specific resume generation

## Troubleshooting

### LaTeX compilation fails
- Ensure TeX Live is installed and pdflatex is in PATH
- Check that the LaTeX template syntax is correct
- Verify user input is properly escaped

### PDF exceeds one page
- The system automatically optimizes content
- Check warnings in the response
- Manually reduce content if optimization fails

### Frontend cannot connect to backend
- Verify NEXT_PUBLIC_API_URL in .env.local
- Check that backend is running on the specified port
- Ensure CORS is configured correctly

### Database connection issues
- Verify PostgreSQL is running
- Check DATABASE_URL in backend/.env
- Ensure database credentials are correct

## Development Tips

1. **Testing LaTeX template locally:**
   ```bash
   cd latex/templates/ats-one-page
   pdflatex resume.tex
   ```

2. **Viewing API documentation:**
   Navigate to http://localhost:8000/docs

3. **Hot reload:**
   - Backend: Use `--reload` flag with uvicorn
   - Frontend: Next.js automatically hot-reloads

4. **Debugging:**
   - Check backend logs in terminal
   - Use browser DevTools for frontend
   - Check Docker logs: `docker-compose logs -f`

## Security Notes

- User input is escaped before LaTeX compilation
- LaTeX compilation runs in isolated Docker container
- Never allow users to upload arbitrary LaTeX code
- Change SECRET_KEY in production
- Configure CORS appropriately for production

## License

This project is for educational and portfolio purposes.
