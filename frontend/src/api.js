// /frontend/src/api.js
import axios from 'axios';

// Create a pre-configured axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
});

// Function to get breed recommendations
export const getRecommendations = async (answers) => {
  try {
    console.log("📤 Sending answers to backend:", answers);

    const response = await api.post('/api/recommend', { answers });
    console.log("📥 Backend response:", response.data);

    return response.data;
  } catch (error) {
    console.error('❌ API Error (getRecommendations):', error);
    throw error.response?.data || { success: false, error: 'Server error' };
  }
};

// Export api instance for possible reuse (other functions can import this)
export default api;
