import express from 'express';
import {
  createStudyGroup,
  getStudyGroups,
  getUserStudyGroups,
  getStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  manageJoinRequest,
  updateStudyGroup,
  getStudyGroupStats,
  generateInviteToken,
  joinViaInviteToken,
  getInviteLink,
  toggleInviteToken,
  inviteUsersToGroup,
  getGroupMessages,
  saveGroupNotes,
  getGroupNotes
} from '../controllers/studyGroup.controller.js';

const router = express.Router();

// Public routes
router.get('/stats', getStudyGroupStats);
router.get('/browse', getStudyGroups);
router.get('/:groupId', getStudyGroup);

// Invite token routes (public)
router.post('/join/:inviteToken', joinViaInviteToken);

// User-specific routes
router.post('/:userId/create', createStudyGroup);
router.get('/:userId/my-groups', getUserStudyGroups);
router.post('/:groupId/join', joinStudyGroup);
router.post('/:groupId/leave', leaveStudyGroup);

// Admin routes
router.post('/:groupId/manage-request', manageJoinRequest);
router.put('/:groupId/update', updateStudyGroup);

// Invite management routes (admin/moderator only)
router.post('/:groupId/generate-invite', generateInviteToken);
router.get('/:groupId/invite-link', getInviteLink);
router.post('/:groupId/toggle-invite', toggleInviteToken);
router.post('/:groupId/invite-users', inviteUsersToGroup);

// Collaborative features routes
router.get('/:groupId/messages', getGroupMessages);
router.get('/:groupId/notes', getGroupNotes);
router.post('/:groupId/notes', saveGroupNotes);

export default router;
