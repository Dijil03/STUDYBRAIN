import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/auth.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Build callback URL - use absolute URL in production, relative in development
const buildCallbackURL = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SERVER_URL) {
    // In production, use full URL
    return `${process.env.SERVER_URL}/api/auth/google/callback`;
  }
  // In development, use relative URL (Passport will construct full URL from request)
  return "/api/auth/google/callback";
};

// Configure Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: buildCallbackURL()
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      // Update existing user with new tokens
      user.googleAccessToken = accessToken;
      user.googleRefreshToken = refreshToken;
      user.googleTokenExpiry = new Date(Date.now() + 3600 * 1000); // 1 hour from now
      await user.save();
      console.log('✅ Updated Google tokens for existing user:', user.email);
      return done(null, user);
    }

    // Create new user
    user = await User.create({
      googleId: profile.id,
      username: profile.displayName || `${profile.name.givenName} ${profile.name.familyName}`,
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      profilePicture: profile.photos[0].value,
      isGoogleUser: true,
      // Store Google tokens for Google Docs integration
      googleAccessToken: accessToken,
      googleRefreshToken: refreshToken,
      googleTokenExpiry: new Date(Date.now() + 3600 * 1000) // 1 hour from now
    });
    console.log('✅ Created new user with Google tokens:', user.email);

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
