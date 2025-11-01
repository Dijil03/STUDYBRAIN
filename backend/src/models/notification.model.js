import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// Notification Schema
const notificationSchema = new Schema({
  // Recipient of the notification
  recipientId: {
    type: String,
    required: true,
    index: true
  },
  recipientName: {
    type: String,
    required: true
  },

  // Sender of the notification
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },

  // Notification type and content
  type: {
    type: String,
    required: true,
    enum: [
      'study_group_invitation',
      'study_group_join_request',
      'study_group_accepted',
      'study_group_rejected',
      'assessment_completed',
      'certificate_earned',
      'schedule_reminder',
      'study_session_reminder',
      'goal_reminder',
      'weekly_progress',
      'profile_incomplete',
      'general'
    ]
  },

  // Main notification content
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },

  // Status and interaction
  status: {
    type: String,
    enum: ['pending', 'read', 'accepted', 'declined', 'expired'],
    default: 'pending'
  },

  // For actionable notifications (invitations, requests)
  actionRequired: {
    type: Boolean,
    default: false
  },

  // Related data for context
  relatedId: {
    type: String, // Could be groupId, assessmentId, etc.
    default: null
  },
  relatedType: {
    type: String, // 'study_group', 'assessment', etc.
    enum: ['study_group', 'assessment', 'certificate', 'general'],
    default: 'general'
  },

  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Expiry for time-sensitive notifications
  expiresAt: {
    type: Date,
    default: null
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for better performance
notificationSchema.index({ recipientId: 1, createdAt: -1 });
notificationSchema.index({ senderId: 1, createdAt: -1 });
notificationSchema.index({ type: 1, status: 1 });
notificationSchema.index({ relatedId: 1, relatedType: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Virtual for checking if notification is expired
notificationSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Method to mark as read
notificationSchema.methods.markAsRead = function () {
  this.status = 'read';
  return this.save();
};

// Method to accept invitation/request
notificationSchema.methods.accept = function () {
  this.status = 'accepted';
  return this.save();
};

// Method to decline invitation/request
notificationSchema.methods.decline = function () {
  this.status = 'declined';
  return this.save();
};

// Static method to create study group invitation
notificationSchema.statics.createStudyGroupInvitation = function (data) {
  return this.create({
    recipientId: data.recipientId,
    recipientName: data.recipientName,
    senderId: data.senderId,
    senderName: data.senderName,
    type: 'study_group_invitation',
    title: `Study Group Invitation`,
    message: `${data.senderName} has invited you to join the study group "${data.groupName}"`,
    actionRequired: true,
    relatedId: data.groupId,
    relatedType: 'study_group',
    metadata: {
      groupName: data.groupName,
      groupDescription: data.groupDescription,
      invitationType: 'direct'
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    priority: 'medium'
  });
};

// Static method to create join request notification
notificationSchema.statics.createJoinRequest = function (data) {
  return this.create({
    recipientId: data.recipientId,
    recipientName: data.recipientName,
    senderId: data.senderId,
    senderName: data.senderName,
    type: 'study_group_join_request',
    title: `Study Group Join Request`,
    message: `${data.senderName} wants to join your study group "${data.groupName}"`,
    actionRequired: true,
    relatedId: data.groupId,
    relatedType: 'study_group',
    metadata: {
      groupName: data.groupName,
      requestType: 'join'
    },
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    priority: 'medium'
  });
};

// Static method to create study session reminder
notificationSchema.statics.createStudySessionReminder = function (data) {
  return this.create({
    recipientId: data.userId,
    recipientName: data.userName,
    senderId: 'system',
    senderName: 'StudyBrain System',
    type: 'study_session_reminder',
    title: `Study Session Reminder`,
    message: `Your ${data.subject} study session starts in ${data.minutesBefore} minutes`,
    actionRequired: false,
    relatedId: data.scheduleId,
    relatedType: 'schedule',
    metadata: {
      subject: data.subject,
      startTime: data.startTime,
      duration: data.duration,
      studyType: data.studyType,
      scheduleId: data.scheduleId,
      blockIndex: data.blockIndex,
      day: data.day
    },
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    priority: 'medium'
  });
};

// Static method to create schedule reminder
notificationSchema.statics.createScheduleReminder = function (data) {
  return this.create({
    recipientId: data.userId,
    recipientName: data.userName,
    senderId: 'system',
    senderName: 'StudyBrain System',
    type: 'schedule_reminder',
    title: `Daily Schedule Reminder`,
    message: `You have ${data.sessionCount} study sessions planned for today`,
    actionRequired: false,
    relatedId: data.scheduleId,
    relatedType: 'schedule',
    metadata: {
      sessionCount: data.sessionCount,
      totalDuration: data.totalDuration,
      subjects: data.subjects,
      scheduleId: data.scheduleId
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    priority: 'low'
  });
};

// Static method to create goal reminder
notificationSchema.statics.createGoalReminder = function (data) {
  return this.create({
    recipientId: data.userId,
    recipientName: data.userName,
    senderId: 'system',
    senderName: 'StudyBrain System',
    type: 'goal_reminder',
    title: `Study Goal Reminder`,
    message: `Your goal "${data.goalTitle}" is due ${data.daysUntilDue === 0 ? 'today' : `in ${data.daysUntilDue} days`}`,
    actionRequired: data.daysUntilDue <= 3,
    relatedId: data.goalId,
    relatedType: 'goal',
    metadata: {
      goalTitle: data.goalTitle,
      targetDate: data.targetDate,
      daysUntilDue: data.daysUntilDue,
      priority: data.priority
    },
    expiresAt: new Date(data.targetDate),
    priority: data.daysUntilDue <= 1 ? 'high' : data.daysUntilDue <= 3 ? 'medium' : 'low'
  });
};

// Static method to create weekly progress notification
notificationSchema.statics.createWeeklyProgress = function (data) {
  return this.create({
    recipientId: data.userId,
    recipientName: data.userName,
    senderId: 'system',
    senderName: 'StudyBrain System',
    type: 'weekly_progress',
    title: `Weekly Progress Report`,
    message: `This week you completed ${data.completionRate}% of your planned study sessions`,
    actionRequired: false,
    relatedId: null,
    relatedType: 'general',
    metadata: {
      completionRate: data.completionRate,
      totalHoursCompleted: data.totalHoursCompleted,
      totalHoursPlanned: data.totalHoursPlanned,
      bestSubject: data.bestSubject,
      improvementSuggestions: data.improvementSuggestions
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    priority: 'low'
  });
};

// Static method to create profile incomplete notification
notificationSchema.statics.createProfileIncompleteReminder = function (data) {
  return this.create({
    recipientId: data.userId,
    recipientName: data.userName,
    senderId: 'system',
    senderName: 'StudyBrain System',
    type: 'profile_incomplete',
    title: `Complete Your Profile`,
    message: `Your profile is ${data.completionPercentage}% complete. Complete it to get better personalized recommendations`,
    actionRequired: true,
    relatedId: null,
    relatedType: 'general',
    metadata: {
      completionPercentage: data.completionPercentage,
      missingFields: data.missingFields
    },
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    priority: 'low'
  });
};

// Static method to get user's notifications
notificationSchema.statics.getUserNotifications = function (userId, options = {}) {
  const {
    status = null,
    type = null,
    actionRequired = null,
    limit = 20,
    skip = 0,
    sortBy = 'createdAt',
    sortOrder = -1
  } = options;

  const query = { recipientId: userId };

  if (status) query.status = status;
  if (type) query.type = type;
  if (actionRequired !== null) query.actionRequired = actionRequired;

  return this.find(query)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .lean();
};

// Static method to count unread notifications
notificationSchema.statics.countUnread = function (userId) {
  return this.countDocuments({
    recipientId: userId,
    status: 'pending'
  });
};

// Static method to mark all as read
notificationSchema.statics.markAllAsRead = function (userId) {
  return this.updateMany(
    { recipientId: userId, status: 'pending' },
    { status: 'read' }
  );
};

// Pre-save middleware to handle expiry
notificationSchema.pre('save', function (next) {
  // If status is being changed to accepted/declined, remove expiry
  if (this.isModified('status') && ['accepted', 'declined'].includes(this.status)) {
    this.expiresAt = null;
  }
  next();
});

// Create and export model
const Notification = mongoose.model('Notification', notificationSchema);

export { Notification };
