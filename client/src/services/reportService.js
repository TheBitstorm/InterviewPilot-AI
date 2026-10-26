// src/services/reportService.js

import api from './api';

export const reportService = {
  generate:     (sessionId) => api.post(`/reports/generate/${sessionId}`),
  getAll:       ()          => api.get('/reports'),
  getById:      (id)        => api.get(`/reports/${id}`),
  // The GET /:id endpoint accepts both report ID and session ID
  getBySession: (sessionId) => api.get(`/reports/${sessionId}`),
};
