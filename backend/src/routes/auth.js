import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

export default router;
