import Document from '../models/document.model.js';
import Version from '../models/version.model.js';
import User from '../models/auth.model.js';

export const createDocument = async (req, res) => {
    try {
        console.log('📝 Creating document...');
        console.log('Request body:', req.body);
        console.log('Request params:', req.params);

        const { title, folderId, content, settings } = req.body;
        const { userId } = req.params;

        console.log('User ID:', userId);
        console.log('Title:', title);

        if (!title || title.trim() === '') {
            console.log('❌ Document title is required');
            return res.status(400).json({ error: 'Document title is required' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            console.log('❌ User not found:', userId);
            return res.status(404).json({ error: 'User not found' });
        }
        console.log('✅ User found:', user.username);

        console.log('📄 Creating document object...');
        console.log('Document data:', {
            userId,
            title: title.trim(),
            folderId: folderId || null,
            content: content || '',
            settings: settings || {
                isPublic: false,
                allowComments: true,
                allowSuggestions: true,
                allowDownload: true
            }
        });

        const document = new Document({
            userId,
            title: title.trim(),
            folderId: folderId || null,
            content: content || '',
            settings: settings || {
                isPublic: false,
                allowComments: true,
                allowSuggestions: true,
                allowDownload: true
            }
        });

        console.log('💾 Saving document...');
        console.log('Document before save:', document);

        // Validate document before saving
        const validationError = document.validateSync();
        if (validationError) {
            console.log('❌ Document validation error:', validationError);
            return res.status(400).json({
                error: 'Document validation failed',
                details: validationError.message
            });
        }

        await document.save();
        console.log('✅ Document saved with ID:', document._id);

        // Create initial version
        console.log('📝 Creating initial version...');
        console.log('Version data:', {
            documentId: document._id,
            userId,
            content: document.content || '',
            title: document.title,
            versionNumber: 1,
            isManualSave: true,
            changeDescription: 'Initial version'
        });

        const version = new Version({
            documentId: document._id,
            userId,
            content: document.content || '', // Ensure content is always a string
            title: document.title,
            versionNumber: 1,
            isManualSave: true,
            changeDescription: 'Initial version'
        });

        console.log('💾 Saving version...');
        console.log('Version before save:', version);

        // Validate version before saving
        const versionValidationError = version.validateSync();
        if (versionValidationError) {
            console.log('❌ Version validation error:', versionValidationError);
            return res.status(400).json({
                error: 'Version validation failed',
                details: versionValidationError.message
            });
        }

        await version.save();
        console.log('✅ Version saved with ID:', version._id);

        console.log('🎉 Document creation successful!');
        res.status(201).json({
            message: 'Document created successfully',
            document
        });

    } catch (error) {
        console.error('❌ Error creating document:', error);
        console.error('Error stack:', error.stack);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);

        res.status(500).json({
            error: 'Failed to create document',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export const getDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.params;

        const document = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // Ensure content is always a string
        if (typeof document.content !== 'string') {
            document.content = '';
        }

        res.status(200).json({ document });

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            error: 'Failed to fetch document',
            details: error.message
        });
    }
};

export const getDocuments = async (req, res) => {
    try {
        const { userId } = req.params;
        const { folderId, search, sortBy, sortOrder, includeStarred, includeArchived } = req.query;

        let query = {
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        };

        if (folderId) {
            query.folderId = folderId === 'null' ? null : folderId;
        }

        if (includeStarred === 'true') {
            query.isStarred = true;
        }

        if (includeArchived === 'true') {
            query.isArchived = true;
        } else {
            query.isArchived = { $ne: true };
        }

        if (search) {
            query.$and = [
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { tags: { $in: [new RegExp(search, 'i')] } }
                    ]
                }
            ];
        }

        let sortOptions = {};
        switch (sortBy) {
            case 'title':
                sortOptions.title = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'updatedAt':
                sortOptions.updatedAt = sortOrder === 'desc' ? -1 : 1;
                break;
            case 'createdAt':
                sortOptions.createdAt = sortOrder === 'desc' ? -1 : 1;
                break;
            default:
                sortOptions = { updatedAt: -1 };
        }

        const documents = await Document.find(query)
            .sort(sortOptions)
            .populate('folderId', 'name color')
            .limit(50); // Limit for performance

        res.status(200).json({ documents });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            error: 'Failed to fetch documents',
            details: error.message
        });
    }
};

export const updateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { title, content, settings, tags } = req.body;
        const { userId } = req.params;

        const document = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId, 'collaborators.permission': { $in: ['editor', 'owner'] } }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        const updateData = {};
        if (title) updateData.title = title.trim();
        if (content) updateData.content = content;
        if (settings) updateData.settings = { ...document.settings, ...settings };
        if (tags) updateData.tags = tags;

        updateData.lastEditedBy = userId;

        const updatedDocument = await Document.findByIdAndUpdate(
            documentId,
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: 'Document updated successfully',
            document: updatedDocument
        });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({
            error: 'Failed to update document',
            details: error.message
        });
    }
};

export const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.params;
        const { permanent } = req.query;

        const document = await Document.findOne({
            _id: documentId,
            userId // Only owner can delete
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        if (permanent === 'true') {
            // Permanently delete
            await Document.findByIdAndDelete(documentId);
            await Version.deleteMany({ documentId });
            // Also delete comments
            const Comment = (await import('../models/comment.model.js')).default;
            await Comment.deleteMany({ documentId });
        } else {
            // Move to archive
            document.isArchived = true;
            await document.save();
        }

        res.status(200).json({
            message: permanent === 'true' ? 'Document permanently deleted' : 'Document archived'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            error: 'Failed to delete document',
            details: error.message
        });
    }
};

export const shareDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { collaborators } = req.body;
        const { userId } = req.params;

        const document = await Document.findOne({
            _id: documentId,
            userId // Only owner can share
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        // Update collaborators
        document.collaborators = collaborators || [];
        await document.save();

        res.status(200).json({
            message: 'Document sharing updated successfully',
            document
        });

    } catch (error) {
        console.error('Error sharing document:', error);
        res.status(500).json({
            error: 'Failed to update document sharing',
            details: error.message
        });
    }
};

export const moveDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { folderId } = req.body;
        const { userId } = req.params;

        const document = await Document.findOne({
            _id: documentId,
            userId // Only owner can move
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        document.folderId = folderId || null;
        await document.save();

        res.status(200).json({
            message: 'Document moved successfully',
            document
        });

    } catch (error) {
        console.error('Error moving document:', error);
        res.status(500).json({
            error: 'Failed to move document',
            details: error.message
        });
    }
};

export const duplicateDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.params;

        const originalDocument = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!originalDocument) {
            return res.status(404).json({ error: 'Document not found' });
        }

        const duplicatedDocument = new Document({
            userId,
            title: `${originalDocument.title} (Copy)`,
            folderId: originalDocument.folderId,
            content: originalDocument.content,
            settings: originalDocument.settings,
            tags: originalDocument.tags
        });

        await duplicatedDocument.save();

        res.status(201).json({
            message: 'Document duplicated successfully',
            document: duplicatedDocument
        });

    } catch (error) {
        console.error('Error duplicating document:', error);
        res.status(500).json({
            error: 'Failed to duplicate document',
            details: error.message
        });
    }
};

// Get document count for feature gating
export const getDocumentCount = async (req, res) => {
    try {
        const { userId } = req.params;

        const count = await Document.countDocuments({ userId });

        res.status(200).json({
            success: true,
            count: count
        });
    } catch (error) {
        console.error('Error getting document count:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get document count',
            details: error.message
        });
    }
};
