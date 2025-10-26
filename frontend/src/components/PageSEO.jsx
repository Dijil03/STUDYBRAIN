import React from 'react';
import SEOHead from './SEOHead';

// SEO configurations for different pages
const pageSEOConfig = {
  home: {
    title: "StudyBrain - AI-Powered Study Platform | Transform Your Learning",
    description: "Revolutionize your study routine with StudyBrain's AI-powered tools. Create personalized study plans, track progress, and achieve academic excellence with our comprehensive learning platform.",
    keywords: "study platform, AI learning, study tools, academic success, study planner, education technology, student productivity, learning management",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "StudyBrain",
      "url": "https://studybrain.app",
      "description": "AI-powered study platform for students",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "featureList": [
        "AI-powered study planning",
        "Progress tracking",
        "Study session management",
        "Goal setting and achievement",
        "Study analytics"
      ]
    }
  },
  
  dashboard: {
    title: "Dashboard - StudyBrain | Your Learning Hub",
    description: "Access your personalized study dashboard. Track your progress, manage study sessions, and stay organized with StudyBrain's comprehensive learning management system.",
    keywords: "study dashboard, learning progress, study management, academic tracking, student dashboard"
  },
  
  studyTime: {
    title: "Study Time Tracker - StudyBrain | Log Your Learning Sessions",
    description: "Track your study sessions with StudyBrain's advanced time tracking. Monitor productivity, set goals, and optimize your learning routine for maximum academic success.",
    keywords: "study time tracker, learning sessions, study productivity, time management, academic tracking"
  },
  
  weekPlan: {
    title: "Weekly Study Planner - StudyBrain | Plan Your Learning Week",
    description: "Create comprehensive weekly study plans with StudyBrain's intelligent planner. Organize your learning schedule, set priorities, and achieve your academic goals.",
    keywords: "weekly study planner, study schedule, learning planning, academic organization, study routine"
  },
  
  flashcards: {
    title: "Flashcards - StudyBrain | AI-Powered Learning Cards",
    description: "Create and study with intelligent flashcards powered by AI. Enhance your memory retention and accelerate learning with StudyBrain's smart flashcard system.",
    keywords: "flashcards, memory training, spaced repetition, learning cards, study aids"
  },
  
  homework: {
    title: "Homework Tracker - StudyBrain | Manage Your Assignments",
    description: "Stay on top of your homework with StudyBrain's assignment tracker. Organize deadlines, track progress, and never miss an important due date again.",
    keywords: "homework tracker, assignment management, deadline tracking, academic organization"
  },
  
  goals: {
    title: "Study Goals - StudyBrain | Set and Achieve Your Academic Targets",
    description: "Set meaningful study goals and track your progress with StudyBrain's goal management system. Stay motivated and achieve your academic aspirations.",
    keywords: "study goals, academic targets, goal tracking, student motivation, achievement planning"
  },
  
  community: {
    title: "Study Community - StudyBrain | Connect with Fellow Learners",
    description: "Join StudyBrain's vibrant learning community. Connect with fellow students, share knowledge, and collaborate on your academic journey.",
    keywords: "study community, student network, collaborative learning, academic community, peer support"
  },
  
  pricing: {
    title: "Pricing - StudyBrain | Choose Your Learning Plan",
    description: "Explore StudyBrain's flexible pricing plans. From free basic features to premium AI-powered tools, find the perfect plan for your learning needs.",
    keywords: "study platform pricing, learning plans, education subscription, academic tools pricing"
  },
  
  profile: {
    title: "Profile - StudyBrain | Your Learning Profile",
    description: "Manage your StudyBrain profile and learning preferences. Customize your experience and track your academic journey with detailed progress insights.",
    keywords: "user profile, learning preferences, academic progress, student profile"
  }
};

const PageSEO = ({ page, customTitle, customDescription, customKeywords, noindex = false }) => {
  const config = pageSEOConfig[page] || pageSEOConfig.home;
  
  const title = customTitle || config.title;
  const description = customDescription || config.description;
  const keywords = customKeywords || config.keywords;
  const structuredData = config.structuredData;

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      structuredData={structuredData}
      noindex={noindex}
    />
  );
};

export default PageSEO;
