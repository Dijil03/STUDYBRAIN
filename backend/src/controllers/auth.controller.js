import bcrypt from 'bcrypt';
import User from '../models/auth.model.js';
import generateTokenAndSetCookie from '../utils/generateTokenAndSetCookie.js';
import passport from 'passport';
// Email service removed
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export const signup = async (req, res) => {
  // Logic for user signup
  const { username, password, email, confirmPassword } = req.body;

  try {
    if (!username || !password || !email || !confirmPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    const UserAlreadyExists = await User.findOne({ email });

    if (UserAlreadyExists) {
      return res.status(400).json({ message: 'User already exists' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    generateTokenAndSetCookie(newUser._id, res);

    const user = newUser.toObject();
    delete user.password;

    // Email service removed - no welcome email sent

    res.status(201).json({
      message: 'User created successfully',
      username: user.username,
      email: user.email
    })
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.error(error);
  }
};

export const login = async (req, res) => {
  // Logic for user login
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      message: 'User logged in successfully',
      username: user.username,
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
    console.log(error);
  }
};

export const logout = (req, res) => {
  // Logic for user logout
  res.clearCookie('token');
  res.status(200).json({ message: 'User logged out successfully' });
};

// Google OAuth functions
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Separate Google Docs authorization
export const googleDocsAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/documents',
      'https://www.googleapis.com/auth/drive.file'
    ]
  })(req, res, next);
};

// Google Classroom authorization
export const googleClassroomAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: [
      'profile',
      'email',
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly'
    ]
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  // Get client URL with fallback - MUST return a valid URL string, never undefined
  const getClientUrl = () => {
    // Helper to normalize URL - ensure it has protocol
    const normalizeUrl = (url) => {
      if (!url) return null;
      const trimmed = url.trim();
      if (trimmed === '') return null;
      
      // If URL doesn't start with http:// or https://, add https://
      if (!trimmed.match(/^https?:\/\//i)) {
        return `https://${trimmed.replace(/^\/+/, '')}`; // Remove leading slashes if any
      }
      
      return trimmed.replace(/\/$/, ''); // Remove trailing slash
    };

    // Try CLIENT_URL first
    if (process.env.CLIENT_URL) {
      const normalized = normalizeUrl(process.env.CLIENT_URL);
      if (normalized) return normalized;
    }
    // Try FRONTEND_URL as fallback
    if (process.env.FRONTEND_URL) {
      const normalized = normalizeUrl(process.env.FRONTEND_URL);
      if (normalized) return normalized;
    }
    // Production error - don't use undefined
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CRITICAL: CLIENT_URL and FRONTEND_URL not set in production!');
      console.error('Please add CLIENT_URL to Render environment variables');
      // Return a safe default that won't cause redirect issues
      return null; // Explicitly null, not undefined
    }
    // Development fallback
    return 'http://localhost:5173';
  };

  const clientUrl = getClientUrl();

  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Google OAuth error:', err);
      if (clientUrl) {
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Authentication failed')}`);
      } else {
        // Production error - return JSON instead of broken redirect
        return res.status(500).json({
          success: false,
          message: 'Configuration error: CLIENT_URL not set. Please add CLIENT_URL to Render environment variables.',
          error: 'Authentication failed'
        });
      }
    }
    
    if (!user) {
      console.error('No user returned from Google OAuth');
      if (clientUrl) {
        return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Authentication failed')}`);
      } else {
        return res.status(500).json({
          success: false,
          message: 'Configuration error: CLIENT_URL not set. Please add CLIENT_URL to Render environment variables.',
          error: 'Authentication failed'
        });
      }
    }

    console.log('Google OAuth successful, user:', user.email);
    console.log('CLIENT_URL:', clientUrl || 'NOT SET - This will cause redirect issues!');

    req.login(user, (err) => {
      if (err) {
        console.error('Session login error:', err);
        if (clientUrl) {
          return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Login failed')}`);
        } else {
          return res.status(500).json({
            success: false,
            message: 'Configuration error: CLIENT_URL not set.',
            error: 'Login failed'
          });
        }
      }

      // Generate JWT token
      generateTokenAndSetCookie(user._id, res);

      // Redirect to dashboard with user data
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
      };

      const successParams = `success=${encodeURIComponent('Login successful')}&user=${encodeURIComponent(JSON.stringify(userData))}`;
      
      // CRITICAL: Never redirect with undefined/null
      if (!clientUrl || clientUrl === 'undefined' || clientUrl === 'null') {
        console.error('❌ CLIENT_URL is not set! Cannot redirect.');
        console.error('Please add CLIENT_URL to Render environment variables with your Vercel frontend URL');
        return res.status(500).json({
          success: false,
          message: 'Configuration error: CLIENT_URL environment variable not set in Render.',
          fix: 'Add CLIENT_URL=https://your-app.vercel.app to Render environment variables and redeploy',
          user: userData
        });
      }

      // Ensure we have a valid URL
      const redirectUrl = `${clientUrl}/dashboard?${successParams}`;
      console.log('✅ Redirecting to dashboard:', redirectUrl);
      return res.redirect(redirectUrl);
    });
  })(req, res, next);
};

export const googleAuthSuccess = async (req, res) => {
  try {
    if (req.user) {
      // Fetch fresh user data from database to get subscription
      const freshUser = await User.findById(req.user._id);
      console.log('Fresh user data from database:', {
        id: freshUser._id,
        username: freshUser.username,
        email: freshUser.email,
        subscription: freshUser.subscription
      });

      res.status(200).json({
        message: 'Google authentication successful',
        user: {
          id: freshUser._id,
          username: freshUser.username,
          email: freshUser.email,
          profilePicture: freshUser.profilePicture,
          isGoogleUser: freshUser.isGoogleUser,
          subscription: freshUser.subscription,
          createdAt: freshUser.createdAt
        }
      });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  } catch (error) {
    console.error('Error in googleAuthSuccess:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const googleAuthFailure = (req, res) => {
  res.status(401).json({ message: 'Google authentication failed' });
};

// Debug endpoint to check user subscription
export const debugUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Debug: Looking for user with ID:', userId);

    const user = await User.findById(userId);
    if (!user) {
      console.log('Debug: User not found');
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Debug: User found:', {
      id: user._id,
      username: user.username,
      email: user.email,
      subscription: user.subscription,
      hasSubscription: !!user.subscription
    });

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        subscription: user.subscription,
        hasSubscription: !!user.subscription
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Debug failed', error: error.message });
  }
};

// Update user avatar
export const updateAvatar = async (req, res) => {
  try {
    const { userId } = req.params;
    const { avatar } = req.body;

    if (!avatar) {
      return res.status(400).json({ message: 'Avatar URL is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.avatar = avatar;
    await user.save();

    res.status(200).json({
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      profilePicture: user.profilePicture,
      isGoogleUser: user.isGoogleUser,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/avatars';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload avatar image
export const uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const user = await User.findById(userId);
    if (!user) {
      // Clean up uploaded file if user not found
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if it exists
    if (user.profilePicture && user.profilePicture.includes('uploads/avatars/')) {
      const oldAvatarPath = user.profilePicture;
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user's profile picture
    const avatarUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/${req.file.path}`;
    user.profilePicture = avatarUrl;
    await user.save();

    res.status(200).json({
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({ message: 'Failed to upload avatar' });
  }
};

// Update avatar (for predefined avatars)
export const updateAvatarId = async (req, res) => {
  try {
    const { userId, avatarId } = req.body;

    if (!avatarId) {
      return res.status(400).json({ message: 'Avatar ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the avatar ID in a custom field or use profilePicture
    user.avatarId = avatarId;
    await user.save();

    res.status(200).json({
      message: 'Avatar updated successfully',
      avatarId: avatarId
    });
  } catch (error) {
    console.error('Error updating avatar:', error);
    res.status(500).json({ message: 'Failed to update avatar' });
  }
};

// Export multer upload middleware
export { upload };