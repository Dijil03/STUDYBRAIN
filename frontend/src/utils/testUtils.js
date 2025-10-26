/**
 * Test Utilities for StudyBrain
 * Provides testing helpers, mocks, and utilities for comprehensive testing
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../contexts/ThemeContext';

// Mock API responses
export const mockApiResponses = {
  user: {
    id: 'test-user-123',
    username: 'testuser',
    email: 'test@example.com',
    profilePicture: null,
    subscription: {
      plan: 'free',
      status: 'active',
      features: ['basic_flashcards', 'study_timer']
    }
  },
  
  flashcards: [
    {
      id: 'card-1',
      question: 'What is React?',
      answer: 'A JavaScript library for building user interfaces',
      difficulty: 'easy',
      repetitions: 0,
      interval: 1,
      easeFactor: 2.5,
      lastReviewed: null,
      nextReview: new Date().toISOString()
    },
    {
      id: 'card-2',
      question: 'What is JavaScript?',
      answer: 'A programming language',
      difficulty: 'medium',
      repetitions: 2,
      interval: 6,
      easeFactor: 2.3,
      lastReviewed: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      nextReview: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ],
  
  homework: [
    {
      id: 'hw-1',
      title: 'Math Assignment',
      description: 'Complete exercises 1-10',
      subject: 'Mathematics',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'High',
      completed: false
    },
    {
      id: 'hw-2',
      title: 'Science Project',
      description: 'Research paper on photosynthesis',
      subject: 'Science',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 'Medium',
      completed: true
    }
  ],
  
  studySessions: [
    {
      id: 'session-1',
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      duration: 30,
      subject: 'Mathematics',
      technique: 'flashcards',
      accuracy: 85,
      cardsStudied: 15
    }
  ]
};

// Mock API functions
export const mockApi = {
  get: jest.fn((url) => {
    if (url.includes('/auth/google/success')) {
      return Promise.resolve({ data: { user: mockApiResponses.user } });
    }
    if (url.includes('/flashcards/')) {
      return Promise.resolve({ data: mockApiResponses.flashcards });
    }
    if (url.includes('/homework/')) {
      return Promise.resolve({ data: mockApiResponses.homework });
    }
    if (url.includes('/study-sessions/')) {
      return Promise.resolve({ data: mockApiResponses.studySessions });
    }
    return Promise.resolve({ data: {} });
  }),
  
  post: jest.fn((url, data) => {
    if (url.includes('/flashcards')) {
      const newCard = { id: 'new-card', ...data };
      return Promise.resolve({ data: newCard });
    }
    if (url.includes('/homework')) {
      const newHomework = { id: 'new-hw', ...data };
      return Promise.resolve({ data: newHomework });
    }
    return Promise.resolve({ data: { success: true } });
  }),
  
  put: jest.fn((url, data) => {
    return Promise.resolve({ data: { ...data, updated: true } });
  }),
  
  delete: jest.fn((url) => {
    return Promise.resolve({ data: { deleted: true } });
  })
};

// Custom render function with providers
export const renderWithProviders = (ui, { 
  theme = 'dark',
  initialRoute = '/',
  ...renderOptions 
} = {}) => {
  const Wrapper = ({ children }) => (
    <BrowserRouter>
      <ThemeProvider value={{ theme }}>
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
  
  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock localStorage
export const mockLocalStorage = () => {
  const store = {};
  
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    })
  };
};

// Mock IndexedDB
export const mockIndexedDB = () => {
  const mockDB = {
    transaction: jest.fn(() => ({
      objectStore: jest.fn(() => ({
        add: jest.fn(() => Promise.resolve()),
        get: jest.fn(() => Promise.resolve()),
        getAll: jest.fn(() => Promise.resolve([])),
        put: jest.fn(() => Promise.resolve()),
        delete: jest.fn(() => Promise.resolve())
      }))
    }))
  };
  
  global.indexedDB = {
    open: jest.fn(() => ({
      onsuccess: null,
      onerror: null,
      onupgradeneeded: null,
      result: mockDB
    }))
  };
};

// Mock service worker
export const mockServiceWorker = () => {
  const mockSW = {
    register: jest.fn(() => Promise.resolve({
      installing: null,
      waiting: null,
      active: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    ready: Promise.resolve({
      pushManager: {
        subscribe: jest.fn(() => Promise.resolve()),
        getSubscription: jest.fn(() => Promise.resolve(null))
      }
    })
  };
  
  Object.defineProperty(navigator, 'serviceWorker', {
    value: mockSW,
    writable: true
  });
};

// Mock notifications
export const mockNotifications = () => {
  const mockNotification = {
    requestPermission: jest.fn(() => Promise.resolve('granted')),
    show: jest.fn()
  };
  
  Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true
  });
};

// Test data generators
export const generateTestUser = (overrides = {}) => ({
  id: 'test-user-123',
  username: 'testuser',
  email: 'test@example.com',
  profilePicture: null,
  subscription: {
    plan: 'free',
    status: 'active',
    features: ['basic_flashcards', 'study_timer']
  },
  ...overrides
});

export const generateTestFlashcard = (overrides = {}) => ({
  id: 'test-card-123',
  question: 'Test question?',
  answer: 'Test answer',
  difficulty: 'medium',
  repetitions: 0,
  interval: 1,
  easeFactor: 2.5,
  lastReviewed: null,
  nextReview: new Date().toISOString(),
  ...overrides
});

export const generateTestHomework = (overrides = {}) => ({
  id: 'test-hw-123',
  title: 'Test Assignment',
  description: 'Test description',
  subject: 'Test Subject',
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  priority: 'Medium',
  completed: false,
  ...overrides
});

export const generateTestStudySession = (overrides = {}) => ({
  id: 'test-session-123',
  startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  endTime: new Date().toISOString(),
  duration: 60,
  subject: 'Test Subject',
  technique: 'flashcards',
  accuracy: 80,
  cardsStudied: 20,
  ...overrides
});

// Async testing utilities
export const waitForApiCall = async (mockFn, times = 1) => {
  await waitFor(() => {
    expect(mockFn).toHaveBeenCalledTimes(times);
  });
};

export const waitForElementToBeRemoved = async (element) => {
  await waitFor(() => {
    expect(element).not.toBeInTheDocument();
  });
};

// Mock Intersection Observer
export const mockIntersectionObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  };
  
  Object.defineProperty(window, 'IntersectionObserver', {
    value: jest.fn(() => mockObserver),
    writable: true
  });
  
  return mockObserver;
};

// Mock ResizeObserver
export const mockResizeObserver = () => {
  const mockObserver = {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn()
  };
  
  Object.defineProperty(window, 'ResizeObserver', {
    value: jest.fn(() => mockObserver),
    writable: true
  });
  
  return mockObserver;
};

// Mock matchMedia
export const mockMatchMedia = (matches = true) => {
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn(() => ({
      matches,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    })),
    writable: true
  });
};

// Test setup function
export const setupTestEnvironment = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage(),
    writable: true
  });
  
  // Mock IndexedDB
  mockIndexedDB();
  
  // Mock service worker
  mockServiceWorker();
  
  // Mock notifications
  mockNotifications();
  
  // Mock Intersection Observer
  mockIntersectionObserver();
  
  // Mock ResizeObserver
  mockResizeObserver();
  
  // Mock matchMedia
  mockMatchMedia();
  
  // Mock fetch
  global.fetch = jest.fn();
  
  // Mock console methods to reduce noise in tests
  global.console = {
    ...console,
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  };
};

// Cleanup function
export const cleanupTestEnvironment = () => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
};

// Custom matchers for testing
export const customMatchers = {
  toBeInTheDocument: (element) => {
    return element !== null && element !== undefined;
  },
  
  toHaveClass: (element, className) => {
    return element.classList.contains(className);
  },
  
  toHaveTextContent: (element, text) => {
    return element.textContent.includes(text);
  }
};

// Performance testing utilities
export const measurePerformance = (callback) => {
  const start = performance.now();
  callback();
  const end = performance.now();
  return end - start;
};

// Accessibility testing utilities
export const checkAccessibility = async (container) => {
  // This would integrate with axe-core for accessibility testing
  // For now, return a mock result
  return {
    violations: [],
    passes: [],
    incomplete: []
  };
};

// Mock Chart.js for testing
export const mockChartJS = () => {
  const mockChart = {
    destroy: jest.fn(),
    update: jest.fn(),
    render: jest.fn()
  };
  
  // Mock Chart.js components
  global.Chart = jest.fn(() => mockChart);
  global.Chart.register = jest.fn();
  
  return mockChart;
};

export default {
  mockApiResponses,
  mockApi,
  renderWithProviders,
  mockLocalStorage,
  mockIndexedDB,
  mockServiceWorker,
  mockNotifications,
  generateTestUser,
  generateTestFlashcard,
  generateTestHomework,
  generateTestStudySession,
  waitForApiCall,
  waitForElementToBeRemoved,
  mockIntersectionObserver,
  mockResizeObserver,
  mockMatchMedia,
  setupTestEnvironment,
  cleanupTestEnvironment,
  customMatchers,
  measurePerformance,
  checkAccessibility,
  mockChartJS
};
