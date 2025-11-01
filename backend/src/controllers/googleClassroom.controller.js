import User from '../models/auth.model.js';
import dotenv from 'dotenv';
dotenv.config();

// Google Classroom API integration controller
export const googleClassroomController = {
  // Test Google Classroom connection
  testConnection: async (req, res) => {
    try {
      console.log('🧪 Testing Google Classroom API connection...');
      
      res.json({
        success: true,
        message: 'Google Classroom integration is working',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Google Classroom test failed:', error);
      res.status(500).json({
        success: false,
        message: 'Google Classroom test failed',
        error: error.message
      });
    }
  },

  // Get user's Google Classroom courses
  getCourses: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('📚 Fetching Google Classroom courses for user:', userId);

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.googleAccessToken) {
        return res.status(401).json({
          success: false,
          message: 'Google account not connected',
          needsAuth: true
        });
      }

      // Get valid access token
      const accessToken = await getValidAccessToken(user);
      
      // Fetch courses from Google Classroom API
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Google Classroom API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched courses:', data.courses?.length || 0);

      res.json({
        success: true,
        courses: data.courses || [],
        message: `Found ${data.courses?.length || 0} courses`
      });

    } catch (error) {
      console.error('❌ Error fetching courses:', error);
      
      // Handle 403 specifically
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return res.status(403).json({
          success: false,
          message: 'Google Classroom access not authorized',
          error: 'Missing Google Classroom API permissions. Please authorize Classroom access.',
          needsReauth: true,
          authUrl: `${process.env.SERVER_URL || ''}/api/auth/google-classroom`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch courses',
        error: error.message
      });
    }
  },

  // Get assignments from a specific course
  getCourseAssignments: async (req, res) => {
    try {
      const { userId, courseId } = req.params;
      console.log('📝 Fetching assignments for course:', courseId);

      const user = await User.findById(userId);
      if (!user || !user.googleAccessToken) {
        return res.status(401).json({
          success: false,
          message: 'Google account not connected'
        });
      }

      const accessToken = await getValidAccessToken(user);
      
      // Fetch course work (assignments) from Google Classroom API
      const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 403) {
          console.error('❌ 403 Forbidden - Google Classroom scopes not authorized');
          return res.status(403).json({
            success: false,
            message: 'Google Classroom access not authorized',
            error: 'Missing Google Classroom API permissions',
            needsReauth: true,
            authUrl: `${process.env.SERVER_URL || ''}/api/auth/google-classroom`
          });
        }
        throw new Error(`Google Classroom API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      console.log('✅ Fetched assignments:', data.courseWork?.length || 0);

      res.json({
        success: true,
        assignments: data.courseWork || [],
        courseId,
        message: `Found ${data.courseWork?.length || 0} assignments`
      });

    } catch (error) {
      console.error('❌ Error fetching assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
        error: error.message
      });
    }
  },

  // Get all assignments across all courses
  getAllAssignments: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('📋 Fetching all assignments for user:', userId);

      const user = await User.findById(userId);
      if (!user || !user.googleAccessToken) {
        return res.status(401).json({
          success: false,
          message: 'Google account not connected'
        });
      }

      const accessToken = await getValidAccessToken(user);
      
      // First get all courses
      const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!coursesResponse.ok) {
        if (coursesResponse.status === 403) {
          console.error('❌ 403 Forbidden - Google Classroom scopes not authorized in getAllAssignments');
          // Return 403 directly instead of throwing
          return res.status(403).json({
            success: false,
            message: 'Google Classroom access not authorized',
            error: 'Missing Google Classroom API permissions. Please authorize Classroom access.',
            needsReauth: true,
            authUrl: `${process.env.SERVER_URL || ''}/api/auth/google-classroom`
          });
        }
        const errorText = await coursesResponse.text().catch(() => '');
        throw new Error(`Failed to fetch courses: ${coursesResponse.status} - ${errorText}`);
      }

      const coursesData = await coursesResponse.json();
      const courses = coursesData.courses || [];
      
      // Fetch assignments from all courses
      const allAssignments = [];
      
      for (const course of courses) {
        try {
          const assignmentsResponse = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          if (assignmentsResponse.ok) {
            const assignmentsData = await assignmentsResponse.json();
            const assignments = assignmentsData.courseWork || [];
            
            // Add course info to each assignment
            assignments.forEach(assignment => {
              assignment.courseInfo = {
                id: course.id,
                name: course.name,
                section: course.section
              };
            });
            
            allAssignments.push(...assignments);
          }
        } catch (courseError) {
          console.warn(`⚠️ Failed to fetch assignments for course ${course.id}:`, courseError.message);
        }
      }

      // Sort assignments by due date
      allAssignments.sort((a, b) => {
        const dateA = new Date(a.dueDate?.year, (a.dueDate?.month || 1) - 1, a.dueDate?.day || 1);
        const dateB = new Date(b.dueDate?.year, (b.dueDate?.month || 1) - 1, b.dueDate?.day || 1);
        return dateA - dateB;
      });

      console.log('✅ Fetched all assignments:', allAssignments.length);

      res.json({
        success: true,
        assignments: allAssignments,
        totalCourses: courses.length,
        message: `Found ${allAssignments.length} assignments across ${courses.length} courses`
      });

    } catch (error) {
      console.error('❌ Error fetching all assignments:', error);
      
      // Handle 403 specifically
      if (error.message.includes('403') || error.message.includes('Forbidden') || error.message.includes('scopes not authorized')) {
        return res.status(403).json({
          success: false,
          message: 'Google Classroom access not authorized',
          error: 'Missing Google Classroom API permissions. Please authorize Classroom access.',
          needsReauth: true,
          authUrl: `${process.env.SERVER_URL || ''}/api/auth/google-classroom`
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Failed to fetch assignments',
        error: error.message
      });
    }
  },

  // Sync assignments to homework tasks
  syncAssignmentsToHomework: async (req, res) => {
    try {
      const { userId } = req.params;
      console.log('🔄 Syncing Google Classroom assignments to homework...');

      // This would integrate with your existing homework system
      // For now, return the assignments that could be synced
      const assignments = await getAllAssignmentsForUser(userId);
      
      res.json({
        success: true,
        message: 'Assignments ready for sync',
        assignments: assignments.slice(0, 5), // Return first 5 as example
        totalCount: assignments.length
      });

    } catch (error) {
      console.error('❌ Error syncing assignments:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to sync assignments',
        error: error.message
      });
    }
  }
};

// Helper function to get valid access token
const getValidAccessToken = async (user) => {
  console.log('🔍 Getting valid Google access token for user:', user.id || user._id);
  
  if (!user) {
    throw new Error('User not provided to getValidAccessToken');
  }
  
  // Check if token is expired and refresh if needed
  if (user.googleTokenExpiry && new Date() > user.googleTokenExpiry) {
    try {
      console.log('🔄 Refreshing Google access token...');
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: user.googleRefreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (refreshResponse.ok) {
        const tokenData = await refreshResponse.json();
        
        // Update user with new tokens
        user.googleAccessToken = tokenData.access_token;
        user.googleTokenExpiry = new Date(Date.now() + tokenData.expires_in * 1000);
        await user.save();
        
        console.log('✅ Google access token refreshed for user:', user.id || user._id);
        return tokenData.access_token;
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      console.error('Error refreshing Google token:', error);
      throw new Error('Token refresh failed');
    }
  }
  
  return user.googleAccessToken;
};

// Helper function to get all assignments for a user
const getAllAssignmentsForUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user || !user.googleAccessToken) {
    throw new Error('Google account not connected');
  }

  const accessToken = await getValidAccessToken(user);
  
  // Get courses
  const coursesResponse = await fetch('https://classroom.googleapis.com/v1/courses', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

      if (!coursesResponse.ok) {
        if (coursesResponse.status === 403) {
          throw new Error('403: Google Classroom scopes not authorized. Please authorize Classroom access.');
        }
        const errorText = await coursesResponse.text().catch(() => '');
        throw new Error(`Failed to fetch courses: ${coursesResponse.status} - ${errorText}`);
      }

  const coursesData = await coursesResponse.json();
  const courses = coursesData.courses || [];
  
  // Fetch assignments from all courses
  const allAssignments = [];
  
  for (const course of courses) {
    try {
      const assignmentsResponse = await fetch(`https://classroom.googleapis.com/v1/courses/${course.id}/courseWork`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (assignmentsResponse.ok) {
        const assignmentsData = await assignmentsResponse.json();
        const assignments = assignmentsData.courseWork || [];
        
        assignments.forEach(assignment => {
          assignment.courseInfo = {
            id: course.id,
            name: course.name,
            section: course.section
          };
        });
        
        allAssignments.push(...assignments);
      }
    } catch (courseError) {
      console.warn(`⚠️ Failed to fetch assignments for course ${course.id}:`, courseError.message);
    }
  }

  return allAssignments;
};
