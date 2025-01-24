import axios from "axios";

// Base URL del backend
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Crear una instancia de Axios
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // Asegúrate de que `/api` se añade aquí.
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para incluir el token JWT en cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]:", error.message);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Manejar tokens expirados
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.error === "jwt expired" &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No hay token de renovación disponible.");
        }

        // Solicitar un nuevo token usando el token de renovación
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh-token`, {
          refreshToken,
        });

        // Guardar el nuevo token en el almacenamiento local
        localStorage.setItem("token", data.token);

        // Actualizar el encabezado de la solicitud original
        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (err) {
        console.error("[Token Refresh Error]:", err.message);

        // Limpiar almacenamiento local y redirigir al login si falla la renovación
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.alert("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
        window.location.href = "/login";
      }
    }

    // Manejar errores de permisos
    if (error.response && error.response.status === 403) {
      console.error("[Permission Error]:", error.response.data);
      window.alert("No tienes permisos para realizar esta acción.");
    }

    // Manejar errores de rutas no encontradas
    if (error.response && error.response.status === 404) {
      console.error("[Not Found Error]:", error.response.config.url);
      window.alert("El recurso solicitado no fue encontrado.");
    }

    // Manejo genérico de errores de red
    if (!error.response) {
      console.error("[Network Error]:", error.message);
      window.alert("Hubo un problema de red. Por favor, revisa tu conexión.");
    }

    return Promise.reject(error);
  }
);

export default api;
