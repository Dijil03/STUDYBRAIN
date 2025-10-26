import React from 'react';

// Try to import HelmetProvider, fallback to simple wrapper if not available
let HelmetProvider;
try {
  const helmetModule = require('react-helmet-async');
  HelmetProvider = helmetModule.HelmetProvider;
} catch (error) {
  console.warn('react-helmet-async not available, using simple wrapper');
  HelmetProvider = ({ children }) => children;
}

const SEOProvider = ({ children }) => {
  return (
    <HelmetProvider>
      {children}
    </HelmetProvider>
  );
};

export default SEOProvider;
