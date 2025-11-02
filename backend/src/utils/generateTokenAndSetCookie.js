import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  // For cross-origin requests (Vercel frontend + Render backend),
  // we need sameSite: 'none' and secure: true
  const isProduction = process.env.NODE_ENV === 'production';
  
  res.cookie('token', token, {
    httpOnly: true,
    secure: isProduction, // Must be true for sameSite: 'none' in production
    sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    domain: isProduction ? undefined : undefined, // Let browser set domain automatically
  });
  
  console.log('✅ JWT token cookie set:', {
    userId,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: '7 days'
  });
};

export default generateTokenAndSetCookie;
