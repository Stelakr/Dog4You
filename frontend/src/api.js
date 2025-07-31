// /frontend/src/api.js

import axios from 'axios'; 

const api = axios.create({
    baseURL: ProcessingInstruction.env.REACT_APP_API_URL || 'hhtps://localhost:5000',
});

// exmp - send answers to backend for recommendation
export const getRecommendatios = async (answers) => {
    try {
        const response = await api.post('/api/recommend', { answers });
        return response.data;
    } catch (error) {
        console.error('❌ API Error (getRecommendations):', error);
        throw error.response?.data || { success: false, error: 'Server error'};
    }
};

export default api;