import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
  Users, 
  Star, 
  Lock, 
  Unlock,
  BookOpen,
  Microscope,
  Palette,
  Coffee,
  TreePine,
  Dumbbell,
  GraduationCap,
  Home
} from 'lucide-react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const VirtualCampus = ({ userId, onClose }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState('entrance');
  const [occupants, setOccupants] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, [userId]);

  const fetchLocations = async () => {
    try {
      const response = await api.get(`/gamification/campus/locations?userId=${userId}`);
      if (response.data.success) {
        setLocations(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      toast.error('Failed to load campus locations');
    } finally {
      setLoading(false);
    }
  };

  const joinLocation = async (locationId) => {
    try {
      const response = await api.post(`/gamification/campus/locations/${locationId}/join`, {
        userId,
        userName: localStorage.getItem('username') || 'Student',
        avatar: 'default'
      });
      
      if (response.data.success) {
        setCurrentLocation(locationId);
        setOccupants(response.data.data.occupants);
        toast.success(`Joined ${selectedLocation?.name}!`);
      }
    } catch (error) {
      console.error('Error joining location:', error);
      toast.error('Failed to join location');
    }
  };

  const leaveLocation = async () => {
    try {
      const response = await api.post(`/gamification/campus/locations/${currentLocation}/leave`, {
        userId
      });
      
      if (response.data.success) {
        setCurrentLocation('entrance');
        setOccupants([]);
        toast.success('Left location');
      }
    } catch (error) {
      console.error('Error leaving location:', error);
      toast.error('Failed to leave location');
    }
  };

  const getLocationIcon = (type) => {
    switch (type) {
      case 'entrance': return <Home className="w-6 h-6" />;
      case 'library': return <BookOpen className="w-6 h-6" />;
      case 'classroom': return <GraduationCap className="w-6 h-6" />;
      case 'lab': return <Microscope className="w-6 h-6" />;
      case 'art_studio': return <Palette className="w-6 h-6" />;
      case 'cafeteria': return <Coffee className="w-6 h-6" />;
      case 'garden': return <TreePine className="w-6 h-6" />;
      case 'gym': return <Dumbbell className="w-6 h-6" />;
      default: return <MapPin className="w-6 h-6" />;
    }
  };

  const getLocationColor = (type) => {
    switch (type) {
      case 'entrance': return 'from-blue-500 to-blue-600';
      case 'library': return 'from-amber-500 to-amber-600';
      case 'classroom': return 'from-green-500 to-green-600';
      case 'lab': return 'from-yellow-500 to-yellow-600';
      case 'art_studio': return 'from-pink-500 to-pink-600';
      case 'cafeteria': return 'from-orange-500 to-orange-600';
      case 'garden': return 'from-emerald-500 to-emerald-600';
      case 'gym': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Loading campus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Virtual Campus</h2>
            <p className="text-gray-600">Explore and interact with different learning spaces</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ×
          </button>
        </div>

        {/* Current Location Status */}
        {currentLocation !== 'entrance' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                  {getLocationIcon(locations.find(l => l.id === currentLocation)?.type)}
                </div>
                <div>
                  <p className="font-medium text-blue-800">
                    Currently in: {locations.find(l => l.id === currentLocation)?.name}
                  </p>
                  <p className="text-sm text-blue-600">
                    {occupants.length} people here
                  </p>
                </div>
              </div>
              <button
                onClick={leaveLocation}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Leave
              </button>
            </div>
          </div>
        )}

        {/* Campus Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((location) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className={`bg-gradient-to-br ${getLocationColor(location.type)} rounded-xl p-6 text-white cursor-pointer ${
                currentLocation === location.id ? 'ring-4 ring-white/50' : ''
              }`}
              onClick={() => setSelectedLocation(location)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getLocationIcon(location.type)}
                  <h3 className="text-lg font-bold">{location.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{location.currentOccupants?.length || 0}</span>
                </div>
              </div>
              
              <p className="text-sm text-white/80 mb-4">{location.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {location.accessLevel === 'public' ? (
                    <Unlock className="w-4 h-4" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                  <span className="text-xs">
                    {location.accessLevel === 'public' ? 'Public' : 
                     location.accessLevel === 'level_required' ? `Level ${location.requiredLevel}+` :
                     'Restricted'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span className="text-xs">{location.stats?.popularity || 0}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Location Details Modal */}
        <AnimatePresence>
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{selectedLocation.name}</h3>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">{selectedLocation.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Capacity</p>
                      <p className="text-lg font-bold">{selectedLocation.capacity} people</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm text-gray-600">Currently Online</p>
                      <p className="text-lg font-bold">{selectedLocation.currentOccupants?.length || 0} people</p>
                    </div>
                  </div>

                  {selectedLocation.activities && selectedLocation.activities.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 mb-2">Available Activities</h4>
                      <div className="space-y-2">
                        {selectedLocation.activities.map((activity, index) => (
                          <div key={index} className="bg-blue-50 rounded-lg p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-blue-800">{activity.name}</p>
                                <p className="text-sm text-blue-600">{activity.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-blue-600">+{activity.xpReward} XP</p>
                                <p className="text-xs text-blue-500">{activity.duration} min</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    {currentLocation !== selectedLocation.id ? (
                      <button
                        onClick={() => {
                          joinLocation(selectedLocation.id);
                          setSelectedLocation(null);
                        }}
                        className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Join Location
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          leaveLocation();
                          setSelectedLocation(null);
                        }}
                        className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Leave Location
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VirtualCampus;
