import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import { format, startOfMonth, endOfMonth, addDays } from 'date-fns';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import api from '../utils/axios';
import { toast } from 'react-toastify';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  BookOpen,
  GraduationCap,
  Clock,
  Settings,
  LogOut
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Calendar = () => {
  const { theme } = useTheme();
  const userId = localStorage.getItem('userId');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    summary: '',
    description: '',
    start: new Date(),
    end: new Date(new Date().getTime() + 60 * 60 * 1000),
    location: ''
  });
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Check if Google Calendar is connected
  useEffect(() => {
    checkConnection();
  }, []);

  // Fetch events when date changes
  useEffect(() => {
    if (isConnected) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [currentDate, isConnected]);

  const checkConnection = async () => {
    try {
      const response = await api.get(`/google-calendar/${userId}/events`, {
        params: {
          maxResults: 1
        }
      });
      setIsConnected(true);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsConnected(false);
      } else {
        setIsConnected(false);
      }
    }
  };

  const connectGoogleCalendar = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google-calendar`;
  };

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      const response = await api.get(`/google-calendar/${userId}/all-events`, {
        params: {
          timeMin: start.toISOString(),
          timeMax: end.toISOString()
        }
      });

      if (response.data.success) {
        const formattedEvents = response.data.events.map(event => ({
          id: event.id,
          title: event.summary || 'Untitled Event',
          start: new Date(event.start?.dateTime || event.start?.date),
          end: new Date(event.end?.dateTime || event.end?.date),
          resource: event,
          color: getEventColor(event)
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (event) => {
    // Google Calendar colors
    const colorMap = {
      '1': '#7986cb', // Lavender
      '2': '#33b679', // Sage
      '3': '#8e24aa', // Grape
      '4': '#e67c73', // Flamingo
      '5': '#f6bf26', // Banana
      '6': '#f4511e', // Tangerine
      '7': '#039be5', // Peacock
      '8': '#616161', // Graphite
      '9': '#3f51b5', // Blueberry
      '10': '#0b8043', // Basil
      '11': '#d50000', // Tomato
      'homework': '#e67c73', // Red for homework
      'exam': '#f6bf26', // Yellow for exams
      'google': '#7986cb' // Default blue
    };

    if (event.source === 'homework') return colorMap.homework;
    if (event.source === 'exam') return colorMap.exam;
    if (event.colorId) return colorMap[event.colorId];
    return colorMap.google;
  };

  const handleCreateEvent = async () => {
    try {
      const response = await api.post(`/google-calendar/${userId}/events`, {
        summary: newEvent.summary,
        description: newEvent.description,
        start: newEvent.start.toISOString(),
        end: newEvent.end.toISOString(),
        location: newEvent.location
      });

      if (response.data.success) {
        toast.success('Event created successfully!');
        setShowNewEventModal(false);
        setNewEvent({
          summary: '',
          description: '',
          start: new Date(),
          end: new Date(new Date().getTime() + 60 * 60 * 1000),
          location: ''
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error(error.response?.data?.message || 'Failed to create event');
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event.resource);
    setShowEventModal(true);
  };

  const handleNavigate = (action) => {
    if (action === 'PREV') {
      if (view === 'month') {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
      } else if (view === 'week') {
        setCurrentDate(addDays(currentDate, -7));
      } else {
        setCurrentDate(addDays(currentDate, -1));
      }
    } else if (action === 'NEXT') {
      if (view === 'month') {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      } else if (view === 'week') {
        setCurrentDate(addDays(currentDate, 7));
      } else {
        setCurrentDate(addDays(currentDate, 1));
      }
    } else if (action === 'TODAY') {
      setCurrentDate(new Date());
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color || '#7986cb',
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px'
      }
    };
  };

  const localizer = momentLocalizer(moment);

  if (!isConnected) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <div className={`p-8 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-blue-500" />
              <h2 className="text-2xl font-bold mb-4">Connect Google Calendar</h2>
              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Connect your Google Calendar to view and manage all your events in one beautiful calendar.
              </p>
              <button
                onClick={connectGoogleCalendar}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CalendarIcon className="w-5 h-5" />
                Connect Google Calendar
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Calendar</h1>
              <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Manage your schedule and view all your events
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewEventModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Event
              </button>
              <button
                onClick={fetchEvents}
                disabled={loading}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* View Selector */}
          <div className="flex gap-2 mb-4">
            {['month', 'week', 'day', 'agenda'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  view === v
                    ? 'bg-blue-500 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Calendar Component */}
        <div className={`rounded-lg shadow-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 600 }}
              view={view}
              onView={(view) => setView(view)}
              date={currentDate}
              onNavigate={handleNavigate}
              onSelectEvent={handleEventClick}
              eventPropGetter={eventStyleGetter}
              toolbar={false}
              className={theme === 'dark' ? 'rbc-calendar-dark' : ''}
            />
          )}
        </div>

        {/* Event Details Modal */}
        {showEventModal && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full p-6 rounded-lg shadow-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    {selectedEvent.summary || 'Untitled Event'}
                  </h3>
                  {selectedEvent.source && (
                    <span className={`inline-block px-2 py-1 rounded text-sm ${
                      selectedEvent.source === 'homework' ? 'bg-red-100 text-red-800' :
                      selectedEvent.source === 'exam' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedEvent.source}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-3">
                {selectedEvent.description && (
                  <div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedEvent.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-sm">
                    {format(new Date(selectedEvent.start?.dateTime || selectedEvent.start?.date), 'PPP p')} -{' '}
                    {format(new Date(selectedEvent.end?.dateTime || selectedEvent.end?.date), 'p')}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">{selectedEvent.location}</span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* New Event Modal */}
        {showNewEventModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`max-w-md w-full p-6 rounded-lg shadow-xl ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}
            >
              <h3 className="text-xl font-bold mb-4">Create New Event</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newEvent.summary}
                    onChange={(e) => setNewEvent({ ...newEvent, summary: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    rows="3"
                    placeholder="Event description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Start</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">End</label>
                    <input
                      type="datetime-local"
                      value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                      onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                    placeholder="Event location"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowNewEventModal(false)}
                    className={`px-4 py-2 rounded-lg ${
                      theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateEvent}
                    className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    Create Event
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      <style>{`
        .rbc-calendar-dark {
          color: white;
        }
        .rbc-calendar-dark .rbc-header {
          border-bottom: 1px solid #374151;
          color: #e5e7eb;
        }
        .rbc-calendar-dark .rbc-day-bg {
          border-color: #374151;
        }
        .rbc-calendar-dark .rbc-today {
          background-color: #1f2937;
        }
        .rbc-calendar-dark .rbc-off-range-bg {
          background-color: #111827;
        }
        .rbc-calendar-dark .rbc-toolbar button {
          color: #e5e7eb;
          background-color: #374151;
          border-color: #4b5563;
        }
        .rbc-calendar-dark .rbc-toolbar button:hover {
          background-color: #4b5563;
        }
        .rbc-calendar-dark .rbc-toolbar button.rbc-active {
          background-color: #3b82f6;
        }
      `}</style>
    </div>
  );
};

export default Calendar;

