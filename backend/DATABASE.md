# Database Setup Guide

## Overview
ResumeForge uses **SQLite** with SQLAlchemy ORM for data persistence. This is perfect for development and portfolio projects.

## Database File
- **Location**: `backend/resumeforge.db`
- **Type**: SQLite (single file database)
- **ORM**: SQLAlchemy

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR,
    hashed_password VARCHAR NOT NULL
);
```

### Resume Versions Table
```sql
CREATE TABLE resume_versions (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    version_name VARCHAR NOT NULL,
    resume_data TEXT NOT NULL,  -- JSON string
    template VARCHAR DEFAULT 'ats-one-page',
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## Setup Instructions

### 1. Initialize Database
```bash
cd backend
python init_db.py
```

This will create the `resumeforge.db` file and all necessary tables.

### 2. Environment Variables
The database URL is configured in `app/database.py`:
```python
DATABASE_URL = "sqlite:///./resumeforge.db"
```

You can override this with an environment variable if needed.

## Database Models

### User Model (`app/models/user.py`)
- Stores user authentication information
- Email is unique
- Password is hashed using bcrypt

### ResumeVersion Model (`app/models/resume_version.py`)
- Stores multiple resume versions per user
- Resume data is stored as JSON string
- Links to user via foreign key

## Database Operations

### Adding a User
```python
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
user = User(
    email="user@example.com",
    name="John Doe",
    hashed_password=get_password_hash("password123")
)
db.add(user)
db.commit()
```

### Querying Resume Versions
```python
from app.database import SessionLocal
from app.models import ResumeVersion

db = SessionLocal()
versions = db.query(ResumeVersion).filter(
    ResumeVersion.user_id == user_id
).all()
```

## Migrating to PostgreSQL (Future)

If you want to switch to PostgreSQL for production:

1. Install PostgreSQL
2. Update DATABASE_URL in `app/database.py`:
   ```python
   DATABASE_URL = "postgresql://user:password@localhost/resumeforge"
   ```
3. Install psycopg2:
   ```bash
   pip install psycopg2-binary
   ```
4. Re-run `python init_db.py`

## Database Backup

### Backup SQLite Database
```bash
cp resumeforge.db resumeforge_backup.db
```

### Restore from Backup
```bash
cp resumeforge_backup.db resumeforge.db
```

## Viewing Database

You can use any SQLite browser to view the database:
- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- **DBeaver** (https://dbeaver.io/)

## Troubleshooting

### Database Locked Error
If you get "database is locked" error:
- Make sure only one process is accessing the database
- Close any database viewers/browsers
- Restart the backend server

### Table Not Found Error
If you get "no such table" error:
- Run `python init_db.py` to recreate tables
- Check that you're in the correct directory

### Migration Issues
If you need to change the schema:
1. Delete `resumeforge.db`
2. Update your models
3. Run `python init_db.py` again

**Note**: This will delete all data. For production, use proper migration tools like Alembic.
