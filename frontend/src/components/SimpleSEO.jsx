import React, { useEffect } from 'react';

const SimpleSEO = ({
  title = "StudyBrain - AI-Powered Study Platform",
  description = "Transform your learning with StudyBrain's AI-powered study tools. Create study plans, track progress, and achieve academic success.",
  keywords = "study platform, AI learning, study tools, academic success",
  canonical = "",
  ogImage = "/og-image.jpg"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    // Update meta keywords
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    const siteUrl = import.meta.env.VITE_SITE_URL || "https://studybrain.app";
    const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
    
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullCanonical);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = fullCanonical;
      document.head.appendChild(link);
    }
    
    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = title;
      document.head.appendChild(meta);
    }
    
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', fullOgImage);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:image');
      meta.content = fullOgImage;
      document.head.appendChild(meta);
    }
    
    // Update Twitter Card tags
    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', title);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'twitter:title';
      meta.content = title;
      document.head.appendChild(meta);
    }
    
    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'twitter:description';
      meta.content = description;
      document.head.appendChild(meta);
    }
    
    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) {
      twitterImage.setAttribute('content', fullOgImage);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'twitter:image';
      meta.content = fullOgImage;
      document.head.appendChild(meta);
    }
    
  }, [title, description, keywords, canonical, ogImage]);

  return null; // This component doesn't render anything
};

export default SimpleSEO;
