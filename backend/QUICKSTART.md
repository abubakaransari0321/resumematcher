# 🚀 Quick Start Guide - ResumeRAG Backend

Get your ResumeRAG backend up and running in 5 minutes!

## Prerequisites Check

✅ Node.js 16+ installed (`node --version`)  
✅ MongoDB installed and running  
✅ npm or yarn available

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install all required packages including Express, Mongoose, JWT, Multer, and more.

## Step 2: Configure Environment

The `.env` file is already created. Update if needed:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resumerag
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

## Step 3: Start MongoDB

### Windows:
```bash
# Start MongoDB service
net start MongoDB

# Or run mongod directly
mongod
```

### Mac/Linux:
```bash
# Using Homebrew (Mac)
brew services start mongodb-community

# Or run mongod directly
mongod --dbpath /path/to/data
```

## Step 4: Start the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
╔════════════════════════════════════════╗
║      ResumeRAG API Server              ║
║      Running on port 5000              ║
║      Environment: development          ║
╚════════════════════════════════════════╝
```

## Step 5: Test the API

### Test Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-04T17:30:00.000Z",
  "uptime": 10.5
}
```

### Register a Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@resumerag.com","password":"test123456"}'
```

Expected response:
```json
{
  "id": "...",
  "name": "Test User",
  "email": "test@resumerag.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token!** You'll need it for authenticated requests.

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@resumerag.com","password":"test123456"}'
```

### Create a Job Posting
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Full Stack Developer",
    "description": "Looking for a developer with React, Node.js, MongoDB, and AWS experience",
    "company": "Tech Corp",
    "location": "San Francisco, CA"
  }'
```

### Upload a Resume
```bash
curl -X POST http://localhost:5000/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -F "file=@/path/to/resume.pdf" \
  -F "name=John Doe"
```

### Match Resumes with Job
```bash
curl -X POST http://localhost:5000/api/jobs/JOB_ID_HERE/match \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## 🎯 Next Steps

1. **Upload more resumes** - Test with different PDF/DOCX files
2. **Create multiple jobs** - Try different job descriptions
3. **Test matching** - See how well resumes match with jobs
4. **Explore pagination** - Try `GET /api/resumes?limit=5&offset=0`
5. **Test idempotency** - Use the same `Idempotency-Key` header twice

## 🔍 Useful Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Check server health |
| `/` | GET | API documentation |
| `/api/auth/register` | POST | Create new user |
| `/api/auth/login` | POST | Get auth token |
| `/api/resumes` | POST | Upload resume |
| `/api/resumes` | GET | List resumes |
| `/api/jobs` | POST | Create job |
| `/api/jobs/:id/match` | POST | Match resumes with job |

## 🐛 Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running (`mongod` or service start)

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Change `PORT` in `.env` or stop the other process

### File Upload Error
```
Error: LIMIT_FILE_SIZE
```
**Solution:** File is too large. Increase `MAX_FILE_SIZE` in `.env`

### JWT Token Error
```
Error: jwt malformed
```
**Solution:** Make sure you're including the full token with `Bearer ` prefix

## 📖 Full Documentation

See [README.md](./README.md) for complete API documentation with all endpoints, request/response examples, and advanced features.

## 🎉 You're All Set!

Your ResumeRAG backend is now running and ready to accept requests. 

Connect your React frontend at `http://localhost:5000/api` 🚀
