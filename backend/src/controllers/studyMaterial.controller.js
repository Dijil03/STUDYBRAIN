import StudyMaterial from '../models/studyMaterial.model.js';
import Folder from '../models/folder.model.js';

// Get all materials for a user
export const getMaterials = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      subject, 
      tag, 
      type, 
      folderId, 
      starred, 
      archived,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    const query = { userId };
    
    // Build query filters
    if (subject && subject !== 'all') {
      query.subject = subject.toLowerCase();
    }
    
    if (tag) {
      query.tags = { $in: [tag.toLowerCase()] };
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (folderId) {
      query.folderId = folderId;
    }
    
    if (starred === 'true') {
      query.isStarred = true;
    }
    
    if (archived === 'true') {
      query.isArchived = true;
    } else if (archived !== 'true') {
      query.isArchived = false; // Default: don't show archived
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'title') {
      sortOptions.title = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'lastAccessed') {
      sortOptions.lastAccessed = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'viewCount') {
      sortOptions.viewCount = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [materials, total] = await Promise.all([
      StudyMaterial.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('folderId', 'name color'),
      StudyMaterial.countDocuments(query)
    ]);

    // Get statistics
    const stats = await StudyMaterial.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          totalSize: { $sum: '$fileSize' },
          byType: {
            $push: '$type'
          },
          bySubject: {
            $push: '$subject'
          }
        }
      }
    ]);

    const typeCounts = {};
    const subjectCounts = {};
    
    if (stats.length > 0) {
      stats[0].byType.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });
      stats[0].bySubject.forEach(subject => {
        subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
      });
    }

    res.status(200).json({
      success: true,
      data: {
        materials,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit))
        },
        stats: {
          total: stats[0]?.total || 0,
          totalSize: stats[0]?.totalSize || 0,
          typeCounts,
          subjectCounts
        }
      }
    });
  } catch (error) {
    console.error('Error fetching materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch materials',
      error: error.message
    });
  }
};

// Get a single material
export const getMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await StudyMaterial.findById(materialId)
      .populate('folderId', 'name color');
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Mark as viewed
    await material.markAsViewed();

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error fetching material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch material',
      error: error.message
    });
  }
};

// Create a new material
export const createMaterial = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      title,
      description,
      type,
      subject,
      folderId,
      content,
      linkUrl,
      tags,
      fileUrl,
      fileName,
      fileSize,
      mimeType
    } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title and type are required'
      });
    }

    const material = new StudyMaterial({
      userId,
      title,
      description: description || '',
      type,
      subject: subject?.toLowerCase() || 'general',
      folderId: folderId || null,
      content: content || '',
      linkUrl: linkUrl || null,
      tags: tags ? tags.map(t => t.toLowerCase().trim()) : [],
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      fileSize: fileSize || 0,
      mimeType: mimeType || null
    });

    await material.save();

    res.status(201).json({
      success: true,
      data: material,
      message: 'Material created successfully'
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create material',
      error: error.message
    });
  }
};

// Update a material
export const updateMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const {
      title,
      description,
      subject,
      folderId,
      content,
      linkUrl,
      tags,
      isStarred,
      isArchived,
      isPublic
    } = req.body;

    const material = await StudyMaterial.findById(materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    if (title) material.title = title;
    if (description !== undefined) material.description = description;
    if (subject) material.subject = subject.toLowerCase();
    if (folderId !== undefined) material.folderId = folderId;
    if (content !== undefined) material.content = content;
    if (linkUrl !== undefined) material.linkUrl = linkUrl;
    if (tags) material.tags = tags.map(t => t.toLowerCase().trim());
    if (isStarred !== undefined) material.isStarred = isStarred;
    if (isArchived !== undefined) material.isArchived = isArchived;
    if (isPublic !== undefined) material.isPublic = isPublic;

    await material.save();

    res.status(200).json({
      success: true,
      data: material,
      message: 'Material updated successfully'
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update material',
      error: error.message
    });
  }
};

// Delete a material
export const deleteMaterial = async (req, res) => {
  try {
    const { materialId } = req.params;
    const material = await StudyMaterial.findByIdAndDelete(materialId);
    
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete material',
      error: error.message
    });
  }
};

// Get all tags for a user
export const getTags = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const materials = await StudyMaterial.find({ userId, isArchived: false });
    const allTags = materials.flatMap(m => m.tags || []);
    
    // Count tag frequency
    const tagCounts = {};
    allTags.forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
    
    const tags = Object.keys(tagCounts).map(tag => ({
      name: tag,
      count: tagCounts[tag]
    })).sort((a, b) => b.count - a.count);

    res.status(200).json({
      success: true,
      data: tags
    });
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tags',
      error: error.message
    });
  }
};

// Get all subjects for a user
export const getSubjects = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const subjects = await StudyMaterial.aggregate([
      { $match: { userId, isArchived: false } },
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: subjects.map(s => ({
        name: s._id || 'general',
        count: s.count
      }))
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subjects',
      error: error.message
    });
  }
};

// Bulk operations
export const bulkUpdate = async (req, res) => {
  try {
    const { userId } = req.params;
    const { materialIds, updates } = req.body;

    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Material IDs are required'
      });
    }

    const result = await StudyMaterial.updateMany(
      { _id: { $in: materialIds }, userId },
      { $set: updates }
    );

    res.status(200).json({
      success: true,
      data: {
        modified: result.modifiedCount
      },
      message: `${result.modifiedCount} material(s) updated successfully`
    });
  } catch (error) {
    console.error('Error bulk updating materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk update materials',
      error: error.message
    });
  }
};

export const bulkDelete = async (req, res) => {
  try {
    const { userId } = req.params;
    const { materialIds } = req.body;

    if (!materialIds || !Array.isArray(materialIds) || materialIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Material IDs are required'
      });
    }

    const result = await StudyMaterial.deleteMany({
      _id: { $in: materialIds },
      userId
    });

    res.status(200).json({
      success: true,
      data: {
        deleted: result.deletedCount
      },
      message: `${result.deletedCount} material(s) deleted successfully`
    });
  } catch (error) {
    console.error('Error bulk deleting materials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk delete materials',
      error: error.message
    });
  }
};

