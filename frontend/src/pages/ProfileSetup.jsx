import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Settings, Target, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import PersonalInfoForm from '../components/PersonalInfoForm';
import api from '../utils/axios';

const ProfileSetup = () => {
  const navigate = useNavigate();
  const [showSkillsSetup, setShowSkillsSetup] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        navigate('/login');
        return;
      }

      const response = await api.get(`/profile/complete?userId=${userId}`);
      
      if (response.data.success) {
        setProfileData(response.data.data);
        
        // If profile is very incomplete, show the skills setup
        if (response.data.data.profileCompletion.percentage < 20) {
          setShowSkillsSetup(true);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsSetupComplete = () => {
    setShowSkillsSetup(false);
    fetchProfileData(); // Refresh profile data
    toast.success('Skills setup completed successfully!');
  };

  const handleSkillsSetupSkip = () => {
    setShowSkillsSetup(false);
  };

  const SkillsSetupForm = () => {
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [saving, setSaving] = useState(false);

    const availableSkills = [
      { id: 'mathematics', name: 'Mathematics', icon: '📊' },
      { id: 'science', name: 'Science', icon: '🔬' },
      { id: 'english', name: 'English', icon: '📚' },
      { id: 'history', name: 'History', icon: '🏛️' },
      { id: 'art', name: 'Art', icon: '🎨' },
      { id: 'music', name: 'Music', icon: '🎵' },
      { id: 'coding', name: 'Coding', icon: '💻' },
      { id: 'physics', name: 'Physics', icon: '⚛️' },
      { id: 'chemistry', name: 'Chemistry', icon: '🧪' },
      { id: 'biology', name: 'Biology', icon: '🧬' }
    ];

    const toggleSkill = (skillId) => {
      setSelectedSkills(prev => 
        prev.includes(skillId) 
          ? prev.filter(id => id !== skillId)
          : [...prev, skillId]
      );
    };

    const handleSave = async () => {
      setSaving(true);
      try {
        const userId = localStorage.getItem('userId');
        const response = await api.put('/profile/preferences', {
          userId,
          skills: selectedSkills
        });

        if (response.data.success) {
          toast.success('Skills updated successfully!');
          handleSkillsSetupComplete();
        }
      } catch (error) {
        console.error('Error updating skills:', error);
        toast.error('Failed to update skills');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Select Your Learning Interests</h3>
          <p className="text-slate-300 mb-6">Choose the subjects you want to focus on for personalized learning experiences.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {availableSkills.map(skill => (
              <motion.button
                key={skill.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleSkill(skill.id)}
                className={`p-4 rounded-xl border transition-all duration-200 text-center ${
                  selectedSkills.includes(skill.id)
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
              >
                <div className="text-2xl mb-2">{skill.icon}</div>
                <span className={`text-sm font-medium ${
                  selectedSkills.includes(skill.id) ? 'text-purple-300' : 'text-white'
                }`}>
                  {skill.name}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={handleSkillsSetupSkip}
            className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleSave}
            disabled={saving || selectedSkills.length === 0}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all font-medium"
          >
            {saving ? 'Saving...' : `Save ${selectedSkills.length} Skills`}
          </button>
        </div>
      </div>
    );
  };

  const PreferencesForm = () => {
    const [preferences, setPreferences] = useState({
      studyTimePreference: 'flexible',
      reminderFrequency: 'daily',
      preferredSessionDuration: 45,
      difficultyPreference: 'adaptive',
      studyEnvironment: 'quiet',
      weeklyStudyHours: 10,
      notificationSettings: {
        email: true,
        push: true,
        sms: false
      },
      ...profileData?.user?.preferences
    });
    const [saving, setSaving] = useState(false);

    const studyTimes = [
      { value: 'early_morning', label: 'Early Morning (6-8 AM)' },
      { value: 'morning', label: 'Morning (8-12 PM)' },
      { value: 'afternoon', label: 'Afternoon (12-5 PM)' },
      { value: 'evening', label: 'Evening (5-8 PM)' },
      { value: 'night', label: 'Night (8-11 PM)' },
      { value: 'flexible', label: 'Flexible' }
    ];

    const reminderOptions = [
      { value: 'none', label: 'No Reminders' },
      { value: 'daily', label: 'Daily Reminders' },
      { value: 'weekly', label: 'Weekly Summary' },
      { value: 'before_sessions', label: 'Before Study Sessions' }
    ];

    const environments = [
      { value: 'quiet', label: 'Complete Silence' },
      { value: 'background_music', label: 'Background Music' },
      { value: 'nature_sounds', label: 'Nature Sounds' },
      { value: 'white_noise', label: 'White Noise' }
    ];

    const handleSave = async () => {
      setSaving(true);
      try {
        const userId = localStorage.getItem('userId');
        const response = await api.put('/profile/preferences', {
          userId,
          ...preferences
        });

        if (response.data.success) {
          toast.success('Preferences updated successfully!');
          fetchProfileData(); // Refresh profile data
        }
      } catch (error) {
        console.error('Error updating preferences:', error);
        toast.error('Failed to update preferences');
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Study Time Preference</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {studyTimes.map(time => (
              <motion.button
                key={time.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={() => setPreferences(prev => ({ ...prev, studyTimePreference: time.value }))}
                className={`p-4 rounded-xl border transition-all duration-200 text-left ${
                  preferences.studyTimePreference === time.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
              >
                <span className={`font-medium ${
                  preferences.studyTimePreference === time.value ? 'text-purple-300' : 'text-white'
                }`}>
                  {time.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Study Session Duration</h3>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">15 min</span>
            <input
              type="range"
              min="15"
              max="180"
              step="15"
              value={preferences.preferredSessionDuration}
              onChange={(e) => setPreferences(prev => ({ ...prev, preferredSessionDuration: parseInt(e.target.value) }))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((preferences.preferredSessionDuration - 15) / (180 - 15)) * 100}%, #374151 ${((preferences.preferredSessionDuration - 15) / (180 - 15)) * 100}%, #374151 100%)`
              }}
            />
            <span className="text-slate-300">3 hours</span>
          </div>
          <p className="text-center text-purple-400 mt-2 font-medium">
            {preferences.preferredSessionDuration} minutes
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Study Hours</h3>
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">1 hour</span>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={preferences.weeklyStudyHours}
              onChange={(e) => setPreferences(prev => ({ ...prev, weeklyStudyHours: parseInt(e.target.value) }))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((preferences.weeklyStudyHours - 1) / (50 - 1)) * 100}%, #374151 ${((preferences.weeklyStudyHours - 1) / (50 - 1)) * 100}%, #374151 100%)`
              }}
            />
            <span className="text-slate-300">50 hours</span>
          </div>
          <p className="text-center text-purple-400 mt-2 font-medium">
            {preferences.weeklyStudyHours} hours per week
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Study Environment</h3>
          <div className="grid grid-cols-2 gap-3">
            {environments.map(env => (
              <motion.button
                key={env.value}
                type="button"
                whileHover={{ scale: 1.02 }}
                onClick={() => setPreferences(prev => ({ ...prev, studyEnvironment: env.value }))}
                className={`p-3 rounded-xl border transition-all duration-200 text-center ${
                  preferences.studyEnvironment === env.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
              >
                <span className={`text-sm ${
                  preferences.studyEnvironment === env.value ? 'text-purple-300' : 'text-white'
                }`}>
                  {env.label}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Reminder Preferences</h3>
          <div className="space-y-2">
            {reminderOptions.map(option => (
              <motion.button
                key={option.value}
                type="button"
                whileHover={{ scale: 1.01 }}
                onClick={() => setPreferences(prev => ({ ...prev, reminderFrequency: option.value }))}
                className={`w-full p-3 rounded-xl border transition-all duration-200 text-left ${
                  preferences.reminderFrequency === option.value
                    ? 'border-purple-500 bg-purple-500/20'
                    : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    preferences.reminderFrequency === option.value ? 'text-purple-300' : 'text-white'
                  }`}>
                    {option.label}
                  </span>
                  {preferences.reminderFrequency === option.value && (
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Notification Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notificationSettings.email}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notificationSettings: {
                    ...prev.notificationSettings,
                    email: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <span className="ml-3 text-white">Email notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={preferences.notificationSettings.push}
                onChange={(e) => setPreferences(prev => ({
                  ...prev,
                  notificationSettings: {
                    ...prev.notificationSettings,
                    push: e.target.checked
                  }
                }))}
                className="w-4 h-4 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500"
              />
              <span className="ml-3 text-white">Push notifications</span>
            </label>
          </div>
        </div>

        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition-all font-medium"
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            'Save Preferences'
          )}
        </motion.button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Show Skills Setup if needed */}
      {showSkillsSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <SkillsSetupForm />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4"
          >
            Profile Setup
          </motion.h1>
          <p className="text-slate-300 text-lg">
            Personalize your learning experience for better recommendations
          </p>
        </div>

        {/* Profile Completion Status */}
        {profileData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Profile Completion</h2>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-purple-400">
                  {profileData.profileCompletion.percentage}%
                </span>
                <button
                  onClick={() => setShowSkillsSetup(true)}
                  className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                  title="Setup skills"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profileData.profileCompletion.percentage}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                profileData.profileCompletion.personalInfo 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-slate-700/30 border border-slate-600'
              }`}>
                {profileData.profileCompletion.personalInfo ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <User className="w-5 h-5 text-slate-400" />
                )}
                <span className={profileData.profileCompletion.personalInfo ? 'text-green-300' : 'text-slate-300'}>
                  Personal Info
                </span>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                profileData.profileCompletion.preferences 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-slate-700/30 border border-slate-600'
              }`}>
                {profileData.profileCompletion.preferences ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Settings className="w-5 h-5 text-slate-400" />
                )}
                <span className={profileData.profileCompletion.preferences ? 'text-green-300' : 'text-slate-300'}>
                  Preferences
                </span>
              </div>

              <div className={`flex items-center space-x-3 p-3 rounded-lg ${
                profileData.profileCompletion.avatar 
                  ? 'bg-green-500/20 border border-green-500/30' 
                  : 'bg-slate-700/30 border border-slate-600'
              }`}>
                {profileData.profileCompletion.avatar ? (
                  <Check className="w-5 h-5 text-green-400" />
                ) : (
                  <Target className="w-5 h-5 text-slate-400" />
                )}
                <span className={profileData.profileCompletion.avatar ? 'text-green-300' : 'text-slate-300'}>
                  Avatar
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-8">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'personal'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Personal Information
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`px-6 py-3 rounded-xl font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Study Preferences
          </button>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50"
        >
          {activeTab === 'personal' ? (
            <PersonalInfoForm
              initialData={profileData?.user?.personalInfo}
              onSave={() => fetchProfileData()}
            />
          ) : (
            <PreferencesForm />
          )}
        </motion.div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <motion.button
            onClick={() => navigate('/dashboard')}
            whileHover={{ scale: 1.05 }}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetup;


