import axios from 'axios';

const api = axios.create({
    baseURL: 'http://your-api-endpoint', // Replace with your backend REST base URL
});

export default api;