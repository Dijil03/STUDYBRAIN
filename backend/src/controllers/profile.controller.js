import User from '../models/auth.model.js';

// Get complete user profile
const getCompleteProfile = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId).select('-password -googleAccessToken -googleRefreshToken');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Calculate profile completion percentage
        const completionData = calculateProfileCompletion(user);

        // Update profile completion in database if it's different
        if (user.profileCompletion.percentage !== completionData.percentage) {
            user.profileCompletion = completionData;
            await user.save();
        }

        res.json({
            success: true,
            data: {
                user,
                profileCompletion: completionData
            }
        });

    } catch (error) {
        console.error('Error fetching complete profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

// Update personal information
const updatePersonalInfo = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId;
        const {
            primarySchool,
            grade,
            hobbies,
            favoriteSubjects,
            learningStyle,
            studyGoals,
            timezone,
            dateOfBirth,
            parentEmail
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Validate input data
        const validationErrors = validatePersonalInfo(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: validationErrors
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update personal information
        user.personalInfo = {
            ...user.personalInfo,
            primarySchool: primarySchool || user.personalInfo.primarySchool,
            grade: grade || user.personalInfo.grade,
            hobbies: hobbies || user.personalInfo.hobbies,
            favoriteSubjects: favoriteSubjects || user.personalInfo.favoriteSubjects,
            learningStyle: learningStyle || user.personalInfo.learningStyle,
            studyGoals: studyGoals || user.personalInfo.studyGoals,
            timezone: timezone || user.personalInfo.timezone,
            dateOfBirth: dateOfBirth || user.personalInfo.dateOfBirth,
            parentEmail: parentEmail || user.personalInfo.parentEmail
        };

        // Update profile completion
        const completionData = calculateProfileCompletion(user);
        user.profileCompletion = completionData;

        await user.save();

        res.json({
            success: true,
            message: 'Personal information updated successfully',
            data: {
                personalInfo: user.personalInfo,
                profileCompletion: completionData
            }
        });

    } catch (error) {
        console.error('Error updating personal info:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update personal information',
            error: error.message
        });
    }
};

// Update user preferences
const updatePreferences = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId;
        const {
            studyTimePreference,
            reminderFrequency,
            preferredSessionDuration,
            difficultyPreference,
            studyEnvironment,
            notificationSettings,
            weeklyStudyHours
        } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        // Validate preferences
        const validationErrors = validatePreferences(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: validationErrors
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update preferences
        user.preferences = {
            ...user.preferences,
            studyTimePreference: studyTimePreference || user.preferences.studyTimePreference,
            reminderFrequency: reminderFrequency || user.preferences.reminderFrequency,
            preferredSessionDuration: preferredSessionDuration || user.preferences.preferredSessionDuration,
            difficultyPreference: difficultyPreference || user.preferences.difficultyPreference,
            studyEnvironment: studyEnvironment || user.preferences.studyEnvironment,
            notificationSettings: notificationSettings || user.preferences.notificationSettings,
            weeklyStudyHours: weeklyStudyHours || user.preferences.weeklyStudyHours
        };

        // Update profile completion
        const completionData = calculateProfileCompletion(user);
        user.profileCompletion = completionData;

        await user.save();

        res.json({
            success: true,
            message: 'Preferences updated successfully',
            data: {
                preferences: user.preferences,
                profileCompletion: completionData
            }
        });

    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: error.message
        });
    }
};

// Add or update study goal
const updateStudyGoal = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId;
        const { goal, targetDate, priority, goalId } = req.body;

        if (!userId || !goal) {
            return res.status(400).json({
                success: false,
                message: 'User ID and goal are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (goalId) {
            // Update existing goal
            const goalIndex = user.personalInfo.studyGoals.findIndex(g => g._id.toString() === goalId);
            if (goalIndex !== -1) {
                user.personalInfo.studyGoals[goalIndex] = {
                    ...user.personalInfo.studyGoals[goalIndex],
                    goal,
                    targetDate: targetDate || user.personalInfo.studyGoals[goalIndex].targetDate,
                    priority: priority || user.personalInfo.studyGoals[goalIndex].priority
                };
            }
        } else {
            // Add new goal
            user.personalInfo.studyGoals.push({
                goal,
                targetDate: targetDate || null,
                priority: priority || 'medium',
                completed: false
            });
        }

        await user.save();

        res.json({
            success: true,
            message: goalId ? 'Study goal updated successfully' : 'Study goal added successfully',
            data: {
                studyGoals: user.personalInfo.studyGoals
            }
        });

    } catch (error) {
        console.error('Error updating study goal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update study goal',
            error: error.message
        });
    }
};

// Complete study goal
const completeStudyGoal = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId;
        const { goalId } = req.params;

        if (!userId || !goalId) {
            return res.status(400).json({
                success: false,
                message: 'User ID and goal ID are required'
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const goalIndex = user.personalInfo.studyGoals.findIndex(g => g._id.toString() === goalId);
        if (goalIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Study goal not found'
            });
        }

        user.personalInfo.studyGoals[goalIndex].completed = true;
        await user.save();

        res.json({
            success: true,
            message: 'Study goal completed successfully',
            data: {
                studyGoals: user.personalInfo.studyGoals
            }
        });

    } catch (error) {
        console.error('Error completing study goal:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to complete study goal',
            error: error.message
        });
    }
};

// Get personalized recommendations based on profile
const getPersonalizedRecommendations = async (req, res) => {
    try {
        const userId = req.params.userId || req.body.userId || req.query.userId;

        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }

        const user = await User.findById(userId).select('personalInfo preferences profileCompletion');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const recommendations = generatePersonalizedRecommendations(user);

        res.json({
            success: true,
            data: recommendations
        });

    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate recommendations',
            error: error.message
        });
    }
};

// Helper function to calculate profile completion
function calculateProfileCompletion(user) {
    let personalInfoComplete = false;
    let preferencesComplete = false;
    let avatarComplete = false;

    // Check personal info completion
    const personalInfo = user.personalInfo;
    if (personalInfo.primarySchool || personalInfo.grade ||
        (personalInfo.hobbies && personalInfo.hobbies.length > 0) ||
        (personalInfo.favoriteSubjects && personalInfo.favoriteSubjects.length > 0)) {
        personalInfoComplete = true;
    }

    // Check preferences completion
    const prefs = user.preferences;
    if (prefs.studyTimePreference && 
        prefs.preferredSessionDuration && 
        prefs.weeklyStudyHours) {
        preferencesComplete = true;
    }

    // Check avatar completion
    if (user.profilePicture || user.avatar) {
        avatarComplete = true;
    }

    // Calculate percentage
    let completedSections = 0;
    const totalSections = 3;

    if (personalInfoComplete) completedSections++;
    if (preferencesComplete) completedSections++;
    if (avatarComplete) completedSections++;

    const percentage = Math.round((completedSections / totalSections) * 100);

    return {
        personalInfo: personalInfoComplete,
        preferences: preferencesComplete,
        avatar: avatarComplete,
        percentage
    };
}

// Helper function to validate personal information
function validatePersonalInfo(data) {
    const errors = [];

    if (data.hobbies && data.hobbies.length > 10) {
        errors.push('Maximum 10 hobbies allowed');
    }

    if (data.favoriteSubjects && data.favoriteSubjects.length > 5) {
        errors.push('Maximum 5 favorite subjects allowed');
    }

    if (data.studyGoals && data.studyGoals.length > 20) {
        errors.push('Maximum 20 study goals allowed');
    }

    if (data.parentEmail && !/^\S+@\S+\.\S+$/.test(data.parentEmail)) {
        errors.push('Invalid parent email format');
    }

    return errors;
}

// Helper function to validate preferences
function validatePreferences(data) {
    const errors = [];

    if (data.preferredSessionDuration && (data.preferredSessionDuration < 15 || data.preferredSessionDuration > 180)) {
        errors.push('Session duration must be between 15 and 180 minutes');
    }

    if (data.weeklyStudyHours && (data.weeklyStudyHours < 1 || data.weeklyStudyHours > 50)) {
        errors.push('Weekly study hours must be between 1 and 50');
    }

    return errors;
}

// Helper function to generate personalized recommendations
function generatePersonalizedRecommendations(user) {
    const recommendations = {
        studySchedule: [],
        subjects: [],
        studyGroups: [],
        profileImprovement: []
    };

    const { personalInfo, preferences, profileCompletion } = user;

    // Profile improvement recommendations
    if (profileCompletion.percentage < 100) {
        if (!profileCompletion.personalInfo) {
            recommendations.profileImprovement.push({
                type: 'personal_info',
                title: 'Complete Your Profile',
                message: 'Add your school, grade, and hobbies to get better personalized recommendations',
                action: 'complete_profile'
            });
        }

        if (!profileCompletion.preferences) {
            recommendations.profileImprovement.push({
                type: 'preferences',
                title: 'Set Your Study Preferences',
                message: 'Tell us when you prefer to study and for how long to optimize your schedule',
                action: 'set_preferences'
            });
        }
    }

    // Study schedule recommendations based on preferences
    if (preferences.studyTimePreference && preferences.studyTimePreference !== 'flexible') {
        recommendations.studySchedule.push({
            type: 'optimal_time',
            title: `${preferences.studyTimePreference.replace('_', ' ').toUpperCase()} Study Sessions`,
            message: `Based on your preference, we recommend scheduling study sessions during ${preferences.studyTimePreference.replace('_', ' ')} hours`,
            suggestedTimes: getOptimalStudyTimes(preferences.studyTimePreference)
        });
    }

    // Subject recommendations based on favorites and grade
    if (personalInfo.favoriteSubjects && personalInfo.favoriteSubjects.length > 0) {
        recommendations.subjects = personalInfo.favoriteSubjects.map(subject => ({
            subject,
            recommendation: `Focus more time on ${subject} as it's one of your favorite subjects`,
            suggestedWeeklyHours: Math.ceil(preferences.weeklyStudyHours / personalInfo.favoriteSubjects.length)
        }));
    }

    // Study group recommendations based on interests and grade
    if (personalInfo.hobbies && personalInfo.hobbies.length > 0) {
        recommendations.studyGroups.push({
            type: 'hobby_based',
            title: 'Study Groups Based on Your Interests',
            message: 'Join study groups that align with your hobbies and interests',
            suggestedTags: personalInfo.hobbies.slice(0, 3)
        });
    }

    return recommendations;
}

// Helper function to get optimal study times
function getOptimalStudyTimes(preference) {
    const timeSlots = {
        early_morning: ['06:00', '07:00', '08:00'],
        morning: ['08:00', '09:00', '10:00', '11:00'],
        afternoon: ['13:00', '14:00', '15:00', '16:00'],
        evening: ['17:00', '18:00', '19:00', '20:00'],
        night: ['20:00', '21:00', '22:00']
    };

    return timeSlots[preference] || timeSlots.morning;
}

export {
    getCompleteProfile,
    updatePersonalInfo,
    updatePreferences,
    updateStudyGoal,
    completeStudyGoal,
    getPersonalizedRecommendations
};
