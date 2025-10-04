import express from 'express';
import {
  matchResumesWithJob,
  matchSingleResume,
  findJobsForResume,
} from '../controllers/matchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Match all resumes with a job
router.post('/jobs/:id/match', matchResumesWithJob);

// Match specific resume with specific job
router.post('/jobs/:jobId/match/:resumeId', matchSingleResume);

// Find best jobs for a resume
router.get('/resumes/:id/matches', findJobsForResume);

export default router;
