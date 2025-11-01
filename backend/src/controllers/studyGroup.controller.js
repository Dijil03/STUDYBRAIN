import { StudyGroup, StudyGroupMember } from '../models/studyGroup.model.js';
import { createStudyGroupInvitation } from './notification.controller.js';
import User from '../models/auth.model.js';
import GroupMessage from '../models/groupMessage.model.js';
import GroupNotes from '../models/groupNotes.model.js';
import crypto from 'crypto';

// Create a new study group
export const createStudyGroup = async (req, res) => {
  try {
    const {
      name,
      description,
      subject,
      privacy = 'public',
      memberLimit = 50,
      tags = [],
      studySchedule = 'flexible',
      difficulty = 'intermediate',
      rules
    } = req.body;

    const { userId } = req.params;
    // Check user's plan
    const creator = await User.findById(userId);
    if (!creator) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const plan = creator.subscription?.plan || 'free';
    if (plan === 'free') {
      return res.status(403).json({
        success: false,
        error: 'Study groups are available on Study Pro (up to 5 members) and Study Master.',
        requiresUpgrade: true
      });
    }
    const userName = req.body.userName || localStorage?.getItem('username') || 'User';

    // Create the study group
    const studyGroup = await StudyGroup.create({
      name: name.trim(),
      description: description.trim(),
      subject,
      creator: userId,
      creatorName: userName,
      privacy,
      memberLimit: plan === 'premium' ? Math.min(5, memberLimit) : Math.min(memberLimit, 100),
      tags: tags.filter(tag => tag.trim()).slice(0, 5), // Max 5 tags
      studySchedule,
      difficulty,
      rules: rules || 'Be respectful and supportive of all group members.'
    });

    // Generate invite token using the static method - ensure we always get a token
    // IMPORTANT: We must always generate a valid token to avoid null duplicate key errors
    let tokenGenerated = false;
    let attempts = 0;
    const maxAttempts = 10; // Increased attempts
    
    while (!tokenGenerated && attempts < maxAttempts) {
      try {
        attempts++;
        const token = await StudyGroup.generateUniqueInviteToken();
        
        // Double-check token doesn't exist (race condition protection)
        const existingToken = await StudyGroup.findOne({ inviteToken: token });
        if (existingToken) {
          console.log(`Token collision detected on attempt ${attempts}, regenerating...`);
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
          continue;
        }
        
        studyGroup.inviteToken = token;
        studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        studyGroup.inviteTokenEnabled = true;
        tokenGenerated = true;
        console.log(`Successfully generated invite token on attempt ${attempts}`);
      } catch (tokenError) {
        console.error(`Token generation attempt ${attempts} failed:`, tokenError.message);
        
        if (attempts >= maxAttempts) {
          // Last resort: use simple token generation with extra randomness
          try {
            const timestamp = Date.now();
            const random1 = crypto.randomBytes(16).toString('hex');
            const random2 = crypto.randomBytes(12).toString('hex');
            const random3 = Math.random().toString(36).substring(2, 15);
            const processId = process.pid.toString(36);
            const microtime = (process.hrtime.bigint() % BigInt(1000000)).toString(36);
            const fallbackToken = `sg_${timestamp}_${random1}_${random2}_${random3}_${processId}_${microtime}`;
            
            // Check one more time before using fallback
            const existing = await StudyGroup.findOne({ inviteToken: fallbackToken });
            if (!existing) {
              studyGroup.inviteToken = fallbackToken;
              studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              studyGroup.inviteTokenEnabled = true;
              tokenGenerated = true;
              console.log('Using fallback token generation as last resort');
            } else {
              // Even fallback collided - use emergency generation
              const emergencyToken = `sg_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}_${crypto.randomBytes(16).toString('hex')}_${Math.random().toString(36).substring(2, 15)}`;
              studyGroup.inviteToken = emergencyToken;
              studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              studyGroup.inviteTokenEnabled = true;
              tokenGenerated = true;
              console.log('Using emergency token generation');
            }
          } catch (fallbackError) {
            console.error('All token generation methods failed:', fallbackError);
            // This should never happen, but if it does, we MUST generate something
            const emergencyToken = `sg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}_${crypto.randomBytes(8).toString('hex')}`;
            studyGroup.inviteToken = emergencyToken;
            studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            studyGroup.inviteTokenEnabled = true;
            tokenGenerated = true;
            console.log('Using emergency token generation');
          }
        } else {
          // Wait before retry with increasing delay
          await new Promise(resolve => setTimeout(resolve, 50 + (attempts * 20) + Math.random() * 50));
        }
      }
    }

    // Final safety check: ensure we ALWAYS have a token before saving
    if (!studyGroup.inviteToken || studyGroup.inviteToken === null || studyGroup.inviteToken === undefined) {
      console.error('CRITICAL: No token generated! Generating emergency token...');
      const emergencyToken = `sg_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}_${crypto.randomBytes(16).toString('hex')}_${Math.random().toString(36).substring(2, 15)}`;
      studyGroup.inviteToken = emergencyToken;
      studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      studyGroup.inviteTokenEnabled = true;
    }

    // Save the study group (with or without token)
    let saveAttempts = 0;
    const maxSaveAttempts = 3;
    let saveSuccess = false;
    
    while (!saveSuccess && saveAttempts < maxSaveAttempts) {
      try {
        saveAttempts++;
        await studyGroup.save();
        saveSuccess = true;
        console.log(`Successfully saved study group on attempt ${saveAttempts}`);
      } catch (saveError) {
        // If duplicate key error on inviteToken, regenerate and retry
        if (saveError.code === 11000 && saveError.message.includes('inviteToken')) {
          console.log(`Duplicate inviteToken detected on save attempt ${saveAttempts}, regenerating...`);
          
          if (saveAttempts < maxSaveAttempts) {
            try {
              // Generate a completely new token with extra randomness
              const timestamp = Date.now();
              const random1 = crypto.randomBytes(12).toString('hex');
              const random2 = crypto.randomBytes(8).toString('hex');
              const random3 = Math.random().toString(36).substring(2, 15);
              const processId = process.pid.toString(36);
              const newToken = `sg_${timestamp}_${random1}_${random2}_${processId}_${random3}`;
              
              studyGroup.inviteToken = newToken;
              studyGroup.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              studyGroup.inviteTokenEnabled = true;
              
              // Wait a bit before retrying to ensure timestamp changes
              await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
            } catch (tokenRegenError) {
              console.error('Error regenerating token:', tokenRegenError);
              // Continue to next attempt
            }
          } else {
            // Last attempt failed - this should be very rare
            console.error('All save attempts failed with duplicate token error');
            throw saveError; // Re-throw to be caught by outer catch
          }
        } else {
          // Other errors - re-throw immediately
          throw saveError;
        }
      }
    }

    // Add creator as admin member
    await StudyGroupMember.create({
      groupId: studyGroup._id,
      userId,
      userName,
      role: 'admin'
    });

    res.status(201).json({
      success: true,
      message: 'Study group created successfully!',
      group: studyGroup
    });

  } catch (error) {
    console.error('Error creating study group:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    if (error.code === 11000) {
      // Check which field is causing the duplicate
      let errorMessage = 'A study group with similar details already exists.';
      const errorKey = error.keyPattern ? Object.keys(error.keyPattern)[0] : null;

      if (errorKey === 'inviteToken' || error.message.includes('inviteToken')) {
        // This should be very rare now with our retry logic
        errorMessage = 'There was an issue generating a unique invite token. Please try again in a moment.';
        console.error('Invite token duplicate error - this should be handled by retry logic');
      } else if (errorKey === 'name' || error.message.includes('name')) {
        errorMessage = 'A study group with this name already exists. Please choose a different name.';
      }

      return res.status(400).json({
        success: false,
        error: errorMessage
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create study group',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get all public study groups with filters
export const getStudyGroups = async (req, res) => {
  try {
    const {
      search = '',
      subject = '',
      difficulty = '',
      privacy = 'public',
      studySchedule = '',
      page = 1,
      limit = 12,
      sortBy = 'newest'
    } = req.query;

    // Build filter query
    const filter = {
      isActive: true,
      privacy: privacy === 'all' ? { $in: ['public', 'invite-only'] } : privacy
    };

    if (search) {
      filter.$text = { $search: search };
    }

    if (subject && subject !== 'all') {
      filter.subject = subject;
    }

    if (difficulty && difficulty !== 'all') {
      filter.difficulty = difficulty;
    }

    if (studySchedule && studySchedule !== 'all') {
      filter.studySchedule = studySchedule;
    }

    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'popular':
        sortOptions = { currentMembers: -1, createdAt: -1 };
        break;
      case 'name':
        sortOptions = { name: 1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get groups with pagination
    const [groups, total] = await Promise.all([
      StudyGroup.find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      StudyGroup.countDocuments(filter)
    ]);

    // Get member counts for each group
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const memberCount = await StudyGroupMember.countDocuments({
          groupId: group._id,
          isActive: true
        });

        return {
          ...group,
          currentMembers: memberCount
        };
      })
    );

    res.status(200).json({
      success: true,
      groups: groupsWithMembers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + groups.length < total
      }
    });

  } catch (error) {
    console.error('Error fetching study groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study groups'
    });
  }
};

// Get user's study groups
export const getUserStudyGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find groups where user is a member
    const memberships = await StudyGroupMember.find({
      userId,
      isActive: true
    }).populate('groupId').lean();

    const groups = memberships
      .filter(membership => membership.groupId && membership.groupId.isActive)
      .map(membership => ({
        ...membership.groupId,
        userRole: membership.role,
        joinedAt: membership.joinedAt,
        lastActivity: membership.lastActivity
      }));

    res.status(200).json({
      success: true,
      groups
    });

  } catch (error) {
    console.error('Error fetching user study groups:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your study groups'
    });
  }
};

// Get specific study group details
export const getStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    const group = await StudyGroup.findById(groupId);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Get group members
    const members = await StudyGroupMember.find({
      groupId,
      isActive: true
    }).sort({ role: 1, joinedAt: 1 }).lean();

    // Check if current user is a member
    const userMembership = userId ? members.find(m => m.userId === userId) : null;

    // If private group and user is not a member, limit info
    if (group.privacy === 'private' && !userMembership) {
      return res.status(200).json({
        success: true,
        group: {
          _id: group._id,
          name: group.name,
          description: group.description,
          subject: group.subject,
          privacy: group.privacy,
          currentMembers: group.currentMembers,
          memberLimit: group.memberLimit,
          isPrivate: true
        }
      });
    }

    res.status(200).json({
      success: true,
      group: {
        ...group.toObject(),
        members,
        userRole: userMembership?.role || null,
        isMember: !!userMembership
      }
    });

  } catch (error) {
    console.error('Error fetching study group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch study group details'
    });
  }
};

// Join a study group
export const joinStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const userName = req.body.userName || 'User';
    const message = req.body.message || '';

    const group = await StudyGroup.findById(groupId);
    // Check user's plan (free users cannot join study groups)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const plan = user.subscription?.plan || 'free';
    if (plan === 'free') {
      return res.status(403).json({
        success: false,
        error: 'Study groups require Study Pro or Study Master.',
        requiresUpgrade: true
      });
    }


    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is already a member
    const existingMember = await StudyGroupMember.findOne({
      groupId,
      userId,
      isActive: true
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this group'
      });
    }

    // Check member limit
    const currentMemberCount = await StudyGroupMember.countDocuments({
      groupId,
      isActive: true
    });

    if (currentMemberCount >= group.memberLimit) {
      return res.status(400).json({
        success: false,
        error: 'This study group is full'
      });
    }

    // Handle different privacy levels
    if (group.privacy === 'private') {
      return res.status(403).json({
        success: false,
        error: 'This is a private group. You need an invitation to join.'
      });
    }

    if (group.privacy === 'invite-only') {
      // Add to join requests
      const existingRequest = group.joinRequests.find(req => req.userId === userId);

      if (existingRequest) {
        return res.status(400).json({
          success: false,
          error: 'You have already requested to join this group'
        });
      }

      group.joinRequests.push({
        userId,
        userName,
        message: message.slice(0, 200) // Limit message length
      });

      await group.save();

      return res.status(200).json({
        success: true,
        message: 'Join request sent successfully! Group admins will review your request.'
      });
    }

    // Public group - join immediately
    await StudyGroupMember.create({
      groupId,
      userId,
      userName
    });

    res.status(200).json({
      success: true,
      message: 'Successfully joined the study group!'
    });

  } catch (error) {
    console.error('Error joining study group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join study group'
    });
  }
};

// Leave a study group
export const leaveStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const membership = await StudyGroupMember.findOne({
      groupId,
      userId,
      isActive: true
    });

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: 'You are not a member of this group'
      });
    }

    const group = await StudyGroup.findById(groupId);

    // If user is the creator/admin and there are other members, transfer ownership
    if (membership.role === 'admin' && group.creator === userId) {
      const otherMembers = await StudyGroupMember.find({
        groupId,
        userId: { $ne: userId },
        isActive: true
      }).sort({ joinedAt: 1 });

      if (otherMembers.length > 0) {
        // Promote the longest-standing member to admin
        await StudyGroupMember.findByIdAndUpdate(otherMembers[0]._id, {
          role: 'admin'
        });

        // Update group creator
        group.creator = otherMembers[0].userId;
        group.creatorName = otherMembers[0].userName;
        await group.save();
      } else {
        // No other members, delete the group
        group.isActive = false;
        await group.save();
      }
    }

    // Remove membership
    membership.isActive = false;
    await membership.save();

    res.status(200).json({
      success: true,
      message: 'Successfully left the study group'
    });

  } catch (error) {
    console.error('Error leaving study group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave study group'
    });
  }
};

// Manage join requests (approve/reject)
export const manageJoinRequest = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, requestUserId, action, adminUserId } = req.body; // action: 'approve' or 'reject'

    const group = await StudyGroup.findById(groupId);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is admin/moderator
    const adminMembership = await StudyGroupMember.findOne({
      groupId,
      userId: adminUserId,
      role: { $in: ['admin', 'moderator'] },
      isActive: true
    });

    if (!adminMembership) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to manage join requests'
      });
    }

    // Find the join request
    const requestIndex = group.joinRequests.findIndex(req => req.userId === requestUserId);

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Join request not found'
      });
    }

    const joinRequest = group.joinRequests[requestIndex];

    if (action === 'approve') {
      // Check member limit
      const currentMemberCount = await StudyGroupMember.countDocuments({
        groupId,
        isActive: true
      });

      if (currentMemberCount >= group.memberLimit) {
        return res.status(400).json({
          success: false,
          error: 'Group is full, cannot approve new members'
        });
      }

      // Add as member
      await StudyGroupMember.create({
        groupId,
        userId: requestUserId,
        userName: joinRequest.userName
      });
    }

    // Remove the join request
    group.joinRequests.splice(requestIndex, 1);
    await group.save();

    res.status(200).json({
      success: true,
      message: `Join request ${action}d successfully`
    });

  } catch (error) {
    console.error('Error managing join request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to manage join request'
    });
  }
};

// Update study group settings (admin only)
export const updateStudyGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, ...updates } = req.body;

    // Check if user is admin
    const membership = await StudyGroupMember.findOne({
      groupId,
      userId,
      role: 'admin',
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Only group admins can update group settings'
      });
    }

    // Validate and sanitize updates
    const allowedUpdates = [
      'name', 'description', 'privacy', 'memberLimit',
      'tags', 'studySchedule', 'difficulty', 'rules'
    ];

    const validUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        validUpdates[key] = updates[key];
      }
    });

    if (validUpdates.memberLimit) {
      validUpdates.memberLimit = Math.min(validUpdates.memberLimit, 100);
    }

    const group = await StudyGroup.findByIdAndUpdate(
      groupId,
      validUpdates,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Study group updated successfully',
      group
    });

  } catch (error) {
    console.error('Error updating study group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update study group'
    });
  }
};

// Generate or regenerate invite token (admin only)
export const generateInviteToken = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;

    const group = await StudyGroup.findById(groupId);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is admin
    const membership = await StudyGroupMember.findOne({
      groupId,
      userId,
      role: 'admin',
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Only group admins can generate invite tokens'
      });
    }

    // Generate new unique invite token
    try {
      const token = await StudyGroup.generateUniqueInviteToken();
      group.inviteToken = token;
      group.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      group.inviteTokenEnabled = true;
      await group.save();
    } catch (tokenError) {
      console.error('Primary token generation failed, trying fallback:', tokenError);

      // Try fallback token generation
      try {
        const crypto = await import('crypto');
        const fallbackToken = `sg_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}_${Math.random().toString(36).substr(2, 9)}`;
        group.inviteToken = fallbackToken;
        group.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        group.inviteTokenEnabled = true;
        await group.save();
      } catch (fallbackError) {
        console.error('Fallback token generation failed:', fallbackError);
        return res.status(500).json({
          success: false,
          error: 'Failed to generate unique invite token. Please try again.'
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Invite token generated successfully',
      inviteToken: group.inviteToken,
      inviteLink: group.getInviteLink(),
      expiryDate: group.inviteTokenExpiry
    });

  } catch (error) {
    console.error('Error generating invite token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate invite token'
    });
  }
};

// Join study group via invite token
export const joinViaInviteToken = async (req, res) => {
  try {
    const { inviteToken } = req.params;
    const { userId, userName } = req.body;

    const group = await StudyGroup.findOne({
      inviteToken,
      isActive: true
    });
    // Check user's plan (free users cannot join study groups)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    const plan = user.subscription?.plan || 'free';
    if (plan === 'free') {
      return res.status(403).json({
        success: false,
        error: 'Study groups require Study Pro or Study Master.',
        requiresUpgrade: true
      });
    }


    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired invite link'
      });
    }

    // Validate invite token
    if (!group.isInviteTokenValid(inviteToken)) {
      return res.status(400).json({
        success: false,
        error: 'Invite link has expired or is disabled'
      });
    }

    // Check if user is already a member
    const existingMember = await StudyGroupMember.findOne({
      groupId: group._id,
      userId,
      isActive: true
    });

    if (existingMember) {
      return res.status(200).json({
        success: true,
        message: 'You are already a member of this group',
        group: {
          _id: group._id,
          name: group.name,
          description: group.description
        }
      });
    }

    // Check member limit
    const currentMemberCount = await StudyGroupMember.countDocuments({
      groupId: group._id,
      isActive: true
    });

    if (currentMemberCount >= group.memberLimit) {
      return res.status(400).json({
        success: false,
        error: 'This study group is full'
      });
    }

    // Add user as member (invite link bypasses privacy settings)
    await StudyGroupMember.create({
      groupId: group._id,
      userId,
      userName: userName || 'User'
    });

    res.status(200).json({
      success: true,
      message: `Successfully joined ${group.name}!`,
      group: {
        _id: group._id,
        name: group.name,
        description: group.description,
        subject: group.subject
      }
    });

  } catch (error) {
    console.error('Error joining via invite token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join study group'
    });
  }
};

// Get invite link for sharing (admin/moderator only)
export const getInviteLink = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.query;

    const group = await StudyGroup.findById(groupId);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is admin or moderator
    const membership = await StudyGroupMember.findOne({
      groupId,
      userId,
      role: { $in: ['admin', 'moderator'] },
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Only admins and moderators can access invite links'
      });
    }

    // Generate token if it doesn't exist or is expired
    if (!group.inviteToken || !group.inviteTokenExpiry || new Date() >= group.inviteTokenExpiry) {
      try {
        const token = await StudyGroup.generateUniqueInviteToken();
        group.inviteToken = token;
        group.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        group.inviteTokenEnabled = true;
        await group.save();
      } catch (tokenError) {
        console.error('Primary token generation failed, trying fallback:', tokenError);

        // Try fallback token generation
        try {
          const crypto = await import('crypto');
          const fallbackToken = `sg_${Date.now()}_${crypto.randomUUID().replace(/-/g, '')}_${Math.random().toString(36).substr(2, 9)}`;
          group.inviteToken = fallbackToken;
          group.inviteTokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          group.inviteTokenEnabled = true;
          await group.save();
        } catch (fallbackError) {
          console.error('Fallback token generation failed:', fallbackError);
          return res.status(500).json({
            success: false,
            error: 'Failed to generate unique invite token. Please try again.'
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      inviteLink: group.getInviteLink(),
      inviteToken: group.inviteToken,
      expiryDate: group.inviteTokenExpiry,
      isEnabled: group.inviteTokenEnabled
    });

  } catch (error) {
    console.error('Error getting invite link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get invite link'
    });
  }
};

// Toggle invite token enabled/disabled (admin only)
export const toggleInviteToken = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId, enabled } = req.body;

    const group = await StudyGroup.findById(groupId);

    if (!group || !group.isActive) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if user is admin
    const membership = await StudyGroupMember.findOne({
      groupId,
      userId,
      role: 'admin',
      isActive: true
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        error: 'Only group admins can toggle invite tokens'
      });
    }

    group.inviteTokenEnabled = enabled;
    await group.save();

    res.status(200).json({
      success: true,
      message: `Invite token ${enabled ? 'enabled' : 'disabled'} successfully`,
      inviteTokenEnabled: group.inviteTokenEnabled
    });

  } catch (error) {
    console.error('Error toggling invite token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to toggle invite token'
    });
  }
};

// Invite users to study group
export const inviteUsersToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userIds, message } = req.body; // userIds is an array of user IDs to invite
    const inviterId = req.body.userId;
    const inviterName = req.body.userName;

    if (!inviterId || !inviterName) {
      return res.status(400).json({
        success: false,
        error: 'Inviter ID and name are required'
      });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'At least one user ID is required'
      });
    }

    // Check if group exists
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Check if inviter is admin or moderator
    const inviterMembership = await StudyGroupMember.findOne({
      groupId,
      userId: inviterId,
      role: { $in: ['admin', 'moderator'] },
      isActive: true
    });

    if (!inviterMembership) {
      return res.status(403).json({
        success: false,
        error: 'Only admins and moderators can invite users'
      });
    }

    // Get user details for invitations
    const User = (await import('../models/auth.model.js')).default;
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id username email')
      .lean();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No valid users found'
      });
    }

    // Check which users are not already members
    const existingMembers = await StudyGroupMember.find({
      groupId,
      userId: { $in: userIds },
      isActive: true
    }).select('userId').lean();

    const existingMemberIds = existingMembers.map(member => member.userId);
    const usersToInvite = users.filter(user => !existingMemberIds.includes(user._id.toString()));

    if (usersToInvite.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'All selected users are already members of this group'
      });
    }

    // Create invitations for each user
    const invitationResults = [];
    for (const user of usersToInvite) {
      try {
        const invitationResult = await createStudyGroupInvitation(
          { userId: inviterId, userName: inviterName },
          { userId: user._id.toString(), userName: user.username },
          {
            groupId: group._id.toString(),
            groupName: group.name,
            groupDescription: group.description
          }
        );

        if (invitationResult.success) {
          invitationResults.push({
            userId: user._id,
            username: user.username,
            status: 'invited',
            notification: invitationResult.data
          });
        } else {
          invitationResults.push({
            userId: user._id,
            username: user.username,
            status: 'failed',
            error: invitationResult.message
          });
        }
      } catch (error) {
        console.error(`Error creating invitation for user ${user._id}:`, error);
        invitationResults.push({
          userId: user._id,
          username: user.username,
          status: 'failed',
          error: 'Failed to create invitation'
        });
      }
    }

    const successfulInvitations = invitationResults.filter(result => result.status === 'invited');
    const failedInvitations = invitationResults.filter(result => result.status === 'failed');

    res.status(200).json({
      success: true,
      message: `Sent ${successfulInvitations.length} invitation(s) successfully`,
      data: {
        successful: successfulInvitations,
        failed: failedInvitations,
        summary: {
          total: userIds.length,
          invited: successfulInvitations.length,
          failed: failedInvitations.length,
          alreadyMembers: existingMemberIds.length
        }
      }
    });

  } catch (error) {
    console.error('Error inviting users to group:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to invite users to group',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get study group statistics
export const getStudyGroupStats = async (req, res) => {
  try {
    const totalGroups = await StudyGroup.countDocuments({ isActive: true });
    const totalMembers = await StudyGroupMember.countDocuments({ isActive: true });

    const subjectStats = await StudyGroup.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const recentGroups = await StudyGroup.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name subject currentMembers createdAt')
      .lean();

    res.status(200).json({
      success: true,
      stats: {
        totalGroups,
        totalMembers,
        averageMembersPerGroup: Math.round(totalGroups > 0 ? totalMembers / totalGroups : 0),
        subjectDistribution: subjectStats,
        recentGroups
      }
    });

  } catch (error) {
    console.error('Error fetching study group stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};

// Get messages for a study group
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Get messages (limit to last 100)
    const messages = await GroupMessage.find({ groupId })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    return res.status(200).json({
      success: true,
      messages: messages.reverse() // Reverse to show oldest first
    });
  } catch (error) {
    console.error('Error fetching group messages:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
};

// Save/update group notes
export const saveGroupNotes = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;
    const userId = req.body.userId || req.user?.userId || req.user?.id;

    // Verify group exists
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Update or create notes
    const notes = await GroupNotes.findOneAndUpdate(
      { groupId },
      {
        content,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date()
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error saving group notes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save notes'
    });
  }
};

// Get group notes
export const getGroupNotes = async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const group = await StudyGroup.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        error: 'Study group not found'
      });
    }

    // Get notes or create empty one
    let notes = await GroupNotes.findOne({ groupId });
    if (!notes) {
      notes = await GroupNotes.create({
        groupId,
        content: ''
      });
    }

    return res.status(200).json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Error fetching group notes:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
};
