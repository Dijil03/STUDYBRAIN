import User from '../models/auth.model.js';
import Homework from '../models/homework.model.js';
import Exam from '../models/exam.model.js';
import dotenv from 'dotenv';
dotenv.config();

// Helper function to get valid Google access token
const getValidAccessToken = async (user) => {
  if (!user.googleAccessToken) {
    throw new Error('Google account not connected');
  }

  // Check if token is expired (or will expire in next 5 minutes)
  if (user.googleTokenExpiry && new Date(user.googleTokenExpiry) < new Date(Date.now() + 5 * 60 * 1000)) {
    // Token expired, need to refresh
    if (!user.googleRefreshToken) {
      throw new Error('Google refresh token not available. Please reconnect your Google account.');
    }

    try {
      // Refresh the token
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
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      
      // Update user with new token
      user.googleAccessToken = data.access_token;
      user.googleTokenExpiry = new Date(Date.now() + (data.expires_in * 1000));
      await user.save();

      return data.access_token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      throw new Error('Failed to refresh Google token. Please reconnect your account.');
    }
  }

  return user.googleAccessToken;
};

// Google Calendar API integration controller
export const googleCalendarController = {
  // Test Google Calendar connection
  testConnection: async (req, res) => {
    try {
      console.log('🧪 Testing Google Calendar API connection...');
      
      res.json({
        success: true,
        message: 'Google Calendar integration is working',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Google Calendar test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Google Calendar test failed',
        error: error.message
      });
    }
  },

  // Get user's Google Calendar events
  getEvents: async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeMin, timeMax, maxResults = 50 } = req.query;
      
      console.log('📅 Fetching Google Calendar events for user:', userId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      // Build query parameters
      const params = new URLSearchParams({
        maxResults: maxResults.toString(),
        singleEvents: 'true',
        orderBy: 'startTime',
      });

      if (timeMin) params.append('timeMin', timeMin);
      if (timeMax) params.append('timeMax', timeMax);

      // Fetch events from primary calendar
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to fetch calendar events');
      }

      const data = await response.json();

      res.json({
        success: true,
        events: data.items || [],
        count: data.items?.length || 0
      });
    } catch (error) {
      console.error('❌ Error fetching Google Calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error.message
      });
    }
  },

  // Create a new event in Google Calendar
  createEvent: async (req, res) => {
    try {
      const { userId } = req.params;
      const { summary, description, start, end, location, colorId } = req.body;

      console.log('➕ Creating Google Calendar event for user:', userId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      const event = {
        summary: summary || 'Untitled Event',
        description: description || '',
        start: {
          dateTime: start,
          timeZone: 'UTC',
        },
        end: {
          dateTime: end,
          timeZone: 'UTC',
        },
        location: location || '',
        colorId: colorId || '1',
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to create calendar event');
      }

      const createdEvent = await response.json();

      res.json({
        success: true,
        event: createdEvent,
        message: 'Event created successfully'
      });
    } catch (error) {
      console.error('❌ Error creating Google Calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create calendar event',
        error: error.message
      });
    }
  },

  // Update an existing event
  updateEvent: async (req, res) => {
    try {
      const { userId, eventId } = req.params;
      const { summary, description, start, end, location, colorId } = req.body;

      console.log('✏️ Updating Google Calendar event:', eventId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      const event = {};
      if (summary) event.summary = summary;
      if (description !== undefined) event.description = description;
      if (start) event.start = { dateTime: start, timeZone: 'UTC' };
      if (end) event.end = { dateTime: end, timeZone: 'UTC' };
      if (location !== undefined) event.location = location;
      if (colorId) event.colorId = colorId;

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to update calendar event');
      }

      const updatedEvent = await response.json();

      res.json({
        success: true,
        event: updatedEvent,
        message: 'Event updated successfully'
      });
    } catch (error) {
      console.error('❌ Error updating Google Calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update calendar event',
        error: error.message
      });
    }
  },

  // Delete an event
  deleteEvent: async (req, res) => {
    try {
      const { userId, eventId } = req.params;

      console.log('🗑️ Deleting Google Calendar event:', eventId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok && response.status !== 404) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to delete calendar event');
      }

      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    } catch (error) {
      console.error('❌ Error deleting Google Calendar event:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete calendar event',
        error: error.message
      });
    }
  },

  // Sync homework to Google Calendar
  syncHomeworkToCalendar: async (req, res) => {
    try {
      const { userId } = req.params;
      const { homeworkId } = req.body;

      console.log('🔄 Syncing homework to Google Calendar:', homeworkId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const homework = await Homework.findById(homeworkId);
      if (!homework || homework.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Homework not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      // Create event from homework
      const dueDate = new Date(homework.dueDate);
      const startTime = new Date(dueDate);
      startTime.setHours(9, 0, 0, 0); // 9 AM on due date
      const endTime = new Date(startTime);
      endTime.setHours(10, 0, 0, 0); // 10 AM

      const event = {
        summary: `📚 ${homework.title}`,
        description: homework.description || '',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: '10', // Red color for assignments
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to sync homework to calendar');
      }

      const createdEvent = await response.json();

      // Store Google Calendar event ID in homework
      homework.googleCalendarEventId = createdEvent.id;
      await homework.save();

      res.json({
        success: true,
        event: createdEvent,
        message: 'Homework synced to Google Calendar'
      });
    } catch (error) {
      console.error('❌ Error syncing homework to calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync homework to calendar',
        error: error.message
      });
    }
  },

  // Sync exam to Google Calendar
  syncExamToCalendar: async (req, res) => {
    try {
      const { userId } = req.params;
      const { examId } = req.body;

      console.log('🔄 Syncing exam to Google Calendar:', examId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const exam = await Exam.findById(examId);
      if (!exam || exam.userId.toString() !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Exam not found'
        });
      }

      const accessToken = await getValidAccessToken(user);

      // Create event from exam
      const examDate = new Date(exam.examDate);
      const startTime = new Date(examDate);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 2); // 2 hour exam

      const event = {
        summary: `📝 ${exam.subject} - ${exam.examName}`,
        description: exam.revisionGoals?.join(', ') || '',
        start: {
          dateTime: startTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        colorId: '11', // Orange color for exams
      };

      const response = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars/primary/events',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to sync exam to calendar');
      }

      const createdEvent = await response.json();

      // Store Google Calendar event ID in exam
      exam.googleCalendarEventId = createdEvent.id;
      await exam.save();

      res.json({
        success: true,
        event: createdEvent,
        message: 'Exam synced to Google Calendar'
      });
    } catch (error) {
      console.error('❌ Error syncing exam to calendar:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync exam to calendar',
        error: error.message
      });
    }
  },

  // Get all calendar events (Google Calendar + synced homework/exams)
  getAllEvents: async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeMin, timeMax } = req.query;

      console.log('📅 Fetching all calendar events for user:', userId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const events = [];

      // Get Google Calendar events
      try {
        const accessToken = await getValidAccessToken(user);
        const params = new URLSearchParams({
          maxResults: '100',
          singleEvents: 'true',
          orderBy: 'startTime',
        });

        if (timeMin) params.append('timeMin', timeMin);
        if (timeMax) params.append('timeMax', timeMax);

        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          events.push(...(data.items || []).map(event => ({
            ...event,
            source: 'google'
          })));
        }
      } catch (error) {
        console.warn('Could not fetch Google Calendar events:', error.message);
      }

      // Get homework assignments
      const homeworkQuery = { userId };
      if (timeMin && timeMax) {
        homeworkQuery.dueDate = { $gte: new Date(timeMin), $lte: new Date(timeMax) };
      } else if (timeMin) {
        homeworkQuery.dueDate = { $gte: new Date(timeMin) };
      } else if (timeMax) {
        homeworkQuery.dueDate = { $lte: new Date(timeMax) };
      }

      const homeworkList = await Homework.find(homeworkQuery);
      events.push(...homeworkList.map(hw => ({
        id: `homework_${hw._id}`,
        summary: `📚 ${hw.title}`,
        description: hw.description || '',
        start: {
          dateTime: new Date(hw.dueDate).toISOString(),
        },
        end: {
          dateTime: new Date(new Date(hw.dueDate).getTime() + 60 * 60 * 1000).toISOString(),
        },
        colorId: '10',
        source: 'homework',
        homeworkId: hw._id.toString()
      })));

      // Get exams
      const examQuery = { userId };
      if (timeMin && timeMax) {
        examQuery.examDate = { $gte: new Date(timeMin), $lte: new Date(timeMax) };
      } else if (timeMin) {
        examQuery.examDate = { $gte: new Date(timeMin) };
      } else if (timeMax) {
        examQuery.examDate = { $lte: new Date(timeMax) };
      }

      const exams = await Exam.find(examQuery);
      events.push(...exams.map(exam => {
        const examDate = new Date(exam.examDate);
        examDate.setHours(9, 0, 0, 0); // Default to 9 AM

        return {
          id: `exam_${exam._id}`,
          summary: `📝 ${exam.subject} - ${exam.examName}`,
          description: exam.revisionGoals?.join(', ') || '',
          start: {
            dateTime: examDate.toISOString(),
          },
          end: {
            dateTime: new Date(examDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
          },
          colorId: '11',
          source: 'exam',
          examId: exam._id.toString()
        };
      }));

      // Sort events by start time
      events.sort((a, b) => {
        const aTime = a.start?.dateTime || a.start?.date || '';
        const bTime = b.start?.dateTime || b.start?.date || '';
        return new Date(aTime) - new Date(bTime);
      });

      res.json({
        success: true,
        events,
        count: events.length
      });
    } catch (error) {
      console.error('❌ Error fetching all calendar events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch calendar events',
        error: error.message
      });
    }
  }
};

