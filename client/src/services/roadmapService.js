// src/services/roadmapService.js

import api from './api';

export const roadmapService = {
  generate: (data) =>
    api.post('/roadmaps/generate', typeof data === 'string' ? { reportId: data } : data),
  getAll: () => api.get('/roadmaps'),
  getById: (id) => api.get(`/roadmaps/${id}`),
  updateTopicStatus: (topicId, status) =>
    api.patch(`/roadmaps/topics/${topicId}/status`, { status }),
};

export default roadmapService;
