import api from '../utils/axios';

export const WhiteboardService = {
  list: (userId, params = {}) =>
    api.get(`/whiteboards/${userId}`, { params }),
  create: (userId, payload) =>
    api.post(`/whiteboards/${userId}`, payload),
  get: (userId, whiteboardId) =>
    api.get(`/whiteboards/${userId}/${whiteboardId}`),
  updateMeta: (userId, whiteboardId, payload) =>
    api.put(`/whiteboards/${userId}/${whiteboardId}`, payload),
  saveCanvas: (userId, whiteboardId, payload) =>
    api.put(`/whiteboards/${userId}/${whiteboardId}/canvas`, payload),
  delete: (userId, whiteboardId) =>
    api.delete(`/whiteboards/${userId}/${whiteboardId}`),
  listCollaborators: (userId, params = {}) =>
    api.get(`/whiteboards/user/${userId}/collaborators`, { params }),
  getInvites: (userId) =>
    api.get(`/whiteboards/user/${userId}/invites`),
  inviteUser: (userId, whiteboardId, payload) =>
    api.post(`/whiteboards/${userId}/${whiteboardId}/invite`, payload),
  respondInvite: (userId, whiteboardId, payload) =>
    api.post(`/whiteboards/${userId}/${whiteboardId}/respond`, payload),
};

export default WhiteboardService;

