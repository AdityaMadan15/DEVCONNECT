import Project from '../models/Project.js';
import Request from '../models/Request.js';
import Message from '../models/Message.js';

export const createProject = async (req, res) => {
  try {
    const { title, description, techStack, members, status, githubLink } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    const project = await Project.create({
      title,
      description,
      techStack,
      owner: req.user._id,  // Always use authenticated user — prevents impersonation
      members,
      status,
      githubLink,
    });

    return res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('createProject error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create project',
    });
  }
};

export const getProjects = async (req, res) => {
  try {
    const { owner, user } = req.query;
    const filter = {};

    if (owner) {
      filter.owner = owner;
    }

    if (user) {
      filter.$or = [{ owner: user }, { members: user }];
    }

    const projects = await Project.find(filter)
      .populate('owner', 'name email')
      .populate('members', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: projects,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('getProjects error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch projects',
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate('owner', 'name email')
      .populate('members', 'name');

    if (!project) {
      return res.status(404).json({
        success: false,
        error: 'Project not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('getProjectById error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch project',
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch first to check ownership
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this project' });
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('owner', 'name email')
      .populate('members', 'name');

    return res.status(200).json({
      success: true,
      data: updatedProject,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('updateProject error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update project',
    });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch first to check ownership
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this project' });
    }

    // Cascade delete related data
    await Request.deleteMany({ projectId: id });
    await Message.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('deleteProject error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete project',
    });
  }
};

export const leaveProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    // Remove the user from the members array
    project.members = project.members.filter(m => m.toString() !== req.user._id.toString());
    await project.save();

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('leaveProject error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to leave project',
    });
  }
};

