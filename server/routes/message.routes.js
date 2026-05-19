import express from 'express';
import { getMessagesByProject } from '../controllers/message.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/:projectId', authMiddleware, getMessagesByProject);

export default router;
