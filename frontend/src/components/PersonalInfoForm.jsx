import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  School, 
  GraduationCap, 
  Heart, 
  BookOpen, 
  Globe, 
  Calendar,
  Mail,
  Plus,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/axios';

const PersonalInfoForm = ({ initialData = {}, onSave, onClose, isModal = false }) => {
  const [formData, setFormData] = useState(() => ({
    primarySchool: '',
    grade: '',
    hobbies: [],
    favoriteSubjects: [],
    learningStyle: 'mixed',
    timezone: 'UTC',
    dateOfBirth: '',
    parentEmail: '',
    ...initialData
  }));

  const [newHobby, setNewHobby] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const grades = [
    'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
    'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 
    'Grade 12', 'University', 'Graduate', 'Other'
  ];

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography', 'Physics',
    'Chemistry', 'Biology', 'Computer Science', 'Art', 'Music', 
    'Physical Education', 'Foreign Language', 'Literature', 'Economics',
    'Psychology', 'Philosophy', 'Other'
  ];

  const learningStyles = [
    { value: 'visual', label: 'Visual', description: 'Learn best through images, diagrams, and visual aids' },
    { value: 'auditory', label: 'Auditory', description: 'Learn best through listening and discussion' },
    { value: 'kinesthetic', label: 'Kinesthetic', description: 'Learn best through hands-on activities' },
    { value: 'reading', label: 'Reading/Writing', description: 'Learn best through reading and writing' },
    { value: 'mixed', label: 'Mixed', description: 'Combination of different learning styles' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const addHobby = () => {
    if (newHobby.trim() && !formData.hobbies.includes(newHobby.trim()) && formData.hobbies.length < 10) {
      setFormData(prev => ({
        ...prev,
        hobbies: [...prev.hobbies, newHobby.trim()]
      }));
      setNewHobby('');
    }
  };

  const removeHobby = (hobbyToRemove) => {
    setFormData(prev => ({
      ...prev,
      hobbies: prev.hobbies.filter(hobby => hobby !== hobbyToRemove)
    }));
  };

  const toggleSubject = (subject) => {
    setFormData(prev => ({
      ...prev,
      favoriteSubjects: prev.favoriteSubjects.includes(subject)
        ? prev.favoriteSubjects.filter(s => s !== subject)
        : [...prev.favoriteSubjects, subject].slice(0, 5) // Max 5 subjects
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.parentEmail && !/^\S+@\S+\.\S+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Please enter a valid email address';
    }

    if (formData.hobbies.length > 10) {
      newErrors.hobbies = 'Maximum 10 hobbies allowed';
    }

    if (formData.favoriteSubjects.length > 5) {
      newErrors.favoriteSubjects = 'Maximum 5 favorite subjects allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userId = localStorage.getItem('userId');
      
      const response = await api.put('/profile/personal-info', {
        userId,
        ...formData
      });

      if (response.data.success) {
        toast.success('Personal information updated successfully!');
        if (onSave) {
          onSave(response.data.data);
        }
        if (isModal && onClose) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Error updating personal info:', error);
      toast.error(error.response?.data?.message || 'Failed to update personal information');
    } finally {
      setLoading(false);
    }
  };

  const FormContent = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primary School */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <School className="w-4 h-4 inline mr-2" />
          Primary School
        </label>
        <input
          type="text"
          value={formData.primarySchool}
          onChange={(e) => handleInputChange('primarySchool', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          placeholder="Enter your school name..."
        />
      </div>

      {/* Grade */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <GraduationCap className="w-4 h-4 inline mr-2" />
          Grade Level
        </label>
        <select
          value={formData.grade}
          onChange={(e) => handleInputChange('grade', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select your grade...</option>
          {grades.map(grade => (
            <option key={grade} value={grade} className="bg-slate-800">
              {grade}
            </option>
          ))}
        </select>
      </div>

      {/* Hobbies */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Heart className="w-4 h-4 inline mr-2" />
          Hobbies & Interests
        </label>
        
        {/* Display existing hobbies */}
        {formData.hobbies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.hobbies.map((hobby, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full text-sm border border-purple-500/30"
              >
                {hobby}
                <button
                  type="button"
                  onClick={() => removeHobby(hobby)}
                  className="ml-2 text-purple-400 hover:text-purple-200 p-0.5 hover:bg-purple-500/20 rounded-full transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        )}

        {/* Add new hobby */}
        {formData.hobbies.length < 10 && (
          <div className="flex gap-2">
            <input
              type="text"
              value={newHobby}
              onChange={(e) => setNewHobby(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addHobby())}
              className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Add a hobby..."
              maxLength={50}
            />
            <button
              type="button"
              onClick={addHobby}
              disabled={!newHobby.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {errors.hobbies && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.hobbies}
          </p>
        )}
        
        <p className="text-slate-500 text-xs mt-1">
          {formData.hobbies.length}/10 hobbies
        </p>
      </div>

      {/* Favorite Subjects */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <BookOpen className="w-4 h-4 inline mr-2" />
          Favorite Subjects (Select up to 5)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {subjects.map(subject => (
            <motion.button
              key={subject}
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleSubject(subject)}
              className={`p-3 rounded-lg border transition-all duration-200 text-sm ${
                formData.favoriteSubjects.includes(subject)
                  ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                  : 'border-slate-600 bg-slate-700/30 text-slate-300 hover:border-slate-500'
              }`}
            >
              {subject}
            </motion.button>
          ))}
        </div>
        
        {errors.favoriteSubjects && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.favoriteSubjects}
          </p>
        )}
        
        <p className="text-slate-500 text-xs mt-2">
          {formData.favoriteSubjects.length}/5 subjects selected
        </p>
      </div>

      {/* Learning Style */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-3">
          <User className="w-4 h-4 inline mr-2" />
          Learning Style
        </label>
        <div className="space-y-2">
          {learningStyles.map(style => (
            <motion.button
              key={style.value}
              type="button"
              whileHover={{ scale: 1.01 }}
              onClick={() => handleInputChange('learningStyle', style.value)}
              className={`w-full p-4 rounded-xl border transition-all duration-200 text-left ${
                formData.learningStyle === style.value
                  ? 'border-purple-500 bg-purple-500/20'
                  : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    formData.learningStyle === style.value ? 'text-purple-300' : 'text-white'
                  }`}>
                    {style.label}
                  </h3>
                  <p className="text-slate-400 text-sm mt-1">{style.description}</p>
                </div>
                {formData.learningStyle === style.value && (
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Date of Birth */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Calendar className="w-4 h-4 inline mr-2" />
          Date of Birth (Optional)
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Parent Email */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Mail className="w-4 h-4 inline mr-2" />
          Parent/Guardian Email (Optional)
        </label>
        <input
          type="email"
          value={formData.parentEmail}
          onChange={(e) => handleInputChange('parentEmail', e.target.value)}
          className={`w-full px-4 py-3 bg-slate-700/50 border ${
            errors.parentEmail ? 'border-red-500' : 'border-slate-600'
          } rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          placeholder="parent@example.com"
        />
        {errors.parentEmail && (
          <p className="text-red-400 text-sm mt-1 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.parentEmail}
          </p>
        )}
      </div>

      {/* Timezone */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          <Globe className="w-4 h-4 inline mr-2" />
          Timezone
        </label>
        <select
          value={formData.timezone}
          onChange={(e) => handleInputChange('timezone', e.target.value)}
          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Denver">Mountain Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
          <option value="Europe/London">London</option>
          <option value="Europe/Paris">Paris</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>

      {/* Submit Button */}
      <div className="flex gap-3 pt-4">
        {isModal && (
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-600 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium"
          >
            Cancel
          </button>
        )}
        
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Save className="w-4 h-4 mr-2" />
              Save Personal Information
            </div>
          )}
        </motion.button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Personal Information</h2>
            <FormContent />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
      <FormContent />
    </div>
  );
};

export default PersonalInfoForm;


