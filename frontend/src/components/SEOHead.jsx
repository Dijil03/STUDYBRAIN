import React from 'react';
import SimpleSEO from './SimpleSEO';

// Try to import react-helmet-async, fallback to SimpleSEO if not available
let Helmet;
try {
  const helmetModule = require('react-helmet-async');
  Helmet = helmetModule.Helmet;
} catch (error) {
  console.warn('react-helmet-async not available, using SimpleSEO fallback');
  Helmet = null;
}

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
  const siteUrl = import.meta.env.VITE_SITE_URL || "https://studybrain.app";
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;

  // Use SimpleSEO as fallback if Helmet is not available
  if (!Helmet) {
    return <SimpleSEO {...{ title, description, keywords, canonical, ogImage, ogType, structuredData, noindex }} />;
  }

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="StudyBrain Team" />
      <meta name="robots" content={noindex ? "noindex,nofollow" : "index,follow"} />
      <link rel="canonical" href={fullCanonical} />
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="geo.region" content="US" />
      <meta name="geo.placename" content="United States" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title} />
      <meta property="og:site_name" content="StudyBrain" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@StudyBrain" />
      <meta name="twitter:creator" content="@StudyBrain" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="StudyBrain" />
      
      {/* Viewport and Mobile Optimization */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
      
      {/* Default Structured Data for Organization */}
      {!structuredData && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "StudyBrain",
            "url": siteUrl,
            "logo": `${siteUrl}/logo.png`,
            "description": "AI-powered study platform for students",
            "sameAs": [
              "https://twitter.com/StudyBrain",
              "https://linkedin.com/company/studybrain"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "email": "support@studybrain.app"
            }
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;