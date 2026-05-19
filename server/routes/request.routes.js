import express from 'express';
import {
  createRequest,
  getRequests,
  updateRequest,
  deleteRequest,
} from '../controllers/request.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, getRequests);
router.post('/', authMiddleware, createRequest);
router.put('/:id', authMiddleware, updateRequest);
router.delete('/:id', authMiddleware, deleteRequest);

export default router;
