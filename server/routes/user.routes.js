import express from 'express';
import { getAllUsers, getUser, updateUser } from '../controllers/user.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id', authMiddleware, updateUser);

export default router;
