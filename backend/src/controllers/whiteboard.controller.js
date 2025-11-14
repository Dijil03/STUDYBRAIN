import crypto from 'crypto';
import Whiteboard from '../models/whiteboard.model.js';
import User from '../models/auth.model.js';

const ensureAccess = (whiteboard, userId) => {
  if (!whiteboard || !userId) return false;
  const ownerMatch = whiteboard.owner?.toString() === userId.toString();
  const memberMatch = whiteboard.members?.some((memberId) => memberId.toString() === userId.toString());
  const collaboratorMatch = whiteboard.collaborators?.some((collab) => collab.userId?.toString() === userId.toString());
  return ownerMatch || memberMatch || collaboratorMatch;
};

const generateShareCode = () => crypto.randomBytes(6).toString('hex');

export const createWhiteboard = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, description, background } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Whiteboard title is required' });
    }

    const owner = await User.findById(userId);
    if (!owner) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const whiteboard = await Whiteboard.create({
      title: title.trim(),
      description: description?.trim(),
      owner: userId,
      shareCode: generateShareCode(),
      canvasData: {
        paths: [],
        background: background || '#0f172a',
      },
    });

    res.status(201).json({
      success: true,
      whiteboard,
    });
  } catch (error) {
    console.error('Error creating whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create whiteboard',
      error: error.message,
    });
  }
};

export const getWhiteboards = async (req, res) => {
  try {
    const { userId } = req.params;
    const search = req.query.search?.trim();

    const query = {
      isArchived: { $ne: true },
      $or: [
        { owner: userId },
        { members: userId },
        { 'collaborators.userId': userId },
      ],
    };

    if (search) {
      query.$and = [{
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ],
      }];
    }

    const whiteboards = await Whiteboard.find(query)
      .sort({ updatedAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      whiteboards,
    });
  } catch (error) {
    console.error('Error fetching whiteboards:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch whiteboards',
      error: error.message,
    });
  }
};

export const getWhiteboardById = async (req, res) => {
  try {
    const { whiteboardId, userId } = req.params;
    const whiteboard = await Whiteboard.findById(whiteboardId);

    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    if (!ensureAccess(whiteboard, userId)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this whiteboard' });
    }

    if (!whiteboard.shareCode) {
      whiteboard.shareCode = generateShareCode();
      await whiteboard.save();
    }

    res.status(200).json({
      success: true,
      whiteboard,
    });
  } catch (error) {
    console.error('Error fetching whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load whiteboard',
      error: error.message,
    });
  }
};

export const saveWhiteboardCanvas = async (req, res) => {
  try {
    const { whiteboardId, userId } = req.params;
    const { paths, background, settings } = req.body;

    const whiteboard = await Whiteboard.findById(whiteboardId);

    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    if (!ensureAccess(whiteboard, userId)) {
      return res.status(403).json({ success: false, message: 'You do not have access to this whiteboard' });
    }

    if (Array.isArray(paths)) {
      whiteboard.canvasData = whiteboard.canvasData || {};
      whiteboard.canvasData.paths = paths;
    }

    if (background) {
      whiteboard.canvasData = whiteboard.canvasData || {};
      whiteboard.canvasData.background = background;
    }

    if (settings) {
      const existingSettings =
        typeof whiteboard.settings?.toObject === 'function'
          ? whiteboard.settings.toObject()
          : whiteboard.settings || {};
      whiteboard.settings = {
        ...existingSettings,
        ...settings,
      };
      whiteboard.markModified('settings');
    }

    whiteboard.lastSavedBy = userId;
    whiteboard.lastSavedAt = new Date();

    whiteboard.markModified('canvasData');

    await whiteboard.save();

    res.status(200).json({
      success: true,
      whiteboard,
    });
  } catch (error) {
    console.error('Error saving whiteboard canvas:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save whiteboard',
      error: error.message,
    });
  }
};

export const updateWhiteboardMeta = async (req, res) => {
  try {
    const { whiteboardId, userId } = req.params;
    const { title, description, members, allowGuests, regenerateShareCode } = req.body;

    const whiteboard = await Whiteboard.findById(whiteboardId);

    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    if (whiteboard.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can update this whiteboard' });
    }

    if (title?.trim()) {
      whiteboard.title = title.trim();
    }

    if (description !== undefined) {
      whiteboard.description = description?.trim() || '';
    }

    if (Array.isArray(members)) {
      whiteboard.members = members;
    }

    if (typeof allowGuests === 'boolean') {
      whiteboard.allowGuests = allowGuests;
    }

    if (regenerateShareCode) {
      whiteboard.shareCode = generateShareCode();
    }

    await whiteboard.save();

    res.status(200).json({
      success: true,
      whiteboard,
    });
  } catch (error) {
    console.error('Error updating whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update whiteboard',
      error: error.message,
    });
  }
};

export const deleteWhiteboard = async (req, res) => {
  try {
    const { whiteboardId, userId } = req.params;

    const whiteboard = await Whiteboard.findById(whiteboardId);

    if (!whiteboard) {
      return res.status(404).json({ success: false, message: 'Whiteboard not found' });
    }

    if (whiteboard.owner.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Only the owner can delete this whiteboard' });
    }

    await whiteboard.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Whiteboard deleted',
    });
  } catch (error) {
    console.error('Error deleting whiteboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete whiteboard',
      error: error.message,
    });
  }
};

