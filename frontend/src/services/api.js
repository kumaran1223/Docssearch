import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Upload file
export const uploadFile = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};

// Get upload status
export const getUploadStatus = async (fileId) => {
  const response = await api.get(`/upload/status/${fileId}`);
  return response.data;
};

// Search documents
export const searchDocuments = async (query, category = 'All', page = 1) => {
  const response = await api.post('/search', {
    query,
    category: category === 'All' ? undefined : category,
    page,
    limit: 10,
  });
  return response.data;
};

// Get recent searches
export const getRecentSearches = async (limit = 5) => {
  const response = await api.get(`/search/recent?limit=${limit}`);
  return response.data;
};

// Get all files
export const getFiles = async (page = 1, category = 'All') => {
  const params = new URLSearchParams({ page, limit: 20 });
  if (category && category !== 'All') {
    params.append('category', category);
  }
  const response = await api.get(`/files?${params}`);
  return response.data;
};

// Get file by ID
export const getFile = async (fileId) => {
  const response = await api.get(`/files/${fileId}`);
  return response.data;
};

// Get file preview
export const getFilePreview = async (fileId) => {
  const response = await api.get(`/files/${fileId}/preview`);
  return response.data;
};

// Get similar documents
export const getSimilarDocuments = async (fileId, limit = 5) => {
  const response = await api.get(`/files/${fileId}/similar?limit=${limit}`);
  return response.data;
};

// Download file
export const downloadFile = (fileId) => {
  window.open(`${API_BASE_URL}/files/${fileId}/download`, '_blank');
};

// Delete file
export const deleteFile = async (fileId) => {
  const response = await api.delete(`/files/${fileId}`);
  return response.data;
};

// Update file (category, tags, title)
export const updateFile = async (fileId, data) => {
  const response = await api.patch(`/files/${fileId}`, data);
  return response.data;
};

// Get all categories
export const getCategories = async () => {
  const response = await api.get('/categories');
  return response.data;
};

// Create new category
export const createCategory = async (name) => {
  const response = await api.post('/categories', { name });
  return response.data;
};

// Delete category
export const deleteCategory = async (name) => {
  const response = await api.delete(`/categories/${encodeURIComponent(name)}`);
  return response.data;
};

// Get dashboard stats
export const getStats = async () => {
  const response = await api.get('/stats');
  return response.data;
};

// Get category breakdown
export const getCategoryBreakdown = async () => {
  const response = await api.get('/stats/categories');
  return response.data;
};

// Get recent uploads
export const getRecentUploads = async (limit = 10) => {
  const response = await api.get(`/stats/recent-uploads?limit=${limit}`);
  return response.data;
};

// Get search trends
export const getSearchTrends = async (days = 7) => {
  const response = await api.get(`/stats/search-trends?days=${days}`);
  return response.data;
};

export default api;

