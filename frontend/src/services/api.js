import axios from 'axios';

// Backend runs on port 8000
const API_BASE_URL = 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const getApiBaseUrl = () => API_BASE_URL;

export const analyzeVideo = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  
  try {
    const response = await apiClient.post('/analyze', formData, {
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading video:', error);
    throw error;
  }
};
