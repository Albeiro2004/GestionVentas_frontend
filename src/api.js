import axios from "axios";
import router from "@/router"; // asegúrate de tener el router importado

const api = axios.create({
  baseURL: "http://localhost:8080/Ventas",
});

// Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Borrar datos de sesión
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Redirigir al login
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
