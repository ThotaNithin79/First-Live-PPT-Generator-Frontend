import axios from 'axios';

const api = axios.create({
    baseURL: '/api', 
    headers: {
        // THIS IS THE FIX: This header tells ngrok to skip the warning page
        // so that your friend's background API calls don't get blocked.
        "ngrok-skip-browser-warning": "true"
    }
});

// Request Interceptor (Keep your existing token logic)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor (Keep your existing 401 handling)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

export default api;