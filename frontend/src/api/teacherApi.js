import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const teacherApi = {
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

  getSubjects: async (branchId, semesterId) => {
    const response = await api.get('/api/subjects', {
      params: { branchId, semesterId },
    });
    return response.data;
  },

  getStudents: async (branchId, semesterId, section) => {
    const response = await api.get('/api/students', {
      params: {
        branchId,
        semesterId,
        section,
      },
    });
    return response.data;
  },

  submitMarks: async (data) => {
    const response = await api.post('/api/marks', data);
    return response.data;
  },
};

export default teacherApi;