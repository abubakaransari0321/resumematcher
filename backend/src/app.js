import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import { apiLimiter } from './middleware/rateLimit.js';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/auth.js';
import resumeRoutes from './routes/resumes.js';
import jobRoutes from './routes/jobs.js';
import matchRoutes from './routes/match.js';

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', apiLimiter, resumeRoutes);
app.use('/api/jobs', apiLimiter, jobRoutes);
app.use('/api', apiLimiter, matchRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to ResumeRAG API',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
      },
      resumes: {
        upload: 'POST /api/resumes',
        list: 'GET /api/resumes',
        get: 'GET /api/resumes/:id',
        delete: 'DELETE /api/resumes/:id',
        findMatches: 'GET /api/resumes/:id/matches',
      },
      jobs: {
        create: 'POST /api/jobs',
        list: 'GET /api/jobs',
        get: 'GET /api/jobs/:id',
        update: 'PUT /api/jobs/:id',
        delete: 'DELETE /api/jobs/:id',
        match: 'POST /api/jobs/:id/match',
      },
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found',
    },
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      error: {
        code: 'FILE_TOO_LARGE',
        message: 'File size exceeds the maximum limit',
      },
    });
  }

  if (err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: {
        code: 'INVALID_FILE_TYPE',
        message: err.message,
      },
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: errors.join(', '),
      },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      error: {
        code: 'DUPLICATE_KEY',
        message: 'Resource already exists',
      },
    });
  }

  // Default error
  res.status(err.status || 500).json({
    error: {
      code: err.code || 'SERVER_ERROR',
      message: err.message || 'Internal server error',
    },
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║      ResumeRAG API Server              ║
║      Running on port ${PORT}             ║
║      Environment: ${process.env.NODE_ENV || 'development'}        ║
╚════════════════════════════════════════╝
  `);
});

export default app;
