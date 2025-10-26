import Folder from '../models/folder.model.js';

export const createFolder = async (req, res) => {
    try {
        const { name, color, icon, parentFolderId } = req.body;
        const { userId } = req.params;

        if (!name || name.trim() === '') {
            return res.status(400).json({ error: 'Folder name is required' });
        }

        // Check if folder with same name exists in the same parent
        const existingFolder = await Folder.findOne({
            userId,
            name: name.trim(),
            parentFolderId: parentFolderId || null
        });

        if (existingFolder) {
            return res.status(400).json({ error: 'Folder with this name already exists' });
        }

        const folder = new Folder({
            userId,
            name: name.trim(),
            color: color || '#3B82F6',
            icon: icon || 'folder',
            parentFolderId: parentFolderId || null
        });

        await folder.save();

        res.status(201).json({
            message: 'Folder created successfully',
            folder
        });

    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({
            error: 'Failed to create folder',
            details: error.message
        });
    }
};

export const getFolders = async (req, res) => {
    try {
        const { userId } = req.params;
        const { parentFolderId, includeStarred } = req.query;

        let query = { userId };

        if (parentFolderId) {
            query.parentFolderId = parentFolderId === 'null' ? null : parentFolderId;
        }

        if (includeStarred === 'true') {
            query.isStarred = true;
        }

        const folders = await Folder.find(query)
            .sort({ isStarred: -1, name: 1 })
            .populate('parentFolderId', 'name');

        res.status(200).json({ folders });

    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({
            error: 'Failed to fetch folders',
            details: error.message
        });
    }
};

export const updateFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const { name, color, icon, isStarred } = req.body;
        const { userId } = req.params;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Check if new name conflicts with existing folder
        if (name && name !== folder.name) {
            const existingFolder = await Folder.findOne({
                userId,
                name: name.trim(),
                parentFolderId: folder.parentFolderId,
                _id: { $ne: folderId }
            });

            if (existingFolder) {
                return res.status(400).json({ error: 'Folder with this name already exists' });
            }
        }

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (color) updateData.color = color;
        if (icon) updateData.icon = icon;
        if (isStarred !== undefined) updateData.isStarred = isStarred;

        const updatedFolder = await Folder.findByIdAndUpdate(
            folderId,
            updateData,
            { new: true }
        );

        res.status(200).json({
            message: 'Folder updated successfully',
            folder: updatedFolder
        });

    } catch (error) {
        console.error('Error updating folder:', error);
        res.status(500).json({
            error: 'Failed to update folder',
            details: error.message
        });
    }
};

export const deleteFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const { userId } = req.params;
        const { moveToRoot } = req.query;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Check if folder has subfolders
        const subfolders = await Folder.find({ parentFolderId: folderId });
        if (subfolders.length > 0) {
            return res.status(400).json({
                error: 'Cannot delete folder with subfolders. Please move or delete subfolders first.'
            });
        }

        // Move documents to root if moveToRoot is true
        if (moveToRoot === 'true') {
            const Document = (await import('../models/document.model.js')).default;
            await Document.updateMany(
                { folderId: folderId },
                { folderId: null }
            );
        }

        await Folder.findByIdAndDelete(folderId);

        res.status(200).json({
            message: 'Folder deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({
            error: 'Failed to delete folder',
            details: error.message
        });
    }
};

export const moveFolder = async (req, res) => {
    try {
        const { folderId } = req.params;
        const { newParentFolderId } = req.body;
        const { userId } = req.params;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ error: 'Folder not found' });
        }

        // Prevent moving folder into itself or its subfolders
        if (newParentFolderId) {
            const targetFolder = await Folder.findOne({ _id: newParentFolderId, userId });
            if (!targetFolder) {
                return res.status(404).json({ error: 'Target folder not found' });
            }

            // Check for circular reference
            let currentParent = targetFolder.parentFolderId;
            while (currentParent) {
                if (currentParent.toString() === folderId) {
                    return res.status(400).json({
                        error: 'Cannot move folder into its own subfolder'
                    });
                }
                const parentFolder = await Folder.findById(currentParent);
                currentParent = parentFolder ? parentFolder.parentFolderId : null;
            }
        }

        folder.parentFolderId = newParentFolderId || null;
        await folder.save();

        res.status(200).json({
            message: 'Folder moved successfully',
            folder
        });

    } catch (error) {
        console.error('Error moving folder:', error);
        res.status(500).json({
            error: 'Failed to move folder',
            details: error.message
        });
    }
};

