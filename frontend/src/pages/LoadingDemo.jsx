import React, { useState } from 'react';
import { motion } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import PageSEO from '../components/PageSEO';

const LoadingDemo = () => {
  const [selectedVariant, setSelectedVariant] = useState('spinner');
  const [selectedSize, setSelectedSize] = useState('medium');
  const [selectedColor, setSelectedColor] = useState('primary');
  const [showFullScreen, setShowFullScreen] = useState(false);

  const variants = [
    { id: 'spinner', name: 'Spinner', description: 'Classic rotating spinner' },
    { id: 'dots', name: 'Dots', description: 'Bouncing dots animation' },
    { id: 'pulse', name: 'Pulse', description: 'Pulsing circle effect' },
    { id: 'wave', name: 'Wave', description: 'Wave-like bars animation' },
    { id: 'orbit', name: 'Orbit', description: 'Orbiting circles' },
    { id: 'bounce', name: 'Bounce', description: 'Bouncing balls' },
    { id: 'glow', name: 'Glow', description: 'Glowing pulsing effect' }
  ];

  const sizes = [
    { id: 'small', name: 'Small' },
    { id: 'medium', name: 'Medium' },
    { id: 'large', name: 'Large' },
    { id: 'xl', name: 'Extra Large' }
  ];

  const colors = [
    { id: 'primary', name: 'Primary', class: 'from-blue-500 to-purple-600' },
    { id: 'secondary', name: 'Secondary', class: 'from-gray-400 to-gray-600' },
    { id: 'success', name: 'Success', class: 'from-green-400 to-green-600' },
    { id: 'warning', name: 'Warning', class: 'from-yellow-400 to-orange-500' },
    { id: 'error', name: 'Error', class: 'from-red-400 to-red-600' },
    { id: 'white', name: 'White', class: 'from-white to-gray-200' },
    { id: 'dark', name: 'Dark', class: 'from-gray-800 to-gray-900' }
  ];

  return (
    <>
      <PageSEO 
        title="Loading Spinner Demo - StudyBrain"
        description="Beautiful and stunning loading spinner components with multiple variants and animations"
        keywords="loading, spinner, animation, react, components"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              🎨 Beautiful Loading Spinners
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stunning, reusable loading components with multiple variants, sizes, and colors. 
              Perfect for any React application.
            </p>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Loader</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Variant Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Animation Variant
                </label>
                <div className="space-y-2">
                  {variants.map((variant) => (
                    <label key={variant.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="variant"
                        value={variant.id}
                        checked={selectedVariant === variant.id}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{variant.name}</div>
                        <div className="text-sm text-gray-500">{variant.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Size
                </label>
                <div className="space-y-2">
                  {sizes.map((size) => (
                    <label key={size.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="size"
                        value={size.id}
                        checked={selectedSize === size.id}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="font-medium text-gray-900">{size.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Color Theme
                </label>
                <div className="space-y-2">
                  {colors.map((color) => (
                    <label key={color.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="color"
                        value={color.id}
                        checked={selectedColor === color.id}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${color.class}`}></div>
                        <span className="font-medium text-gray-900">{color.name}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Full Screen Toggle */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFullScreen}
                  onChange={(e) => setShowFullScreen(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium text-gray-900">Show Full Screen Modal</span>
              </label>
            </div>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Live Preview</h2>
            
            <div className="flex flex-col items-center justify-center min-h-[300px] bg-gray-50 rounded-xl">
              <LoadingSpinner
                variant={selectedVariant}
                size={selectedSize}
                color={selectedColor}
                text="Loading amazing content..."
                fullScreen={showFullScreen}
              />
            </div>
          </motion.div>

          {/* Code Examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Usage Examples</h2>
            
            <div className="space-y-6">
              {/* Basic Usage */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Basic Usage</h3>
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400">
{`import LoadingSpinner from './components/LoadingSpinner';

// Simple spinner
<LoadingSpinner />

// With custom text
<LoadingSpinner text="Loading..." />

// Different variants
<LoadingSpinner variant="dots" />
<LoadingSpinner variant="pulse" />
<LoadingSpinner variant="wave" />`}
                  </code>
                </pre>
              </div>

              {/* Advanced Usage */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Advanced Configuration</h3>
                <pre className="bg-gray-800 rounded-lg p-4 overflow-x-auto">
                  <code className="text-green-400">
{`// Custom size and color
<LoadingSpinner 
  size="large" 
  color="success" 
  text="Processing..." 
/>

// Full screen modal
<LoadingSpinner 
  variant="glow" 
  size="xl" 
  color="primary" 
  text="Please wait..." 
  fullScreen={true} 
/>

// All available props
<LoadingSpinner
  variant="orbit"        // spinner, dots, pulse, wave, orbit, bounce, glow
  size="medium"         // small, medium, large, xl
  color="primary"       // primary, secondary, success, warning, error, white, dark
  text="Loading..."     // Optional text
  fullScreen={false}    // Full screen modal
/>`}
                  </code>
                </pre>
              </div>
            </div>
          </motion.div>

          {/* All Variants Showcase */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Animation Variants</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {variants.map((variant, index) => (
                <motion.div
                  key={variant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-50 rounded-xl p-6 text-center"
                >
                  <h3 className="font-semibold text-gray-900 mb-4">{variant.name}</h3>
                  <div className="flex justify-center mb-4">
                    <LoadingSpinner
                      variant={variant.id}
                      size="medium"
                      color="primary"
                    />
                  </div>
                  <p className="text-sm text-gray-600">{variant.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default LoadingDemo;
