// src/api.js
import axios from "axios";
import router from "@/router";
import Swal from "sweetalert2";

const api = axios.create({
  baseURL: "http://localhost:8080/Ventas",
});

// 🔹 Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔹 Manejar respuestas de error globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        Swal.fire("Sesión expirada", "Por favor inicia sesión nuevamente.", "warning");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        router.push("/login");
      } 
      else if (status === 403) {
        Swal.fire("Acceso denegado", "No tienes permisos para realizar esta acción.", "error");
      } 
      else if (status === 404) {
        Swal.fire("No encontrado", "El recurso solicitado no existe.", "info");
      } 
      else if (status >= 500) {
        Swal.fire("Error del servidor", "Intenta más tarde o contacta al administrador.", "error");
      }
    } else {
      Swal.fire("Error de conexión", "No se pudo conectar con el servidor.", "error");
    }

    // 🔹 Importante: devolvemos el error para que los componentes puedan decidir si lo usan
    return Promise.reject(error);
  }
);

export default api;
