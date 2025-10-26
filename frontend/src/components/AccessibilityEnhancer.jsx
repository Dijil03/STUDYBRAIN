import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Type, 
  MousePointer, 
  Keyboard, 
  Settings,
  Check,
  X,
  AlertCircle,
  Info
} from 'lucide-react';

const AccessibilityEnhancer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusIndicators: true,
    colorBlindSupport: false,
    dyslexiaSupport: false,
    audioDescriptions: false,
    voiceControl: false
  });
  const [announcements, setAnnouncements] = useState([]);
  const [focusTrap, setFocusTrap] = useState(null);
  const announcementRef = useRef(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('accessibilitySettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Apply initial settings
    applySettings(JSON.parse(savedSettings || '{}'));
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    
    // High contrast mode
    if (newSettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Large text mode
    if (newSettings.largeText) {
      root.style.fontSize = '1.2rem';
      root.classList.add('large-text');
    } else {
      root.style.fontSize = '';
      root.classList.remove('large-text');
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Color blind support
    if (newSettings.colorBlindSupport) {
      root.classList.add('colorblind-support');
    } else {
      root.classList.remove('colorblind-support');
    }

    // Dyslexia support
    if (newSettings.dyslexiaSupport) {
      root.classList.add('dyslexia-support');
    } else {
      root.classList.remove('dyslexia-support');
    }

    // Focus indicators
    if (newSettings.focusIndicators) {
      root.classList.add('focus-indicators');
    } else {
      root.classList.remove('focus-indicators');
    }
  };

  const announceToScreenReader = (message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after 5 seconds
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);
  };

  const toggleSetting = (setting) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    const settingName = setting.replace(/([A-Z])/g, ' $1').toLowerCase();
    announceToScreenReader(
      `${settingName} ${!settings[setting] ? 'enabled' : 'disabled'}`
    );
  };

  const resetSettings = () => {
    const defaultSettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReader: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindSupport: false,
      dyslexiaSupport: false,
      audioDescriptions: false,
      voiceControl: false
    };
    
    setSettings(defaultSettings);
    announceToScreenReader('Accessibility settings reset to default');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <>
      {/* Accessibility Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
        aria-label="Open accessibility settings"
        title="Accessibility Settings"
      >
        <Settings className="w-6 h-6" />
      </motion.button>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-96 bg-slate-800/95 backdrop-blur-xl border-l border-white/20 shadow-2xl z-50 overflow-y-auto"
            role="dialog"
            aria-labelledby="accessibility-title"
            aria-modal="true"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 id="accessibility-title" className="text-xl font-bold text-white">
                  Accessibility Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Close accessibility settings"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Settings Categories */}
              <div className="space-y-6">
                {/* Visual Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Visual Settings
                  </h3>
                  <div className="space-y-3">
                    <AccessibilityToggle
                      setting="highContrast"
                      label="High Contrast Mode"
                      description="Increases contrast for better visibility"
                      icon={Eye}
                      isEnabled={settings.highContrast}
                      onToggle={() => toggleSetting('highContrast')}
                    />
                    
                    <AccessibilityToggle
                      setting="largeText"
                      label="Large Text"
                      description="Increases text size for better readability"
                      icon={Type}
                      isEnabled={settings.largeText}
                      onToggle={() => toggleSetting('largeText')}
                    />
                    
                    <AccessibilityToggle
                      setting="colorBlindSupport"
                      label="Color Blind Support"
                      description="Uses patterns and shapes alongside colors"
                      icon={Eye}
                      isEnabled={settings.colorBlindSupport}
                      onToggle={() => toggleSetting('colorBlindSupport')}
                    />
                    
                    <AccessibilityToggle
                      setting="dyslexiaSupport"
                      label="Dyslexia Support"
                      description="Uses dyslexia-friendly fonts and spacing"
                      icon={Type}
                      isEnabled={settings.dyslexiaSupport}
                      onToggle={() => toggleSetting('dyslexiaSupport')}
                    />
                  </div>
                </div>

                {/* Motion Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <MousePointer className="w-5 h-5 mr-2" />
                    Motion Settings
                  </h3>
                  <div className="space-y-3">
                    <AccessibilityToggle
                      setting="reducedMotion"
                      label="Reduce Motion"
                      description="Reduces animations and transitions"
                      icon={MousePointer}
                      isEnabled={settings.reducedMotion}
                      onToggle={() => toggleSetting('reducedMotion')}
                    />
                  </div>
                </div>

                {/* Navigation Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Keyboard className="w-5 h-5 mr-2" />
                    Navigation Settings
                  </h3>
                  <div className="space-y-3">
                    <AccessibilityToggle
                      setting="keyboardNavigation"
                      label="Keyboard Navigation"
                      description="Enables full keyboard navigation support"
                      icon={Keyboard}
                      isEnabled={settings.keyboardNavigation}
                      onToggle={() => toggleSetting('keyboardNavigation')}
                    />
                    
                    <AccessibilityToggle
                      setting="focusIndicators"
                      label="Focus Indicators"
                      description="Shows clear focus indicators for keyboard users"
                      icon={MousePointer}
                      isEnabled={settings.focusIndicators}
                      onToggle={() => toggleSetting('focusIndicators')}
                    />
                  </div>
                </div>

                {/* Audio Settings */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <Volume2 className="w-5 h-5 mr-2" />
                    Audio Settings
                  </h3>
                  <div className="space-y-3">
                    <AccessibilityToggle
                      setting="audioDescriptions"
                      label="Audio Descriptions"
                      description="Provides audio descriptions for visual content"
                      icon={Volume2}
                      isEnabled={settings.audioDescriptions}
                      onToggle={() => toggleSetting('audioDescriptions')}
                    />
                    
                    <AccessibilityToggle
                      setting="voiceControl"
                      label="Voice Control"
                      description="Enables voice commands for navigation"
                      icon={Volume2}
                      isEnabled={settings.voiceControl}
                      onToggle={() => toggleSetting('voiceControl')}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={resetSettings}
                  className="w-full bg-slate-600 hover:bg-slate-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Reset to Default
                </button>
                
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg transition-colors"
                >
                  Close Settings
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen Reader Announcements */}
      <div
        ref={announcementRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {announcements.map(announcement => (
          <div key={announcement.id}>
            {announcement.message}
          </div>
        ))}
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

// Accessibility Toggle Component
const AccessibilityToggle = ({ 
  setting, 
  label, 
  description, 
  icon: Icon, 
  isEnabled, 
  onToggle 
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className="w-5 h-5 text-gray-400" />
        <div>
          <div className="text-white font-medium">{label}</div>
          <div className="text-sm text-gray-400">{description}</div>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
          isEnabled ? 'bg-purple-600' : 'bg-gray-600'
        }`}
        role="switch"
        aria-checked={isEnabled}
        aria-label={`${label}: ${isEnabled ? 'enabled' : 'disabled'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default AccessibilityEnhancer;
