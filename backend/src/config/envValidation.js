/**
 * Environment Variable Validation
 * Validates all required environment variables on startup
 */

const requiredEnvVars = {
  // Always required
  NODE_ENV: process.env.NODE_ENV,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,

  // URL configuration
  FRONTEND_URL: process.env.FRONTEND_URL,

  // AI Configuration
  HF_TOKEN: process.env.HF_TOKEN,

  // Production-only requirements
  ...(process.env.NODE_ENV === 'production' && {
    CLIENT_URL: process.env.CLIENT_URL || process.env.FRONTEND_URL,
    SERVER_URL: process.env.SERVER_URL || process.env.FRONTEND_URL,
  }),
};

const validateEnvVars = () => {
  const errors = [];

  // Check required variables
  Object.entries(requiredEnvVars).forEach(([key, value]) => {
    if (!value || value === '' || value.includes('your_') || value.includes('sk_test_')) {
      errors.push(`❌ ${key} is missing, empty, or using default value`);
    }
  });

  // Special checks for production
  if (process.env.NODE_ENV === 'production') {
    // Check for test keys in production
    if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      errors.push('❌ STRIPE_SECRET_KEY appears to be a TEST key in PRODUCTION!');
    }

    // Validate secrets are strong enough
    if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
      errors.push('❌ JWT_SECRET should be at least 32 characters long');
    }

    if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
      errors.push('❌ SESSION_SECRET should be at least 32 characters long');
    }
  }

  if (errors.length > 0) {
    console.error('\n⚠️  Environment Variable Validation Failed:');
    errors.forEach(error => console.error(`   ${error}`));
    console.error('\nPlease check your environment variables and try again.\n');

    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  } else {
    console.log('✅ Environment variables validated successfully');
  }
};

export default validateEnvVars;
