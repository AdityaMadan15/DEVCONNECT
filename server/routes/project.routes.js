import express from 'express';
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  leaveProject,
} from '../controllers/project.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getProjects);
router.post('/', authMiddleware, createProject);
router.get('/:id', getProjectById);
router.put('/:id', authMiddleware, updateProject);
router.delete('/:id', authMiddleware, deleteProject);
router.delete('/:id/leave', authMiddleware, leaveProject);

export default router;
