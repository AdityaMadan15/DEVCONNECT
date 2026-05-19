import Request from '../models/Request.js';
import Project from '../models/Project.js';

export const createRequest = async (req, res) => {
  try {
    const { from, to, projectId, status } = req.body;

    if (!from || !to || !projectId) {
      return res.status(400).json({
        success: false,
        error: 'from, to and projectId are required',
      });
    }

    // Prevent duplicate pending requests
    const existing = await Request.findOne({ from, to, projectId, status: 'pending' });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'A pending request already exists',
      });
    }

    const request = await Request.create({
      from,
      to,
      projectId,
      status,
    });

    return res.status(201).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('createRequest error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create request',
    });
  }
};

export const getRequests = async (req, res) => {
  try {
    const { to, from, projectId } = req.query;
    const filter = {};

    if (to) filter.to = to;
    if (from) filter.from = from;
    if (projectId) filter.projectId = projectId;

    const requests = await Request.find(filter)
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('getRequests error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch requests',
    });
  }
};

export const updateRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = ['status'];
    const updates = {};

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
      });
    }

    const request = await Request.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar')
      .populate('projectId', 'title status');

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    // If request was accepted, add the recipient to the Project's members array
    if (updates.status === 'accepted') {
      const project = await Project.findById(request.projectId._id || request.projectId);
      if (project) {
        // Prevent duplicates
        const memberIdStr = request.to._id.toString();
        const alreadyMember = project.members.some(m => m.toString() === memberIdStr);
        if (!alreadyMember) {
          project.members.push(request.to._id);
          await project.save();
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('updateRequest error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update request',
    });
  }
};

export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findByIdAndDelete(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: { id },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('deleteRequest error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete request',
    });
  }
};
