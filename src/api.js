// src/api.js
import axios from "axios";
import router from "@/router";
import Swal from "sweetalert2";

const apiUrl = process.env.VUE_APP_API_URL;
if (!apiUrl) {
  console.error("VUE_APP_API_URL no está definida!");
}

//const apiUrl = "http://localhost:8080/Ventas";

const api = axios.create({
  baseURL: apiUrl,
});

// 🔹 Inyectar token en cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 👉 flag para no redirigir varias veces
let isRedirecting = false;

// 🔹 Manejar respuestas de error globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (!isRedirecting) {
          isRedirecting = true;
          Swal.fire("Sesión expirada", "Por favor inicia sesión nuevamente.", "warning");
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login").finally(() => {
            isRedirecting = false;
          });
        }
      } 
      else if (status === 403) {
        Swal.fire("Acceso denegado", "¡Intenta Nuevamente!", "error");
      } 
      else if (status === 404) {
        /* Opcional: Swal.fire("No encontrado", "El recurso solicitado no existe.", "info"); */
      } 
      else if (status >= 500) {
        if (!isRedirecting) {
          isRedirecting = true;
          Swal.fire("Error del servidor", "¡Contacta al ADMIN!", "error");
          /*localStorage.removeItem("token");
          localStorage.removeItem("role");
          router.push("/login").finally(() => {
            isRedirecting = false;
          });*/
        }
      }
    } else {
      if (!isRedirecting) {
        isRedirecting = true;
        Swal.fire("Error de conexión", "No se pudo conectar con el servidor.", "error");
        router.push("/login").finally(() => {
          isRedirecting = false;
        });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
