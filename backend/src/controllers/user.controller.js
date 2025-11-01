import User from '../models/auth.model.js';

// Get all users for invitation selection
const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.body.userId || req.query.userId;
    const { search = '', limit = 50, skip = 0 } = req.query;

    // Build search query
    const searchQuery = {};
    
    // Exclude current user if provided
    if (currentUserId) {
      searchQuery._id = { $ne: currentUserId };
    }

    // Add text search if provided
    if (search) {
      searchQuery.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Fetch users with limited fields for privacy
    const users = await User.find(searchQuery)
      .select('_id username email profilePicture avatar createdAt')
      .sort({ username: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .lean();

    // Get total count for pagination
    const totalCount = await User.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || user.avatar,
          joinedDate: user.createdAt
        })),
        pagination: {
          total: totalCount,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: totalCount > (parseInt(skip) + users.length)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// Get user profile by ID
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('_id username email profilePicture avatar createdAt subscription')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture || user.avatar,
        joinedDate: user.createdAt,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// Search users (similar to getAllUsers but optimized for search)
const searchUsers = async (req, res) => {
  try {
    const currentUserId = req.body.userId || req.query.userId;
    const { q = '', limit = 20, groupId = null } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: {
          users: [],
          pagination: { total: 0, limit: parseInt(limit), skip: 0, hasMore: false }
        }
      });
    }

    // Build search query
    const searchQuery = {
      $or: [
        { username: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]
    };

    // Exclude current user
    if (currentUserId) {
      searchQuery._id = { $ne: currentUserId };
    }

    // If groupId is provided, exclude users who are already members
    if (groupId) {
      const { StudyGroupMember } = await import('../models/studyGroup.model.js');
      const existingMembers = await StudyGroupMember.find({ groupId })
        .select('userId')
        .lean();
      
      const memberIds = existingMembers.map(member => member.userId);
      if (memberIds.length > 0) {
        searchQuery._id = { $nin: [...memberIds, currentUserId].filter(Boolean) };
      }
    }

    const users = await User.find(searchQuery)
      .select('_id username email profilePicture avatar')
      .sort({ username: 1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture || user.avatar
        })),
        pagination: {
          total: users.length,
          limit: parseInt(limit),
          skip: 0,
          hasMore: users.length === parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search users',
      error: error.message
    });
  }
};

export {
  getAllUsers,
  getUserById,
  searchUsers
};
