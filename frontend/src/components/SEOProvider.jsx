import React from 'react';

// Simple wrapper since react-helmet-async is not installed
const SEOProvider = ({ children }) => {
  // Just return children directly - no HelmetProvider needed
  return <>{children}</>;
};

export default SEOProvider;
