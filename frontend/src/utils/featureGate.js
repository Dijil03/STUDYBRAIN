import { useState, useEffect } from 'react';

// Export useAIQueryLimits hook for AI query limits

// Feature definitions with required subscription tiers
const FEATURE_DEFINITIONS = {
  // Document features
  unlimitedDocuments: {
    name: 'Unlimited Documents',
    plan: 'premium',
    description: 'Create unlimited documents'
  },
  documentCollaboration: {
    name: 'Document Collaboration',
    plan: 'enterprise',
    description: 'Real-time document collaboration'
  },
  documentExport: {
    name: 'Document Export',
    plan: 'premium',
    description: 'Export documents to PDF/Word'
  },

  // Study features
  advancedStudyTimer: {
    name: 'Advanced Study Timer',
    plan: 'premium',
    description: 'Custom study sessions with analytics'
  },
  spacedRepetition: {
    name: 'Spaced Repetition',
    plan: 'premium',
    description: 'AI-powered spaced repetition algorithm'
  },
  studyAnalytics: {
    name: 'Study Analytics',
    plan: 'premium',
    description: 'Advanced study pattern analysis'
  },
  studyGroups: {
    name: 'Study Groups',
    plan: 'premium',
    description: 'Create and join study groups'
  },
  unlimitedStudyGroups: {
    name: 'Unlimited Study Groups',
    plan: 'enterprise',
    description: 'Create unlimited study groups'
  },

  // Storage features
  increasedStorage: {
    name: 'Increased Storage',
    plan: 'premium',
    description: '10GB storage space'
  },
  unlimitedStorage: {
    name: 'Unlimited Storage',
    plan: 'enterprise',
    description: 'Unlimited storage space'
  },

  // Collaboration features
  realTimeCollaboration: {
    name: 'Real-time Collaboration',
    plan: 'premium',
    description: 'Real-time collaboration features'
  },
  advancedCollaboration: {
    name: 'Advanced Collaboration',
    plan: 'enterprise',
    description: 'Advanced collaboration tools'
  },

  // Analytics features
  basicAnalytics: {
    name: 'Basic Analytics',
    plan: 'premium',
    description: 'Basic progress analytics'
  },
  advancedAnalytics: {
    name: 'Advanced Analytics',
    plan: 'enterprise',
    description: 'Advanced analytics and insights'
  },

  // Document features (additional)
  basicDocuments: {
    name: 'Basic Documents',
    plan: 'free',
    description: 'Create basic documents'
  },

  // Support features
  prioritySupport: {
    name: 'Priority Support',
    plan: 'premium',
    description: 'Priority customer support'
  },
  dedicatedSupport: {
    name: 'Dedicated Support',
    plan: 'enterprise',
    description: 'Dedicated customer support'
  },

  // API features
  apiAccess: {
    name: 'API Access',
    plan: 'enterprise',
    description: 'Access to API endpoints'
  },

  // Customization features
  customThemes: {
    name: 'Custom Themes',
    plan: 'enterprise',
    description: 'Custom themes and branding'
  },
  whiteLabel: {
    name: 'White Label',
    plan: 'enterprise',
    description: 'White-label options'
  }
};

// Plan hierarchy
const PLAN_HIERARCHY = {
  'free': 0,
  'premium': 1,
  'enterprise': 2
};

export const useFeatureGate = () => {
  const [userSubscription, setUserSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get subscription from localStorage
    const storedSubscription = localStorage.getItem('userSubscription');
    if (storedSubscription) {
      try {
        setUserSubscription(JSON.parse(storedSubscription));
      } catch (error) {
        console.error('Error parsing subscription data:', error);
      }
    }
    setLoading(false);
  }, []);

  // Check if user can access a feature
  const canAccess = (featureKey) => {
    if (loading) return false;

    const feature = FEATURE_DEFINITIONS[featureKey];
    if (!feature) return true; // Allow access if feature not defined

    if (!userSubscription) return false; // No subscription = no access

    const userPlanLevel = PLAN_HIERARCHY[userSubscription.tier] || 0;
    const requiredPlanLevel = PLAN_HIERARCHY[feature.plan] || 0;

    return userPlanLevel >= requiredPlanLevel;
  };

  // Get upgrade message for a feature
  const getUpgradeMessage = (featureKey) => {
    const feature = FEATURE_DEFINITIONS[featureKey];
    if (!feature) return null;

    const planName = feature.plan === 'premium' ? 'Study Pro' : 'Study Master';
    return {
      title: feature.name,
      description: feature.description,
      requiredPlan: planName,
      plan: feature.plan
    };
  };

  // Get user's current plan
  const getCurrentPlan = () => {
    if (!userSubscription) return 'free';
    return userSubscription.tier;
  };

  // Check if user has premium or higher
  const hasPremium = () => {
    return canAccess('unlimitedDocuments');
  };

  // Check if user has enterprise
  const hasEnterprise = () => {
    return canAccess('unlimitedStorage');
  };

  // Get available features for current plan
  const getAvailableFeatures = () => {
    if (!userSubscription) return [];

    const userPlanLevel = PLAN_HIERARCHY[userSubscription.tier] || 0;
    const availableFeatures = [];

    Object.entries(FEATURE_DEFINITIONS).forEach(([key, feature]) => {
      const requiredPlanLevel = PLAN_HIERARCHY[feature.plan] || 0;
      if (userPlanLevel >= requiredPlanLevel) {
        availableFeatures.push({
          key,
          ...feature
        });
      }
    });

    return availableFeatures;
  };

  // Get locked features for current plan
  const getLockedFeatures = () => {
    if (!userSubscription) {
      return Object.entries(FEATURE_DEFINITIONS).map(([key, feature]) => ({
        key,
        ...feature
      }));
    }

    const userPlanLevel = PLAN_HIERARCHY[userSubscription.tier] || 0;
    const lockedFeatures = [];

    Object.entries(FEATURE_DEFINITIONS).forEach(([key, feature]) => {
      const requiredPlanLevel = PLAN_HIERARCHY[feature.plan] || 0;
      if (userPlanLevel < requiredPlanLevel) {
        lockedFeatures.push({
          key,
          ...feature
        });
      }
    });

    return lockedFeatures;
  };

  return {
    userSubscription,
    loading,
    canAccess,
    getUpgradeMessage,
    getCurrentPlan,
    hasPremium,
    hasEnterprise,
    getAvailableFeatures,
    getLockedFeatures,
    FEATURE_DEFINITIONS
  };
};

// Export FEATURES for backward compatibility
export const FEATURES = {
  ...FEATURE_DEFINITIONS,
  // Add uppercase versions for backward compatibility
  BASIC_DOCUMENTS: FEATURE_DEFINITIONS.basicDocuments,
  BASIC_ANALYTICS: FEATURE_DEFINITIONS.basicAnalytics,
  UNLIMITED_DOCUMENTS: FEATURE_DEFINITIONS.unlimitedDocuments,
  DOCUMENT_COLLABORATION: FEATURE_DEFINITIONS.documentCollaboration,
  DOCUMENT_EXPORT: FEATURE_DEFINITIONS.documentExport,
  ADVANCED_STUDY_TIMER: FEATURE_DEFINITIONS.advancedStudyTimer,
  SPACED_REPETITION: FEATURE_DEFINITIONS.spacedRepetition,
  STUDY_ANALYTICS: FEATURE_DEFINITIONS.studyAnalytics,
  STUDY_GROUPS: FEATURE_DEFINITIONS.studyGroups,
  UNLIMITED_STUDY_GROUPS: FEATURE_DEFINITIONS.unlimitedStudyGroups,
  INCREASED_STORAGE: FEATURE_DEFINITIONS.increasedStorage,
  UNLIMITED_STORAGE: FEATURE_DEFINITIONS.unlimitedStorage,
  REAL_TIME_COLLABORATION: FEATURE_DEFINITIONS.realTimeCollaboration,
  ADVANCED_COLLABORATION: FEATURE_DEFINITIONS.advancedCollaboration,
  ADVANCED_ANALYTICS: FEATURE_DEFINITIONS.advancedAnalytics,
  PRIORITY_SUPPORT: FEATURE_DEFINITIONS.prioritySupport,
  DEDICATED_SUPPORT: FEATURE_DEFINITIONS.dedicatedSupport,
  API_ACCESS: FEATURE_DEFINITIONS.apiAccess,
  CUSTOM_THEMES: FEATURE_DEFINITIONS.customThemes,
  WHITE_LABEL: FEATURE_DEFINITIONS.whiteLabel
};

// Debug: Log FEATURES to console (only in development)
if (import.meta.env.DEV) {
  console.log('FEATURES exported:', FEATURES);
  console.log('BASIC_DOCUMENTS (uppercase):', FEATURES.BASIC_DOCUMENTS);
  console.log('basicDocuments (camelCase):', FEATURES.basicDocuments);
  console.log('FEATURE_DEFINITIONS keys:', Object.keys(FEATURE_DEFINITIONS));
  console.log('FEATURES keys:', Object.keys(FEATURES));
  console.log('basicDocuments in FEATURE_DEFINITIONS:', FEATURE_DEFINITIONS.basicDocuments);
  console.log('BASIC_DOCUMENTS in FEATURES:', FEATURES.BASIC_DOCUMENTS);
}

// Additional hooks for specific features
export const useSessionLimits = () => {
  const { canAccess, userSubscription } = useFeatureGate();

  const maxSessions = userSubscription?.tier === 'enterprise' ? -1 : 3;
  const isUnlimited = maxSessions === -1;

  return {
    canCreateSession: canAccess('studyGroups'),
    maxSessions,
    maxSessionsPerDay: maxSessions, // Alias for compatibility
    isUnlimited,
    canJoinSession: canAccess('studyGroups')
  };
};

export const useDocumentLimits = () => {
  const { canAccess, userSubscription } = useFeatureGate();

  const maxDocuments = userSubscription?.tier === 'free' ? 5 : -1;
  const isUnlimited = maxDocuments === -1;

  // Function to check if user can create a document based on current count
  const canCreateDocument = (currentCount) => {
    if (isUnlimited) return true;
    return currentCount < maxDocuments;
  };

  return {
    canCreateDocument,
    maxDocuments,
    isUnlimited,
    canExportDocument: canAccess('documentExport'),
    canCollaborate: canAccess('documentCollaboration')
  };
};

// Hook for AI query limits based on subscription tier
export function useAIQueryLimits() {
  const { userSubscription } = useFeatureGate();

  // Determine limits based on subscription tier
  const maxQueriesPerDay = userSubscription?.tier === 'enterprise' ? -1 : 
                          userSubscription?.tier === 'premium' ? 50 : 10;
  const isUnlimited = maxQueriesPerDay === -1;

  // Function to check if user can make a query based on current count
  const canMakeQuery = (currentCount) => {
    if (isUnlimited) return true;
    return currentCount < maxQueriesPerDay;
  };

  // Get remaining queries
  const remainingQueries = (currentCount) => {
    if (isUnlimited) return -1; // Unlimited
    return Math.max(0, maxQueriesPerDay - currentCount);
  };

  return {
    canMakeQuery,
    maxQueriesPerDay,
    isUnlimited,
    remainingQueries
  };
}

export default useFeatureGate;