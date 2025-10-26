import Version from '../models/version.model.js';
import Document from '../models/document.model.js';

export const saveVersion = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { changeDescription, isManualSave } = req.body;
        const { userId } = req.params;

        // Check if user has access to document
        const document = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        // Get the latest version number
        const latestVersion = await Version.findOne({ documentId })
            .sort({ versionNumber: -1 });

        const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

        const version = new Version({
            documentId,
            userId,
            content: document.content,
            title: document.title,
            versionNumber,
            isManualSave: isManualSave || false,
            changeDescription: changeDescription || (isManualSave ? 'Manual save' : 'Auto-saved version')
        });

        await version.save();

        res.status(201).json({
            message: 'Version saved successfully',
            version
        });

    } catch (error) {
        console.error('Error saving version:', error);
        res.status(500).json({
            error: 'Failed to save version',
            details: error.message
        });
    }
};

export const getVersions = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.params;
        const { limit = 20, offset = 0 } = req.query;

        // Check if user has access to document
        const document = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        const versions = await Version.find({ documentId })
            .sort({ versionNumber: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const totalVersions = await Version.countDocuments({ documentId });

        res.status(200).json({
            versions,
            totalVersions,
            hasMore: (parseInt(offset) + versions.length) < totalVersions
        });

    } catch (error) {
        console.error('Error fetching versions:', error);
        res.status(500).json({
            error: 'Failed to fetch versions',
            details: error.message
        });
    }
};

export const restoreVersion = async (req, res) => {
    try {
        const { documentId, versionId } = req.params;
        const { userId } = req.params;

        // Check if user has access to document
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

        const version = await Version.findOne({
            _id: versionId,
            documentId
        });

        if (!version) {
            return res.status(404).json({ error: 'Version not found' });
        }

        // Update document with version content
        document.content = version.content;
        document.title = version.title;
        document.lastEditedBy = userId;
        await document.save();

        // Create a new version for this restore action
        const latestVersion = await Version.findOne({ documentId })
            .sort({ versionNumber: -1 });

        const newVersion = new Version({
            documentId,
            userId,
            content: document.content,
            title: document.title,
            versionNumber: latestVersion ? latestVersion.versionNumber + 1 : 1,
            isManualSave: true,
            changeDescription: `Restored to version ${version.versionNumber}`
        });

        await newVersion.save();

        res.status(200).json({
            message: 'Document restored successfully',
            document
        });

    } catch (error) {
        console.error('Error restoring version:', error);
        res.status(500).json({
            error: 'Failed to restore version',
            details: error.message
        });
    }
};

export const compareVersions = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { versionId1, versionId2 } = req.query;
        const { userId } = req.params;

        // Check if user has access to document
        const document = await Document.findOne({
            _id: documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        if (!versionId1 || !versionId2) {
            return res.status(400).json({ error: 'Both version IDs are required for comparison' });
        }

        const version1 = await Version.findOne({
            _id: versionId1,
            documentId
        });

        const version2 = await Version.findOne({
            _id: versionId2,
            documentId
        });

        if (!version1 || !version2) {
            return res.status(404).json({ error: 'One or both versions not found' });
        }

        // Simple comparison - in a real app, you'd use a proper diff library
        const comparison = {
            version1: {
                id: version1._id,
                versionNumber: version1.versionNumber,
                title: version1.title,
                createdAt: version1.createdAt,
                changeDescription: version1.changeDescription
            },
            version2: {
                id: version2._id,
                versionNumber: version2.versionNumber,
                title: version2.title,
                createdAt: version2.createdAt,
                changeDescription: version2.changeDescription
            },
            differences: {
                titleChanged: version1.title !== version2.title,
                contentChanged: JSON.stringify(version1.content) !== JSON.stringify(version2.content)
            }
        };

        res.status(200).json({ comparison });

    } catch (error) {
        console.error('Error comparing versions:', error);
        res.status(500).json({
            error: 'Failed to compare versions',
            details: error.message
        });
    }
};

