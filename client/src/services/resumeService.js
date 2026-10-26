// src/services/resumeService.js

import api from './api';

export const resumeService = {
  upload: (formData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/resumes'),
  getActive: () => api.get('/resumes/active'),
  delete: (id) => api.delete(`/resumes/${id}`),
};

