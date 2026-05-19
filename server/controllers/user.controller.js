import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('getAllUsers error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
};

export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('getUser error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Authorization: users can only update their own profile
    if (id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this user',
      });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Request body is required',
      });
    }

    // Only allow safe fields — password & email excluded intentionally
    const allowedFields = ['name', 'avatar', 'skills'];
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

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }
    console.error('updateUser error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update user',
    });
  }
};
