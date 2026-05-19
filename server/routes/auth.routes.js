import express from 'express';
import {
  loginUser,
  registerUser,
  getMe,
  githubAuth,
  githubCallback,
} from '../controllers/auth.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', authMiddleware, getMe);
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

export default router;
