import jwt from 'jsonwebtoken';
import User from '../models/auth.model.js';

const protectRoutes = async (req, res, next) => {
  try {
    // First, check if user is authenticated via Passport session (Google OAuth)
    if (req.user) {
      // User authenticated via Passport session
      console.log('✅ User authenticated via Passport session:', req.user._id || req.user.id);
      return next();
    }

    // Fallback: Check for JWT token in cookies (for regular login)
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, no authentication token or session found' 
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
      console.log('JWT verification failed:', jwtError.message);
      return res.status(401).json({ 
        success: false,
        message: 'Not authorized, invalid token' 
      });
    }
  } catch (error) {
    console.error('Protect routes error:', error);
    res.status(401).json({ 
      success: false,
      message: 'Not authorized, authentication failed' 
    });
  }
};

export default protectRoutes;