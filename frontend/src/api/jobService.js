import axiosInstance from './axios';

export const jobService = {
  createJob: async (jobData) => {
    const response = await axiosInstance.post('/jobs', jobData);
    return response.data;
  },

  uploadJobDescription: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/jobs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getJobs: async (limit = 100, offset = 0) => {
    const response = await axiosInstance.get('/jobs', {
      params: { limit, offset },
    });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await axiosInstance.get(`/jobs/${id}`);
    return response.data;
  },

  matchResumes: async (jobId) => {
    const response = await axiosInstance.post(`/jobs/${jobId}/match`);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await axiosInstance.delete(`/jobs/${id}`);
    return response.data;
  },
};
