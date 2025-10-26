import { verifyToken } from '@clerk/backend';

const clerkAuth = async (req, res, next) => {
  try {
    console.log('ClerkAuth middleware called for:', req.method, req.url);
    
    // Check if Clerk secret key is configured
    if (!process.env.CLERK_SECRET_KEY) {
      console.warn('CLERK_SECRET_KEY not configured, skipping authentication');
      // For development, allow requests without authentication
      req.user = {
        id: req.params.userId || 'dev-user',
        email: 'dev@example.com',
        firstName: 'Dev',
        lastName: 'User'
      };
      console.log('Development mode: allowing request');
      return next();
    }

    // Get the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    // Extract the token
    const token = authHeader.substring(7);
    
    // Verify the token with Clerk
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY
    });

    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Add user info to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.given_name,
      lastName: payload.family_name
    };

    next();
  } catch (error) {
    console.error('Clerk auth error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

export default clerkAuth;
