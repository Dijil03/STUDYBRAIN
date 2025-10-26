import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeWrapper = ({ children, className = "" }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`theme-${theme} ${className}`}>
      {children}
    </div>
  );
};

export default ThemeWrapper;
