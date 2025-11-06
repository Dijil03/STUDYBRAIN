import Revision from '../models/revision.model.js';
import User from '../models/auth.model.js';
import {
  calculateNextReview,
  getDueItemsQuery,
  getInitialSchedule,
  getReviewStatistics,
  estimateStudyTime
} from '../services/spacedRepetition.service.js';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to get valid Google access token (same as in googleCalendar.controller.js)
const getValidAccessToken = async (user) => {
  if (!user.googleAccessToken) {
    return null; // Not connected, but don't throw error
  }

  if (user.googleTokenExpiry && new Date(user.googleTokenExpiry) < new Date(Date.now() + 5 * 60 * 1000)) {
    if (!user.googleRefreshToken) {
      return null;
    }

    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: user.googleRefreshToken,
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      user.googleAccessToken = data.access_token;
      user.googleTokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      await user.save();

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  return user.googleAccessToken;
};

// Create Google Calendar event for revision
const createCalendarEvent = async (user, revision) => {
  try {
    const accessToken = await getValidAccessToken(user);
    if (!accessToken) {
      return null; // Calendar not connected
    }

    const event = {
      summary: `📚 Review: ${revision.title}`,
      description: `Revision item: ${revision.content.substring(0, 200)}...\n\nSubject: ${revision.subject}\nMastery: ${revision.masteryLevel}%`,
      start: {
        dateTime: revision.nextReview.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(revision.nextReview.getTime() + 30 * 60 * 1000).toISOString(), // 30 min event
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to create calendar event:', error);
      return null;
    }

    const eventData = await response.json();
    return eventData.id;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    return null;
  }
};

// Update Google Calendar event
const updateCalendarEvent = async (user, revision) => {
  if (!revision.calendarEventId) {
    return null;
  }

  try {
    const accessToken = await getValidAccessToken(user);
    if (!accessToken) {
      return null;
    }

    const event = {
      summary: `📚 Review: ${revision.title}`,
      description: `Revision item: ${revision.content.substring(0, 200)}...\n\nSubject: ${revision.subject}\nMastery: ${revision.masteryLevel}%`,
      start: {
        dateTime: revision.nextReview.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(revision.nextReview.getTime() + 30 * 60 * 1000).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${revision.calendarEventId}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error updating calendar event:', error);
    return false;
  }
};

// Delete Google Calendar event
const deleteCalendarEvent = async (user, eventId) => {
  if (!eventId) {
    return true;
  }

  try {
    const accessToken = await getValidAccessToken(user);
    if (!accessToken) {
      return true; // Already deleted or not connected
    }

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return response.ok || response.status === 404; // 404 means already deleted
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    return false;
  }
};

export const revisionController = {
  // Create a new revision item
  createRevision: async (req, res) => {
    try {
      const { userId } = req.params;
      const { title, content, subject, tags, syncToCalendar } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          message: 'Title and content are required'
        });
      }

      // Get initial schedule from spaced repetition algorithm
      const initialSchedule = getInitialSchedule();

      const revision = new Revision({
        userId,
        title,
        content,
        subject: subject || 'General',
        tags: tags || [],
        ...initialSchedule
      });

      await revision.save();

      // Sync to Google Calendar if requested and user has connected calendar
      if (syncToCalendar) {
        const user = await User.findById(userId);
        if (user) {
          const eventId = await createCalendarEvent(user, revision);
          if (eventId) {
            revision.calendarEventId = eventId;
            revision.syncedToCalendar = true;
            await revision.save();
          }
        }
      }

      res.status(201).json({
        success: true,
        message: 'Revision item created successfully',
        revision
      });
    } catch (error) {
      console.error('Error creating revision:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create revision item',
        error: error.message
      });
    }
  },

  // Get all revisions for a user
  getRevisions: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, subject, dueOnly } = req.query;

      let query = { userId };

      if (status) {
        query.status = status;
      }

      if (subject) {
        query.subject = subject;
      }

      if (dueOnly === 'true') {
        query = { ...query, ...getDueItemsQuery() };
      }

      const revisions = await Revision.find(query)
        .sort({ nextReview: 1 })
        .exec();

      res.json({
        success: true,
        revisions,
        count: revisions.length
      });
    } catch (error) {
      console.error('Error fetching revisions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch revisions',
        error: error.message
      });
    }
  },

  // Get revision statistics
  getStatistics: async (req, res) => {
    try {
      const { userId } = req.params;

      const revisions = await Revision.find({ userId }).exec();
      const statistics = getReviewStatistics(revisions);

      const dueItems = revisions.filter(r => {
        const reviewDate = new Date(r.nextReview);
        return reviewDate <= new Date() && r.status === 'active';
      });

      statistics.estimatedStudyTime = estimateStudyTime(dueItems);

      res.json({
        success: true,
        statistics
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch statistics',
        error: error.message
      });
    }
  },

  // Get items due for review
  getDueItems: async (req, res) => {
    try {
      const { userId } = req.params;
      const { date } = req.query;

      const reviewDate = date ? new Date(date) : new Date();
      const query = {
        userId,
        ...getDueItemsQuery(reviewDate)
      };

      const dueItems = await Revision.find(query)
        .sort({ nextReview: 1 })
        .exec();

      const estimatedTime = estimateStudyTime(dueItems);

      res.json({
        success: true,
        dueItems,
        count: dueItems.length,
        estimatedStudyTime: estimatedTime
      });
    } catch (error) {
      console.error('Error fetching due items:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch due items',
        error: error.message
      });
    }
  },

  // Review an item (update based on performance)
  reviewItem: async (req, res) => {
    try {
      const { userId, revisionId } = req.params;
      const { quality } = req.body; // 0-5 rating

      if (quality === undefined || quality < 0 || quality > 5) {
        return res.status(400).json({
          success: false,
          message: 'Quality rating (0-5) is required'
        });
      }

      const revision = await Revision.findOne({ _id: revisionId, userId });
      if (!revision) {
        return res.status(404).json({
          success: false,
          message: 'Revision item not found'
        });
      }

      // Calculate next review using spaced repetition algorithm
      const updatedData = calculateNextReview(revision, quality);

      // Add to review history
      revision.reviewHistory.push({
        date: new Date(),
        quality,
        interval: updatedData.interval,
        difficulty: updatedData.difficulty
      });

      // Update revision
      Object.assign(revision, updatedData);
      await revision.save();

      // Update calendar event if synced
      if (revision.syncedToCalendar) {
        const user = await User.findById(userId);
        if (user) {
          await updateCalendarEvent(user, revision);
        }
      }

      res.json({
        success: true,
        message: 'Review completed successfully',
        revision,
        nextReview: revision.nextReview
      });
    } catch (error) {
      console.error('Error reviewing item:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to review item',
        error: error.message
      });
    }
  },

  // Update a revision item
  updateRevision: async (req, res) => {
    try {
      const { userId, revisionId } = req.params;
      const { title, content, subject, tags, syncToCalendar } = req.body;

      const revision = await Revision.findOne({ _id: revisionId, userId });
      if (!revision) {
        return res.status(404).json({
          success: false,
          message: 'Revision item not found'
        });
      }

      if (title) revision.title = title;
      if (content) revision.content = content;
      if (subject) revision.subject = subject;
      if (tags) revision.tags = tags;

      // Handle calendar sync
      if (syncToCalendar !== undefined) {
        const user = await User.findById(userId);
        if (syncToCalendar && !revision.syncedToCalendar) {
          // Create new calendar event
          if (user) {
            const eventId = await createCalendarEvent(user, revision);
            if (eventId) {
              revision.calendarEventId = eventId;
              revision.syncedToCalendar = true;
            }
          }
        } else if (!syncToCalendar && revision.syncedToCalendar) {
          // Delete calendar event
          if (user && revision.calendarEventId) {
            await deleteCalendarEvent(user, revision.calendarEventId);
            revision.calendarEventId = null;
            revision.syncedToCalendar = false;
          }
        }
      }

      await revision.save();

      // Update calendar event if synced
      if (revision.syncedToCalendar) {
        const user = await User.findById(userId);
        if (user) {
          await updateCalendarEvent(user, revision);
        }
      }

      res.json({
        success: true,
        message: 'Revision item updated successfully',
        revision
      });
    } catch (error) {
      console.error('Error updating revision:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update revision item',
        error: error.message
      });
    }
  },

  // Delete a revision item
  deleteRevision: async (req, res) => {
    try {
      const { userId, revisionId } = req.params;

      const revision = await Revision.findOne({ _id: revisionId, userId });
      if (!revision) {
        return res.status(404).json({
          success: false,
          message: 'Revision item not found'
        });
      }

      // Delete calendar event if exists
      if (revision.calendarEventId) {
        const user = await User.findById(userId);
        if (user) {
          await deleteCalendarEvent(user, revision.calendarEventId);
        }
      }

      await Revision.deleteOne({ _id: revisionId, userId });

      res.json({
        success: true,
        message: 'Revision item deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting revision:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete revision item',
        error: error.message
      });
    }
  },

  // Sync all revisions to calendar
  syncAllToCalendar: async (req, res) => {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId);
      if (!user || !user.googleAccessToken) {
        return res.status(400).json({
          success: false,
          message: 'Google Calendar not connected'
        });
      }

      const revisions = await Revision.find({ userId, status: 'active' });
      let synced = 0;
      let failed = 0;

      for (const revision of revisions) {
        if (!revision.syncedToCalendar) {
          const eventId = await createCalendarEvent(user, revision);
          if (eventId) {
            revision.calendarEventId = eventId;
            revision.syncedToCalendar = true;
            await revision.save();
            synced++;
          } else {
            failed++;
          }
        }
      }

      res.json({
        success: true,
        message: `Synced ${synced} revisions to calendar`,
        synced,
        failed
      });
    } catch (error) {
      console.error('Error syncing to calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync revisions to calendar',
        error: error.message
      });
    }
  }
};

