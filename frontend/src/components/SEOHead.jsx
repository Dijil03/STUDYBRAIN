import React from 'react';
import SimpleSEO from './SimpleSEO';

// Use SimpleSEO directly since react-helmet-async is not installed
const SEOHead = ({
  title = "StudyBrain - AI-Powered Study Platform",
  description = "Transform your learning with StudyBrain's AI-powered study tools. Create study plans, track progress, and achieve academic success with our comprehensive study platform.",
  keywords = "study platform, AI learning, study tools, academic success, study planner, education technology, student productivity",
  canonical = "",
  ogImage = "/og-image.jpg",
  ogType = "website",
  structuredData = null,
  noindex = false
}) => {
  // Always use SimpleSEO since react-helmet-async is not available
  return <SimpleSEO {...{ title, description, keywords, canonical, ogImage, ogType, structuredData, noindex }} />;
};

export default SEOHead;