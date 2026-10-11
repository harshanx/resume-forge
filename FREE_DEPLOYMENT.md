# Zero-Cost Deployment Guide

ResumeForge can be deployed completely free. Here are your options:

## Option 1: Local Development (Free)

Run on your own machine:
```bash
docker-compose up -d
```
- **Cost**: $0
- **Pros**: Full control, no limits
- **Cons**: Not publicly accessible, requires your machine to be on

## Option 2: Free Cloud Platforms

### Render.com (Recommended)
- **Backend**: Render Free Tier
- **Frontend**: Vercel Free Tier
- **Database**: Not needed (stateless)
- **Cost**: $0/month
- **Limits**: 
  - Backend: 750 hours/month (enough for development)
  - Sleeps after 15 min inactivity (wakes in ~30 sec)
  - 512MB RAM

### Railway.app
- **Backend**: Railway Free Tier ($5 credit/month)
- **Frontend**: Vercel Free Tier
- **Cost**: $0 (with free credits)
- **Limits**: 512MB RAM, $5 free credit monthly

### Koyeb
- **Backend**: Koyeb Free Tier
- **Frontend**: Vercel Free Tier
- **Cost**: $0
- **Limits**: 512MB RAM, 1 vCPU, always-on (no sleep)

## Option 3: Student Benefits

If you're a student, you get free credits:
- **GitHub Student Pack**: Includes $200+ in cloud credits
  - DigitalOcean ($200)
  - AWS ($100)
  - Google Cloud ($50)
  - Namecheap domain
  - JetBrains tools
- **Apply**: https://education.github.com/pack

## Recommended Free Stack

```
Frontend: Vercel (Free)
  - Automatic HTTPS
  - Global CDN
  - Git deployment
  - 100GB bandwidth/month

Backend: Render.com (Free)
  - Automatic HTTPS
  - Auto-deploy from GitHub
  - 750 hours/month
  - 512MB RAM

LaTeX: Built into backend container
  - No additional service needed

Storage: Not needed (stateless)
  - PDFs generated on-demand
  - No database required
```

## Deployment Steps (Render + Vercel)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/resume-forge.git
git push -u origin main
```

### 2. Deploy Backend to Render
1. Go to https://render.com
2. Sign up (free)
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: resumeforge-backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: Free
6. Add Environment Variable:
   - `SECRET_KEY`: (generate random string)
7. Deploy

### 3. Deploy Frontend to Vercel
1. Go to https://vercel.com
2. Sign up (free)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Environment Variable**: `NEXT_PUBLIC_API_URL` = (your Render backend URL)
6. Deploy

### 4. Update Frontend API URL
After backend is deployed, update:
```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://resumeforge-backend.onrender.com
```

## Alternative: Single Container Deployment

For simplicity, deploy everything as one service:

### Prepare Single Dockerfile
```dockerfile
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim AS backend
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY latex/ ./latex/
RUN mkdir -p temp
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Deploy this single container to:
- Render.com
- Railway.app
- Koyeb
- Fly.io

## Cost Comparison

| Platform | Monthly Cost | Always On | Sleep Time |
|----------|-------------|-----------|------------|
| Local | $0 | Yes | N/A |
| Render | $0 | No | 15 min |
| Railway | $0 (with credit) | Yes | N/A |
| Koyeb | $0 | Yes | N/A |
| Fly.io | $0 (free allowance) | Yes | N/A |
| AWS (Student) | $0 (with credit) | Yes | N/A |

## Limitations of Free Tiers

**Common limitations:**
- RAM: 512MB - 1GB
- CPU: Shared vCPU
- Bandwidth: 100GB/month
- Sleep after inactivity (Render)
- No custom domain (or limited)

**For ResumeForge:**
- 512MB RAM is sufficient
- LaTeX compilation is CPU-intensive but manageable
- Sleep time is acceptable for portfolio project
- Bandwidth limit is generous for resume generation

## Performance Tips for Free Tiers

1. **Optimize images** (if you add any)
2. **Enable compression** (already in FastAPI)
3. **Use CDN** (Vercel provides this)
4. **Cache generated resumes** (add Redis later if needed)
5. **Minimize dependencies** (already done)

## Monitoring Free Usage

Most platforms show:
- CPU usage
- RAM usage
- Bandwidth
- Request count

Check these to ensure you stay within free limits.

## When to Upgrade

Consider paid tier when:
- Consistent traffic (1000+ daily users)
- Need faster performance
- Need custom domain
- Need 24/7 uptime
- Want to add user authentication with database

**Typical upgrade cost**: $5-20/month

## Summary

**Best free option for you:**
1. **Development**: Local (docker-compose)
2. **Public deployment**: Render (backend) + Vercel (frontend)
3. **Student**: Use GitHub Student Pack for better options

**Total cost**: $0/month

The current architecture is already optimized for free deployment - no database, stateless, minimal dependencies. You can deploy this today without spending any money.
