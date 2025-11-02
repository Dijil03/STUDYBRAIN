import jwt from 'jsonwebtoken';
import User from '../models/auth.model.js';

const protectRoutes = async (req, res, next) => {
  try {
    // Debug logging
    console.log('🔒 ProtectRoutes middleware called:', {
      method: req.method,
      path: req.path,
      hasUser: !!req.user,
      hasSession: !!req.session,
      sessionUserId: req.session?.passport?.user,
      cookies: Object.keys(req.cookies || {}),
      userId: req.params.userId
    });

    // First, check if user is authenticated via Passport session (Google OAuth)
    if (req.user) {
      console.log('✅ User authenticated via Passport session:', req.user._id || req.user.id);
      return next();
    }

    // Fallback 1: Check if session has user ID (Passport might not have populated req.user)
    if (req.session && req.session.passport && req.session.passport.user) {
      try {
        const userId = req.session.passport.user;
        req.user = await User.findById(userId).select('-password');
        if (req.user) {
          console.log('✅ User authenticated via session passport.user:', req.user._id);
          return next();
        }
      } catch (sessionError) {
        console.log('Error loading user from session:', sessionError.message);
      }
    }

    // Fallback 2: If userId is provided in params and we're in development, allow it
    // This helps when testing with userId but session isn't working
    if (req.params.userId && process.env.NODE_ENV !== 'production') {
      try {
        const user = await User.findById(req.params.userId).select('-password');
        if (user) {
          console.warn('⚠️ Development mode: allowing request with userId from params');
          req.user = user;
          return next();
        }
      } catch (paramError) {
        console.log('Error loading user from params:', paramError.message);
      }
    }

    // Fallback 3: Check for JWT token in cookies (for regular login)
    const token = req.cookies.token;

    if (!token) {
      console.log('❌ No authentication found - no token, no session user');
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no authentication token or session found',
        debug: {
          hasSession: !!req.session,
          hasPassportUser: !!(req.session?.passport?.user),
          hasReqUser: !!req.user,
          userIdParam: req.params.userId
        }
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.status(401).json({ 
          success: false,
          message: 'Not authorized, user not found' 
        });
      }

      console.log('✅ User authenticated via JWT token:', req.user._id);
      next();
    } catch (jwtError) {
      console.log('❌ JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, invalid token' 
      });
    }
  } catch (error) {
    console.error('❌ Protect routes error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, authentication failed',
      error: error.message
    });
  }
};

export default protectRoutes;