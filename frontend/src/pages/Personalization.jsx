import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import PageSEO from '../components/PageSEO';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/axios';
import { saveUserSession } from '../utils/session';
import {
  Brain,
  Target,
  Clock,
  Bell,
  CheckCircle,
  Sparkles,
  Calendar,
  Zap,
  BookOpen,
} from 'lucide-react';

const focusAreaOptions = [
  'Mathematics',
  'Science',
  'Languages',
  'History',
  'Computer Science',
  'Exam Prep',
  'Assignments',
  'Creative Projects',
];

const studyGoalOptions = [
  'Boost grades',
  'Stay consistent',
  'Ace upcoming exams',
  'Complete assignments on time',
  'Build long-term knowledge',
  'Improve focus habits',
];

const focusStyles = [
  { id: 'deep-work', label: 'Deep Work', description: 'Long, intense focus blocks with minimal distractions' },
  { id: 'balanced', label: 'Balanced', description: 'Mix of focused sessions and short breaks' },
  { id: 'sprint', label: 'Quick Sprints', description: 'Short, high-energy sessions to maintain momentum' },
];

const motivationStyles = [
  { id: 'streaks', label: 'Streaks & Progress', icon: Sparkles },
  { id: 'rewards', label: 'Rewards & Unlocks', icon: CheckCircle },
  { id: 'data', label: 'Data & Analytics', icon: Brain },
  { id: 'accountability', label: 'Accountability', icon: Target },
];

const productivityProfiles = [
  { id: 'steady', label: 'Steady', description: 'Consistent daily progress with reliable routines' },
  { id: 'bursts', label: 'Energy Bursts', description: 'Short bursts of intense productivity' },
  { id: 'adaptive', label: 'Adaptive', description: 'Flexible schedule that adjusts day-to-day' },
];

const initialFormState = () => ({
  studyGoal: '',
  focusAreas: [],
  preferredStudyTimes: {
    morning: false,
    afternoon: false,
    evening: false,
  },
  focusStyle: 'balanced',
  motivationStyle: 'streaks',
  preferredSessionLength: 45,
  weeklyTargetHours: 10,
  notifications: {
    studyReminders: true,
    focusTimer: true,
    progressReports: true,
    accountabilityBuddy: false,
  },
  productivityProfile: 'steady',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
});

const Personalization = () => {
  const navigate = useNavigate();
  const userId = useMemo(() => localStorage.getItem('userId'), []);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [hasExistingPreferences, setHasExistingPreferences] = useState(false);

  const normalizePersonalization = useCallback((personalization = {}) => {
    const defaultState = initialFormState();
    return {
      ...defaultState,
      ...personalization,
      focusAreas: Array.isArray(personalization.focusAreas)
        ? personalization.focusAreas
        : defaultState.focusAreas,
      preferredStudyTimes: {
        ...defaultState.preferredStudyTimes,
        ...(personalization.preferredStudyTimes || {}),
      },
      notifications: {
        ...defaultState.notifications,
        ...(personalization.notifications || {}),
      },
      preferredSessionLength:
        personalization.preferredSessionLength || defaultState.preferredSessionLength,
      weeklyTargetHours:
        personalization.weeklyTargetHours || defaultState.weeklyTargetHours,
      focusStyle: personalization.focusStyle || defaultState.focusStyle,
      motivationStyle: personalization.motivationStyle || defaultState.motivationStyle,
      productivityProfile:
        personalization.productivityProfile || defaultState.productivityProfile,
      timezone: personalization.timezone || defaultState.timezone,
    };
  }, []);

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }

    const fetchPersonalization = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/personalization/${userId}`);
        if (response.data?.success) {
          const normalized = normalizePersonalization(response.data.personalization);
          setFormData(normalized);
          setHasExistingPreferences(response.data.hasCompletedPersonalization);
        }
      } catch (error) {
        console.error('Failed to load personalization data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalization();
  }, [navigate, normalizePersonalization, userId]);

  const updateFocusAreas = (area) => {
    setFormData((prev) => {
      const alreadySelected = prev.focusAreas.includes(area);
      return {
        ...prev,
        focusAreas: alreadySelected
          ? prev.focusAreas.filter((item) => item !== area)
          : [...prev.focusAreas, area],
      };
    });
  };

  const updatePreferredTime = (timeKey) => {
    setFormData((prev) => ({
      ...prev,
      preferredStudyTimes: {
        ...prev.preferredStudyTimes,
        [timeKey]: !prev.preferredStudyTimes[timeKey],
      },
    }));
  };

  const updateNotifications = (setting) => {
    setFormData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting],
      },
    }));
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (event) => {
    const { name, value } = event.target;
    const parsed = parseInt(value, 10);
    setFormData((prev) => ({
      ...prev,
      [name]: Number.isNaN(parsed) ? prev[name] : parsed,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) return;

    try {
      setSaving(true);
      const response = await api.put(`/auth/personalization/${userId}`, {
        ...formData,
        hasCompletedPersonalization: true,
      });

      if (response.data?.success) {
        saveUserSession({
          id: userId,
          hasCompletedPersonalization: true,
          personalization: response.data.personalization,
          username: localStorage.getItem('username'),
          email: localStorage.getItem('userEmail'),
          profilePicture: localStorage.getItem('userAvatar'),
        });
        toast.success('Your study experience is now personalized!');
        navigate('/dashboard');
      } else {
        toast.error(response.data?.message || 'Failed to save personalization.');
      }
    } catch (error) {
      console.error('Error saving personalization:', error);
      toast.error('Could not save personalization preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const response = await api.put(`/auth/personalization/${userId}`, {
        ...formData,
        hasCompletedPersonalization: true,
      });
      if (response.data?.success) {
        saveUserSession({
          id: userId,
          hasCompletedPersonalization: true,
          personalization: response.data.personalization,
          username: localStorage.getItem('username'),
          email: localStorage.getItem('userEmail'),
          profilePicture: localStorage.getItem('userAvatar'),
        });
      }
    } catch (error) {
      console.error('Skip personalization failed:', error);
    } finally {
      setSaving(false);
      navigate('/dashboard');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <PageSEO
        page="personalization"
        title="Tailor Your Study Experience"
        description="Customize StudyBrain to fit your goals, subjects, and preferred study styles."
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />

        <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Personalized onboarding
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Let's build your optimal study system
            </h1>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Choose your focus areas, availability, and motivation style so we can tailor
              revision plans, focus garden growth, and smart notifications to you.
            </p>
            {hasExistingPreferences && (
              <p className="text-sm text-slate-400 mt-3">
                You can update these preferences anytime to keep StudyBrain aligned with your goals.
              </p>
            )}
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-emerald-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">What brings you here?</h2>
                  <p className="text-slate-300">
                    Select the primary goals you're focused on right now.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {studyGoalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        studyGoal: prev.studyGoal === goal ? '' : goal,
                      }))
                    }
                    className={`p-4 rounded-2xl border transition-all text-left ${
                      formData.studyGoal === goal
                        ? 'border-emerald-400 bg-emerald-500/20 text-white shadow-lg shadow-emerald-500/20'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:border-emerald-400/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{goal}</span>
                      {formData.studyGoal === goal && <CheckCircle className="w-5 h-5 text-emerald-300" />}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8 text-cyan-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Focus areas</h2>
                  <p className="text-slate-300">
                    Choose the subjects or work types where you want StudyBrain to help the most.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {focusAreaOptions.map((area) => {
                  const active = formData.focusAreas.includes(area);
                  return (
                    <button
                      type="button"
                      key={area}
                      onClick={() => updateFocusAreas(area)}
                      className={`px-4 py-3 rounded-2xl border text-sm font-medium transition-all ${
                        active
                          ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-lg shadow-cyan-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/60'
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-8 h-8 text-orange-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">When do you prefer to study?</h2>
                  <p className="text-slate-300">
                    We'll use this to schedule revision sessions and focus garden growth.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { key: 'morning', label: 'Morning Boost', description: 'Start the day energized' },
                  { key: 'afternoon', label: 'Afternoon Flow', description: 'Stay productive post-lunch' },
                  { key: 'evening', label: 'Evening Focus', description: 'Quiet, uninterrupted sessions' },
                ].map(({ key, label, description }) => {
                  const active = formData.preferredStudyTimes[key];
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => updatePreferredTime(key)}
                      className={`p-5 rounded-2xl border transition-all text-left ${
                        active
                          ? 'border-orange-400 bg-orange-500/20 text-white shadow-lg shadow-orange-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-orange-300/60'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-1">{label}</h3>
                      <p className="text-sm text-slate-300">{description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Preferred session length (minutes)
                  </label>
                  <input
                    type="number"
                    name="preferredSessionLength"
                    min={20}
                    max={120}
                    step={5}
                    value={formData.preferredSessionLength}
                    onChange={handleNumberChange}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Target study hours per week
                  </label>
                  <input
                    type="number"
                    name="weeklyTargetHours"
                    min={3}
                    max={60}
                    value={formData.weeklyTargetHours}
                    onChange={handleNumberChange}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-8 h-8 text-purple-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Focus & motivation style</h2>
                  <p className="text-slate-300">
                    Personalize how we motivate you and keep your focus sessions engaging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {focusStyles.map(({ id, label, description }) => {
                  const active = formData.focusStyle === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          focusStyle: id,
                        }))
                      }
                      className={`p-5 rounded-2xl border transition-all text-left ${
                        active
                          ? 'border-purple-400 bg-purple-500/20 text-white shadow-lg shadow-purple-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-purple-300/60'
                      }`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{label}</h3>
                      <p className="text-sm text-slate-300">{description}</p>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motivationStyles.map(({ id, label, icon: Icon }) => {
                  const active = formData.motivationStyle === id;
                  return (
                    <button
                      type="button"
                      key={id}
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          motivationStyle: id,
                        }))
                      }
                      className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                        active
                          ? 'border-indigo-400 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-indigo-300/60'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <label className="block text-sm text-slate-300 mb-2">
                  Productivity profile
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {productivityProfiles.map(({ id, label, description }) => {
                    const active = formData.productivityProfile === id;
                    return (
                      <button
                        type="button"
                        key={id}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            productivityProfile: id,
                          }))
                        }
                        className={`p-5 rounded-2xl border transition-all text-left ${
                          active
                            ? 'border-blue-400 bg-blue-500/20 text-white shadow-lg shadow-blue-500/20'
                            : 'border-white/10 bg-white/5 text-slate-200 hover:border-blue-300/60'
                        }`}
                      >
                        <h3 className="text-lg font-semibold mb-2">{label}</h3>
                        <p className="text-sm text-slate-300">{description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-8 h-8 text-green-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Smart notifications</h2>
                  <p className="text-slate-300">
                    Choose the support you want from StudyBrain. You can adjust any time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'studyReminders', title: 'Study reminders', description: 'Stay on track with friendly nudges before focus blocks.' },
                  { key: 'focusTimer', title: 'Focus timer boosts', description: 'Get notified when your plants are ready to grow with a session.' },
                  { key: 'progressReports', title: 'Progress summaries', description: 'Weekly insight digest across revisions, focus time, and streaks.' },
                  { key: 'accountabilityBuddy', title: 'Accountability partner', description: 'Pair up with other learners or receive AI nudges.' },
                ].map(({ key, title, description }) => {
                  const active = formData.notifications[key];
                  return (
                    <button
                      type="button"
                      key={key}
                      onClick={() => updateNotifications(key)}
                      className={`p-5 rounded-2xl border transition-all text-left ${
                        active
                          ? 'border-green-400 bg-green-500/20 text-white shadow-lg shadow-green-500/20'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-green-300/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                        {active && <CheckCircle className="w-5 h-5 text-green-300" />}
                      </div>
                      <p className="text-sm text-slate-300">{description}</p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="w-8 h-8 text-pink-300" />
                <div>
                  <h2 className="text-2xl font-semibold text-white">Final touches</h2>
                  <p className="text-slate-300">
                    Confirm your timezone so calendar sync, revision schedules, and focus garden align perfectly.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">
                    Timezone
                  </label>
                  <input
                    type="text"
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-400"
                    placeholder="e.g., America/New_York"
                  />
                </div>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
                  <Zap className="w-5 h-5 text-pink-300 mr-3" />
                  <p className="text-slate-200 text-sm">
                    Personalization powers the Smart Revision Scheduler, Concept Mastery Map, and Focus Garden to reflect your goals.
                  </p>
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                className="px-6 py-3 rounded-xl border border-white/20 text-slate-200 hover:border-white/40 transition-all"
              >
                {hasExistingPreferences ? 'Cancel' : 'Skip for now'}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25 hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    Save preferences
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Personalization;

