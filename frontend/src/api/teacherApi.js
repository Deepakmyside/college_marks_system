import api from './client';

export const teacherApi = {
  getAssignedGroups: async (teacherId) => (await api.get(`/api/teachers/${teacherId}/students`)).data,
  getExistingMarks: async (params) => (await api.get('/api/marks', { params })).data,
  submitMarks: async (data) => (await api.post('/api/marks', data)).data,
};

export default teacherApi;
