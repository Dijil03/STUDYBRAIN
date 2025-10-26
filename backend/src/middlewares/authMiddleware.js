import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  try {
    console.log('Auth middleware called for:', req.method, req.url);
    
    // Check if user is authenticated via session (Google OAuth)
    if (req.user) {
      console.log('User authenticated via session:', req.user);
      return next();
    }

    // Check for JWT token in cookies (fallback for regular login)
    const token = req.cookies.token;
    
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = {
          id: decoded.userId,
          email: decoded.email || 'user@example.com',
          firstName: decoded.firstName || 'User',
          lastName: decoded.lastName || 'Name'
        };
        console.log('User authenticated via JWT:', req.user);
        return next();
      } catch (jwtError) {
        console.log('JWT verification failed:', jwtError.message);
      }
    }

    // For development, allow requests without authentication if userId is provided
    if (req.params.userId) {
      console.warn('Development mode: allowing request with userId');
      req.user = {
        id: req.params.userId,
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User'
      };
      return next();
    }

    return res.status(401).json({ message: 'Not authorized, no authentication' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export default authMiddleware;
