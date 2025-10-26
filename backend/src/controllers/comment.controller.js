import Comment from '../models/comment.model.js';
import Document from '../models/document.model.js';

export const addComment = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { content, position, selectedText } = req.body;
        const { userId } = req.params;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

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

        // Check if comments are allowed
        if (!document.settings.allowComments) {
            return res.status(403).json({ error: 'Comments are not allowed on this document' });
        }

        const comment = new Comment({
            documentId,
            userId,
            content: content.trim(),
            position,
            selectedText: selectedText || ''
        });

        await comment.save();

        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });

    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            error: 'Failed to add comment',
            details: error.message
        });
    }
};

export const getComments = async (req, res) => {
    try {
        const { documentId } = req.params;
        const { userId } = req.params;
        const { resolved } = req.query;

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

        let query = { documentId };
        if (resolved !== undefined) {
            query.resolved = resolved === 'true';
        }

        const comments = await Comment.find(query)
            .sort({ createdAt: -1 })
            .populate('userId', 'username email');

        res.status(200).json({ comments });

    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            error: 'Failed to fetch comments',
            details: error.message
        });
    }
};

export const updateComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { userId } = req.params;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Comment content is required' });
        }

        const comment = await Comment.findOne({
            _id: commentId,
            userId
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or insufficient permissions' });
        }

        comment.content = content.trim();
        await comment.save();

        res.status(200).json({
            message: 'Comment updated successfully',
            comment
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).json({
            error: 'Failed to update comment',
            details: error.message
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.params;

        const comment = await Comment.findOne({
            _id: commentId,
            userId
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or insufficient permissions' });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({
            error: 'Failed to delete comment',
            details: error.message
        });
    }
};

export const resolveComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { userId } = req.params;
        const { resolved } = req.body;

        const comment = await Comment.findOne({
            _id: commentId,
            userId
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found or insufficient permissions' });
        }

        comment.resolved = resolved;
        if (resolved) {
            comment.resolvedBy = userId;
            comment.resolvedAt = new Date();
        } else {
            comment.resolvedBy = null;
            comment.resolvedAt = null;
        }

        await comment.save();

        res.status(200).json({
            message: `Comment ${resolved ? 'resolved' : 'unresolved'} successfully`,
            comment
        });

    } catch (error) {
        console.error('Error resolving comment:', error);
        res.status(500).json({
            error: 'Failed to resolve comment',
            details: error.message
        });
    }
};

export const replyToComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const { userId } = req.params;

        if (!content || content.trim() === '') {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        const comment = await Comment.findById(commentId);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Check if user has access to the document
        const document = await Document.findOne({
            _id: comment.documentId,
            $or: [
                { userId },
                { 'collaborators.userId': userId }
            ]
        });

        if (!document) {
            return res.status(404).json({ error: 'Document not found or insufficient permissions' });
        }

        const reply = {
            userId,
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        comment.replies.push(reply);
        await comment.save();

        res.status(201).json({
            message: 'Reply added successfully',
            reply
        });

    } catch (error) {
        console.error('Error replying to comment:', error);
        res.status(500).json({
            error: 'Failed to add reply',
            details: error.message
        });
    }
};

