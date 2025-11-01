import { Notification } from '../models/notification.model.js';
import { StudyGroup, StudyGroupMember } from '../models/studyGroup.model.js';

// Get all notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    console.log('🔍 getUserNotifications called with req:', !!req);
    console.log('🔍 Request params:', req?.params);
    console.log('🔍 Request query:', req?.query);
    console.log('🔍 Request body:', req?.body);

    if (!req) {
      console.log('❌ Request object is undefined');
      return res.status(500).json({
        success: false,
        message: 'Request object is undefined'
      });
    }

    const userId = req.params?.userId || req.body?.userId || req.query?.userId;
    const userName = req.body?.userName || req.query?.userName;
    console.log('🔍 Extracted userId:', userId);
    console.log('🔍 Extracted userName:', userName);

    if (!userId) {
      console.log('❌ No userId provided for notifications');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const {
      status,
      type,
      actionRequired,
      limit = 20,
      skip = 0,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const options = {
      status: status || null,
      type: type || null,
      actionRequired: actionRequired === 'true' ? true : actionRequired === 'false' ? false : null,
      limit: parseInt(limit),
      skip: parseInt(skip),
      sortBy,
      sortOrder: sortOrder === 'desc' ? -1 : 1
    };

    console.log('🔍 Query options:', options);
    console.log('🔍 Checking if Notification model exists:', !!Notification);
    console.log('🔍 Checking if getUserNotifications method exists:', typeof Notification.getUserNotifications);

    // Test basic query first
    console.log('🔍 Testing basic notification query...');
    const basicQuery = await Notification.find({ recipientId: userId }).limit(5);
    console.log('🔍 Basic query result:', basicQuery.length, 'notifications found');

    const notifications = await Notification.getUserNotifications(userId, options);
    console.log('🔍 getUserNotifications result:', notifications.length, 'notifications found');

    // Get count of unread notifications
    const unreadCount = await Notification.countUnread(userId);
    console.log('🔍 Unread count:', unreadCount);

    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          limit: options.limit,
          skip: options.skip,
          total: notifications.length
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications',
      error: error.message,
      stack: error.stack
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    console.log('🔍 getUnreadCount called with req:', !!req);
    console.log('🔍 Request params:', req?.params);
    console.log('🔍 Request query:', req?.query);
    console.log('🔍 Request body:', req?.body);

    if (!req) {
      console.log('❌ Request object is undefined');
      return res.status(500).json({
        success: false,
        message: 'Request object is undefined'
      });
    }

    const userId = req.params?.userId || req.body?.userId || req.query?.userId;
    console.log('🔍 Extracted userId:', userId);

    if (!userId) {
      console.log('❌ No userId provided for unread count');
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    console.log('🔍 Checking if Notification model exists:', !!Notification);
    console.log('🔍 Checking if countUnread method exists:', typeof Notification.countUnread);

    // Test basic count query first
    console.log('🔍 Testing basic unread count query...');
    const basicCount = await Notification.countDocuments({
      recipientId: userId,
      status: 'pending'
    });
    console.log('🔍 Basic count result:', basicCount);

    const unreadCount = await Notification.countUnread(userId);
    console.log('🔍 countUnread result:', unreadCount);

    res.json({
      success: true,
      data: { unreadCount }
    });

  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch unread count',
      error: error.message,
      stack: error.stack
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const result = await Notification.markAllAsRead(userId);

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      data: { modifiedCount: result.modifiedCount }
    });

  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read',
      error: error.message
    });
  }
};

// Accept invitation/request
const acceptNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;
    const userName = req.body.userName;

    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User ID and username are required'
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: userId,
      actionRequired: true,
      status: 'pending'
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already processed'
      });
    }

    // Handle different notification types
    if (notification.type === 'study_group_invitation') {
      // Join the study group
      const groupId = notification.relatedId;

      // Check if group exists and user isn't already a member
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Study group not found'
        });
      }

      const existingMember = await StudyGroupMember.findOne({
        groupId: groupId,
        userId: userId
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'You are already a member of this group'
        });
      }

      // Add user to group
      const newMember = new StudyGroupMember({
        groupId: groupId,
        userId: userId,
        userName: userName,
        role: 'member',
        isActive: true
      });

      await newMember.save();

      // Update group member count
      await StudyGroup.findByIdAndUpdate(groupId, {
        $inc: { currentMembers: 1 }
      });

      // Create acceptance notification for the inviter
      await Notification.create({
        recipientId: notification.senderId,
        recipientName: notification.senderName,
        senderId: userId,
        senderName: userName,
        type: 'study_group_accepted',
        title: 'Invitation Accepted',
        message: `${userName} has accepted your invitation to join "${notification.metadata.groupName}"`,
        actionRequired: false,
        relatedId: groupId,
        relatedType: 'study_group',
        metadata: {
          groupName: notification.metadata.groupName,
          acceptedBy: userName
        },
        priority: 'low'
      });

    } else if (notification.type === 'study_group_join_request') {
      // Accept join request - Add user to group
      const groupId = notification.relatedId;
      const requesterId = notification.senderId;
      const requesterName = notification.senderName;

      // Check if group exists
      const group = await StudyGroup.findById(groupId);
      if (!group) {
        return res.status(404).json({
          success: false,
          message: 'Study group not found'
        });
      }

      // Check if user has permission to accept (admin/moderator)
      const accepterMember = await StudyGroupMember.findOne({
        groupId: groupId,
        userId: userId,
        role: { $in: ['admin', 'moderator'] }
      });

      if (!accepterMember) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to accept this request'
        });
      }

      // Check if requester isn't already a member
      const existingMember = await StudyGroupMember.findOne({
        groupId: groupId,
        userId: requesterId
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this group'
        });
      }

      // Add requester to group
      const newMember = new StudyGroupMember({
        groupId: groupId,
        userId: requesterId,
        userName: requesterName,
        role: 'member',
        isActive: true
      });

      await newMember.save();

      // Update group member count and remove from join requests
      await StudyGroup.findByIdAndUpdate(groupId, {
        $inc: { currentMembers: 1 },
        $pull: { joinRequests: requesterId }
      });

      // Create acceptance notification for the requester
      await Notification.create({
        recipientId: requesterId,
        recipientName: requesterName,
        senderId: userId,
        senderName: userName,
        type: 'study_group_accepted',
        title: 'Join Request Accepted',
        message: `Your request to join "${notification.metadata.groupName}" has been accepted`,
        actionRequired: false,
        relatedId: groupId,
        relatedType: 'study_group',
        metadata: {
          groupName: notification.metadata.groupName,
          acceptedBy: userName
        },
        priority: 'medium'
      });
    }

    // Mark notification as accepted
    await notification.accept();

    res.json({
      success: true,
      message: 'Notification accepted successfully',
      data: notification
    });

  } catch (error) {
    console.error('Error accepting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept notification',
      error: error.message
    });
  }
};

// Decline invitation/request
const declineNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;
    const userName = req.body.userName;

    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User ID and username are required'
      });
    }

    const notification = await Notification.findOne({
      _id: notificationId,
      recipientId: userId,
      actionRequired: true,
      status: 'pending'
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or already processed'
      });
    }

    // Handle different notification types
    if (notification.type === 'study_group_invitation') {
      // Create decline notification for the inviter
      await Notification.create({
        recipientId: notification.senderId,
        recipientName: notification.senderName,
        senderId: userId,
        senderName: userName,
        type: 'study_group_rejected',
        title: 'Invitation Declined',
        message: `${userName} has declined your invitation to join "${notification.metadata.groupName}"`,
        actionRequired: false,
        relatedId: notification.relatedId,
        relatedType: 'study_group',
        metadata: {
          groupName: notification.metadata.groupName,
          declinedBy: userName
        },
        priority: 'low'
      });

    } else if (notification.type === 'study_group_join_request') {
      // Decline join request - Remove from join requests and notify requester
      const groupId = notification.relatedId;
      const requesterId = notification.senderId;
      const requesterName = notification.senderName;

      // Remove from join requests
      await StudyGroup.findByIdAndUpdate(groupId, {
        $pull: { joinRequests: requesterId }
      });

      // Create decline notification for the requester
      await Notification.create({
        recipientId: requesterId,
        recipientName: requesterName,
        senderId: userId,
        senderName: userName,
        type: 'study_group_rejected',
        title: 'Join Request Declined',
        message: `Your request to join "${notification.metadata.groupName}" has been declined`,
        actionRequired: false,
        relatedId: groupId,
        relatedType: 'study_group',
        metadata: {
          groupName: notification.metadata.groupName,
          declinedBy: userName
        },
        priority: 'low'
      });
    }

    // Mark notification as declined
    await notification.decline();

    res.json({
      success: true,
      message: 'Notification declined successfully',
      data: notification
    });

  } catch (error) {
    console.error('Error declining notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to decline notification',
      error: error.message
    });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification',
      error: error.message
    });
  }
};

// Create study group invitation (used by study group controllers)
const createStudyGroupInvitation = async (inviterData, recipientData, groupData) => {
  try {
    const notification = await Notification.createStudyGroupInvitation({
      recipientId: recipientData.userId,
      recipientName: recipientData.userName,
      senderId: inviterData.userId,
      senderName: inviterData.userName,
      groupId: groupData.groupId,
      groupName: groupData.groupName,
      groupDescription: groupData.groupDescription
    });

    return {
      success: true,
      data: notification
    };

  } catch (error) {
    console.error('Error creating study group invitation:', error);
    return {
      success: false,
      message: 'Failed to create invitation',
      error: error.message
    };
  }
};

// Create join request notification (used by study group controllers)
const createJoinRequest = async (requesterData, adminData, groupData) => {
  try {
    const notification = await Notification.createJoinRequest({
      recipientId: adminData.userId,
      recipientName: adminData.userName,
      senderId: requesterData.userId,
      senderName: requesterData.userName,
      groupId: groupData.groupId,
      groupName: groupData.groupName
    });

    return {
      success: true,
      data: notification
    };

  } catch (error) {
    console.error('Error creating join request:', error);
    return {
      success: false,
      message: 'Failed to create join request',
      error: error.message
    };
  }
};

// Test endpoint to create a dummy notification for debugging
const createTestNotification = async (req, res) => {
  try {
    const { userId, userName } = req.body;

    if (!userId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'userId and userName are required'
      });
    }

    console.log('🧪 Creating test notification for:', userId, userName);

    const testNotification = new Notification({
      recipientId: userId,
      recipientName: userName,
      senderId: 'system',
      senderName: 'System',
      type: 'general',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.',
      actionRequired: false,
      status: 'pending',
      priority: 'low'
    });

    const savedNotification = await testNotification.save();
    console.log('✅ Test notification created:', savedNotification._id);

    res.json({
      success: true,
      message: 'Test notification created successfully',
      data: savedNotification
    });

  } catch (error) {
    console.error('❌ Error creating test notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test notification',
      error: error.message
    });
  }
};

export {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  acceptNotification,
  declineNotification,
  deleteNotification,
  createStudyGroupInvitation,
  createJoinRequest,
  createTestNotification
};
