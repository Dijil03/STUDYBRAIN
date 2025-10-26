import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, BookOpen, Target, Calendar, Trophy, Zap, FileText, Folder, Users, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Searchable features and pages
  const searchableItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BookOpen, category: 'Main', description: 'Your study overview and progress' },
    { name: 'Study Time', path: '/study-time', icon: Clock, category: 'Study', description: 'Track your study sessions' },
    { name: 'Homework', path: '/homework', icon: Target, category: 'Tasks', description: 'Manage your homework and assignments' },
    { name: 'Week Plan', path: '/week-plan', icon: Calendar, category: 'Planning', description: 'Plan your weekly study schedule' },
    { name: 'Study Timer', path: '/study-timer', icon: Clock, category: 'Study', description: 'Focus timer for productive sessions' },
    { name: 'Flashcards', path: '/flashcard', icon: Zap, category: 'Study', description: 'Create and study with flashcards' },
    { name: 'Flashcard Generator', path: '/flashcards', icon: Zap, category: 'Study', description: 'AI-powered flashcard creation' },
    { name: 'Flashcard Viewer', path: '/flashcard-viewer', icon: BookOpen, category: 'Study', description: 'Study your flashcard sets' },
    { name: 'Goals', path: '/goals', icon: Target, category: 'Planning', description: 'Set and track your study goals' },
    { name: 'My World', path: '/myworld', icon: Trophy, category: 'Profile', description: 'Your personal study world' },
    { name: 'Documents', path: '/documents', icon: FileText, category: 'Files', description: 'Manage your study documents' },
    { name: 'Document Editor', path: '/document-editor', icon: FileText, category: 'Files', description: 'Create and edit documents' },
    { name: 'Folder Manager', path: '/folder-manager', icon: Folder, category: 'Files', description: 'Organize your study materials' },
    { name: 'Community', path: '/community', icon: Users, category: 'Social', description: 'Connect with other students' },
    { name: 'Badges', path: '/badges', icon: Trophy, category: 'Profile', description: 'View your achievements' },
    { name: 'Assessments', path: '/assessments', icon: Target, category: 'Study', description: 'Take practice tests' },
    { name: 'Study Journal', path: '/study-journal', icon: BookOpen, category: 'Study', description: 'Reflect on your learning' },
    { name: 'Pricing', path: '/pricing', icon: Settings, category: 'Account', description: 'View subscription plans' },
    { name: 'Profile', path: '/profile', icon: Users, category: 'Profile', description: 'Manage your account' },
  ];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim()) {
      setIsLoading(true);
      const filtered = searchableItems.filter(item =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.description.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered);
      setIsLoading(false);
    } else {
      setResults([]);
    }
  }, [query]);

  const handleSearch = (item) => {
    navigate(item.path);
    onClose();
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const categories = [...new Set(searchableItems.map(item => item.category))];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
              {/* Search Input */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search features, pages, or tools..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Search Results */}
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-400">Searching...</p>
                  </div>
                ) : query.trim() ? (
                  results.length > 0 ? (
                    <div className="p-2">
                      {results.map((item, index) => {
                        const Icon = item.icon;
                        return (
                          <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ backgroundColor: 'rgba(168, 85, 247, 0.1)' }}
                            onClick={() => handleSearch(item)}
                            className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-purple-500/10 transition-colors"
                          >
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-white font-semibold">{item.name}</h3>
                              <p className="text-gray-400 text-sm">{item.description}</p>
                              <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
                                {item.category}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-400" />
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">No results found for "{query}"</p>
                      <p className="text-gray-500 text-sm mt-2">Try searching for features like "flashcards", "timer", or "homework"</p>
                    </div>
                  )
                ) : (
                  <div className="p-4">
                    {/* Quick Access Categories */}
                    <div className="mb-6">
                      <h3 className="text-white font-semibold mb-3">Quick Access</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {categories.slice(0, 6).map((category) => (
                          <motion.button
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="p-2 bg-slate-700/50 rounded-lg text-gray-300 text-sm hover:bg-purple-500/20 transition-colors"
                          >
                            {category}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Recent Searches */}
                    {recentSearches.length > 0 && (
                      <div>
                        <h3 className="text-white font-semibold mb-3">Recent</h3>
                        <div className="space-y-2">
                          {recentSearches.slice(0, 3).map((search, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center p-2 rounded-lg hover:bg-slate-700/50 cursor-pointer"
                            >
                              <Clock className="w-4 h-4 text-gray-400 mr-3" />
                              <span className="text-gray-300">{search}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 bg-slate-700/30">
                <div className="flex items-center justify-between text-sm text-gray-400">
                  <span>Press <kbd className="px-2 py-1 bg-slate-600 rounded text-xs">Esc</kbd> to close</span>
                  <span>{searchableItems.length} features available</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalSearch;
