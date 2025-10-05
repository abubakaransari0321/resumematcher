import axiosInstance from './axios';

export const resumeService = {
  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/resumes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getResumes: async (limit = 100, offset = 0) => {
    const response = await axiosInstance.get('/resumes', {
      params: { limit, offset },
    });
    return response.data;
  },

  getResumeById: async (id) => {
    const response = await axiosInstance.get(`/resumes/${id}`);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await axiosInstance.delete(`/resumes/${id}`);
    return response.data;
  },
};
