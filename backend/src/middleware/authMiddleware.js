import jwt from 'jsonwebtoken';

// Middleware to protect routes that require authentication
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        // If no token found
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

            // Add user info to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error in authentication.'
        });
    }
};

// Middleware to check if user is admin
export const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
};

// Middleware to check if user is verified
export const verified = (req, res, next) => {
    if (req.user && req.user.verified) {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Account verification required.'
        });
    }
};

// Optional auth middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check for token in cookies
        if (!token && req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                req.user = decoded;
            } catch (error) {
                // Token is invalid, but we don't fail the request
                req.user = null;
            }
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        console.error('Optional auth middleware error:', error);
        req.user = null;
        next();
    }
};
