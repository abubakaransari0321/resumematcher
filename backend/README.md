# ResumeRAG Backend API

A powerful Node.js + Express + MongoDB backend for analyzing resume-job matches with AI-powered skill extraction.

## 🚀 Features

- **JWT Authentication** - Secure user authentication with JSON Web Tokens
- **Resume Upload & Parsing** - PDF/DOCX file upload with automatic text extraction
- **Skill Extraction** - AI-powered skill detection from resumes and job descriptions
- **Smart Matching** - Calculate match percentage between resumes and jobs
- **Idempotency** - Duplicate request prevention with Idempotency-Key header
- **Rate Limiting** - 60 requests/min per user to prevent abuse
- **Pagination** - Efficient data fetching with limit/offset pagination
- **RESTful API** - Clean, consistent API design

## 📋 Prerequisites

- Node.js >= 16.0.0
- MongoDB >= 4.4 (running locally or remote)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Edit `.env` file with your settings:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/resumerag
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
CORS_ORIGIN=*
```

4. **Start MongoDB**
```bash
# If running locally
mongod
```

5. **Run the server**
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All endpoints except `/auth/*` require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

### 🔐 Auth Endpoints

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Current User
```http
GET /api/auth/me
```

**Response:** `200 OK`
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john@example.com"
}
```

---

### 📄 Resume Endpoints

#### Upload Resume
```http
POST /api/resumes
Content-Type: multipart/form-data
Idempotency-Key: unique-key-123 (optional)
```

**Form Data:**
- `file`: PDF or DOCX file (required)
- `name`: Candidate name (optional, extracted from resume if not provided)
- `email`: Candidate email (optional)
- `phone`: Candidate phone (optional)

**Response:** `201 Created`
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1-234-567-8900",
  "skills": ["React", "Node.js", "MongoDB", "JavaScript", "AWS"],
  "uploaded_at": "2025-10-04T17:00:00.000Z"
}
```

#### Get All Resumes (with pagination)
```http
GET /api/resumes?limit=10&offset=0&q=React
```

**Query Parameters:**
- `limit` (optional, default: 10) - Number of items per page
- `offset` (optional, default: 0) - Starting position
- `q` (optional) - Search by name or skills

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "phone": "+1-234-567-8900",
      "skills": ["React", "Node.js", "MongoDB"],
      "filename": "john_doe_resume.pdf",
      "uploaded_at": "2025-10-04T17:00:00.000Z"
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0,
  "next_offset": 10
}
```

#### Get Resume by ID
```http
GET /api/resumes/:id
```

**Response:** `200 OK`
```json
{
  "id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "name": "John Doe",
  "email": "john.doe@email.com",
  "phone": "+1-234-567-8900",
  "skills": ["React", "Node.js", "MongoDB", "JavaScript", "AWS"],
  "text": "Full extracted text from resume...",
  "filename": "john_doe_resume.pdf",
  "filesize": 245760,
  "mimetype": "application/pdf",
  "uploaded_at": "2025-10-04T17:00:00.000Z",
  "updated_at": "2025-10-04T17:00:00.000Z"
}
```

#### Delete Resume
```http
DELETE /api/resumes/:id
```

**Response:** `200 OK`
```json
{
  "message": "Resume deleted successfully"
}
```

---

### 💼 Job Endpoints

#### Create Job
```http
POST /api/jobs
Idempotency-Key: unique-key-456 (optional)
```

**Request Body:**
```json
{
  "title": "Full Stack Developer",
  "description": "We are looking for a Full Stack Developer with experience in React, Node.js, MongoDB, and AWS. Strong knowledge of JavaScript and TypeScript required.",
  "company": "Tech Corp",
  "location": "San Francisco, CA"
}
```

**Response:** `201 Created`
```json
{
  "id": "64f2b3c4d5e6f7g8h9i0j1k2",
  "title": "Full Stack Developer",
  "description": "We are looking for...",
  "company": "Tech Corp",
  "location": "San Francisco, CA",
  "skills_required": ["React", "Node.js", "MongoDB", "AWS", "JavaScript", "TypeScript"],
  "created_at": "2025-10-04T17:30:00.000Z"
}
```

#### Get All Jobs (with pagination)
```http
GET /api/jobs?limit=10&offset=0
```

**Response:** `200 OK`
```json
{
  "items": [
    {
      "id": "64f2b3c4d5e6f7g8h9i0j1k2",
      "title": "Full Stack Developer",
      "description": "We are looking for...",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "skills_required": ["React", "Node.js", "MongoDB"],
      "created_at": "2025-10-04T17:30:00.000Z"
    }
  ],
  "total": 5,
  "limit": 10,
  "offset": 0,
  "next_offset": null
}
```

#### Get Job by ID
```http
GET /api/jobs/:id
```

#### Update Job
```http
PUT /api/jobs/:id
Idempotency-Key: unique-key-789 (optional)
```

**Request Body:**
```json
{
  "title": "Senior Full Stack Developer",
  "description": "Updated description..."
}
```

#### Delete Job
```http
DELETE /api/jobs/:id
```

---

### 🤝 Matching Endpoints

#### Match All Resumes with a Job
```http
POST /api/jobs/:id/match
```

**Response:** `200 OK`
```json
{
  "job_id": "64f2b3c4d5e6f7g8h9i0j1k2",
  "job_title": "Full Stack Developer",
  "job_skills_required": ["React", "Node.js", "MongoDB", "AWS", "TypeScript"],
  "total_resumes_analyzed": 3,
  "matches": [
    {
      "resume_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "name": "John Doe",
      "email": "john.doe@email.com",
      "match_percent": 85,
      "matched_skills": ["React", "Node.js", "MongoDB", "AWS"],
      "missing_skills": ["TypeScript"],
      "total_resume_skills": 12,
      "total_job_skills": 5
    },
    {
      "resume_id": "64f1a2b3c4d5e6f7g8h9i0j2",
      "name": "Jane Smith",
      "email": "jane.smith@email.com",
      "match_percent": 60,
      "matched_skills": ["React", "Node.js", "TypeScript"],
      "missing_skills": ["MongoDB", "AWS"],
      "total_resume_skills": 10,
      "total_job_skills": 5
    }
  ]
}
```

#### Match Specific Resume with Specific Job
```http
POST /api/jobs/:jobId/match/:resumeId
```

#### Find Best Jobs for a Resume
```http
GET /api/resumes/:id/matches
```

**Response:** `200 OK`
```json
{
  "resume_id": "64f1a2b3c4d5e6f7g8h9i0j1",
  "resume_name": "John Doe",
  "resume_skills": ["React", "Node.js", "MongoDB", "AWS"],
  "total_jobs_analyzed": 5,
  "matches": [
    {
      "job_id": "64f2b3c4d5e6f7g8h9i0j1k2",
      "title": "Full Stack Developer",
      "company": "Tech Corp",
      "location": "San Francisco, CA",
      "match_percent": 85,
      "matched_skills": ["React", "Node.js", "MongoDB", "AWS"],
      "missing_skills": ["TypeScript"]
    }
  ]
}
```

---

## 🔧 Advanced Features

### Idempotency

All POST requests support idempotency to prevent duplicate operations:

```http
POST /api/resumes
Idempotency-Key: unique-key-for-this-request
```

If you send the same request with the same key, you'll receive the cached response instead of creating a duplicate.

### Rate Limiting

- **Auth endpoints**: 10 requests per 15 minutes
- **General API**: 60 requests per minute per user
- **File uploads**: 20 uploads per 15 minutes

Rate limit info is returned in response headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1696435200
```

### Pagination

List endpoints support pagination:
```http
GET /api/resumes?limit=20&offset=40
```

Response includes pagination metadata:
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 40,
  "next_offset": 60
}
```

---

## 🧪 Testing the API

### Test Credentials

```json
{
  "email": "test@resumerag.com",
  "password": "test123456"
}
```

### Sample cURL Commands

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@resumerag.com","password":"test123456"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@resumerag.com","password":"test123456"}'
```

**Upload Resume:**
```bash
curl -X POST http://localhost:5000/api/resumes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/resume.pdf" \
  -F "name=John Doe"
```

**Create Job:**
```bash
curl -X POST http://localhost:5000/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Full Stack Developer","description":"Looking for React and Node.js experience"}'
```

---

## 🎯 Skill Extraction

The system automatically extracts **100+ common technical skills** including:

- **Languages**: JavaScript, TypeScript, Python, Java, C++, Go, Rust, etc.
- **Web**: React, Angular, Vue, Node.js, Express, Django, Flask, etc.
- **Databases**: MongoDB, PostgreSQL, MySQL, Redis, etc.
- **Cloud**: AWS, Azure, GCP, Docker, Kubernetes, etc.
- **Tools**: Git, JIRA, Jenkins, etc.

Skills are extracted using keyword matching with word boundaries for accurate detection.

---

## 📊 Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "message": "Human-readable error message"
  }
}
```

### Common Error Codes

- `FIELD_REQUIRED` - Missing required field
- `INVALID_CREDENTIALS` - Wrong email/password
- `UNAUTHORIZED` - Missing or invalid token
- `NOT_FOUND` - Resource not found
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `FILE_TOO_LARGE` - File exceeds size limit
- `INVALID_FILE_TYPE` - Unsupported file format
- `SERVER_ERROR` - Internal server error

---

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── app.js                 # Main Express application
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   ├── resumes.js        # Resume routes
│   │   ├── jobs.js           # Job routes
│   │   └── match.js          # Matching routes
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── resumeController.js
│   │   ├── jobController.js
│   │   └── matchController.js
│   ├── models/
│   │   ├── User.js           # User schema
│   │   ├── Resume.js         # Resume schema
│   │   └── Job.js            # Job schema
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   ├── idempotency.js    # Idempotency handling
│   │   └── rateLimit.js      # Rate limiting
│   ├── utils/
│   │   └── extractSkills.js  # Skill extraction logic
│   └── config/
│       └── db.js             # Database connection
├── uploads/                   # Uploaded files storage
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Update `.env` with production values
2. **MongoDB**: Use a production MongoDB instance (MongoDB Atlas recommended)
3. **JWT Secret**: Generate a strong, random secret
4. **File Storage**: Consider using S3 or cloud storage instead of local filesystem
5. **Rate Limiting**: Adjust limits based on your needs
6. **CORS**: Configure specific origins instead of `*`

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

---

## 📝 License

MIT License

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ using Node.js, Express, and MongoDB**
