import mongoose from 'mongoose';
import {
  abortFocusSession,
  completeFocusSession,
  getGardenOverview,
  purchaseSpecies,
  startFocusSession,
} from '../services/garden.service.js';

const parseUserId = (userId) => {
  if (mongoose.Types.ObjectId.isValid(userId)) return userId;
  throw new Error('Invalid user identifier provided.');
};

export const gardenController = {
  overview: async (req, res) => {
    try {
      const userId = parseUserId(req.params.userId);
      const overview = await getGardenOverview(userId);
      res.json({ success: true, overview });
    } catch (error) {
      console.error('Failed to fetch garden overview:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  startSession: async (req, res) => {
    try {
      const userId = parseUserId(req.params.userId);
      const { species, subject, targetMinutes } = req.body;
      if (!species) {
        return res.status(400).json({ success: false, message: 'Species is required to start a session.' });
      }

      const session = await startFocusSession({
        userId,
        speciesSlug: species,
        subject,
        targetMinutes,
      });

      res.status(201).json({ success: true, session });
    } catch (error) {
      console.error('Failed to start focus session:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  completeSession: async (req, res) => {
    try {
      const userId = parseUserId(req.params.userId);
      const { sessionId, minutes, quality } = req.body;
      if (!sessionId) {
        return res.status(400).json({ success: false, message: 'sessionId is required.' });
      }

      const { plant, garden, dewEarned } = await completeFocusSession({
        userId,
        sessionId,
        actualMinutes: minutes,
        quality,
      });

      res.json({
        success: true,
        message: 'Session recorded successfully.',
        plant,
        garden,
        dewEarned,
      });
    } catch (error) {
      console.error('Failed to complete focus session:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  abortSession: async (req, res) => {
    try {
      const userId = parseUserId(req.params.userId);
      const garden = await abortFocusSession({ userId });
      res.json({ success: true, garden });
    } catch (error) {
      console.error('Failed to abort focus session:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  purchase: async (req, res) => {
    try {
      const userId = parseUserId(req.params.userId);
      const { species } = req.body;
      if (!species) {
        return res.status(400).json({ success: false, message: 'Species slug is required.' });
      }

      const garden = await purchaseSpecies({ userId, speciesSlug: species });
      res.json({ success: true, garden });
    } catch (error) {
      console.error('Failed to purchase species:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  },
};


