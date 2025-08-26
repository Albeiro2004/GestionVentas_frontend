import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/Ventas', // tu backend Spring Boot
});

export default api;
