import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hodApi = {
  getBranches: async () => {
    const response = await api.get('/api/lookup/branches');
    return response.data;
  },

  getSemesters: async () => {
    const response = await api.get('/api/lookup/semesters');
    return response.data;
  },

  getSections: async () => {
    const response = await api.get('/api/lookup/sections');
    return response.data;
  },

  getDashboard: async (branchId, semesterId, section) => {
    const response = await api.get('/api/hod/dashboard', {
      params: { branchId, semesterId, section }
    });
    return response.data;
  },

  getStudentSummary: async (studentId, semesterId) => {
    const response = await api.get('/api/hod/student-summary', {
      params: { studentId, semesterId }
    });
    return response.data;
  },
};

export default hodApi;
