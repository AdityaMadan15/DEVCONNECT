import Message from '../models/Message.js';

export const getMessagesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;

    const messages = await Message.find({ 
      projectId,
      deletedFor: { $ne: req.user._id }
    })
      .populate('sender', 'name email avatar')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ success: false, error: 'Invalid project ID format' });
    }
    console.error('getMessagesByProject error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch messages',
    });
  }
};
