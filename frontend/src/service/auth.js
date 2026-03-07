import axios from 'axios';

const API = 'https://little-coders-production.up.railway.app/api/auth';

export const login = async ({ email, password }) => {
    const response = await axios.post(`${API}/login`, { email, password });
    return response;
};

export const register = (data) => axios.post(`${API}/register`, data);

export const forgotPassword = (data) => axios.post(`${API}/forgot-password`, data);

export const resetPassword = (token, data) =>
    axios.post(`${API}/reset-password/${token}`, data);