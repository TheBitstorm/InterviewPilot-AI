// src/services/interviewService.js

import api from './api';

export const interviewService = {
  create: (data) => api.post('/interviews', data),
  getAll: () => api.get('/interviews'),
  getById: (id) => api.get(`/interviews/${id}`),
  generateQuestions: (id, data = {}) => api.post(`/interviews/${id}/questions`, data),
  start: (id) => api.patch(`/interviews/${id}/start`),
  complete: (id) => api.patch(`/interviews/${id}/complete`),
  submitAnswer: (id, data) => api.post(`/interviews/${id}/answers`, data),
};
