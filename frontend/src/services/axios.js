import axios from "axios";

// Usar la variable de entorno correcta para Vite
const BASE_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

console.log("API URL en frontend:", BASE_URL);

// Crear una instancia de Axios con configuración predeterminada
const api = axios.create({
  baseURL: `${BASE_URL}/api`, // Asegurar que use "/api"
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
    console.log(`[Request] ${config.method.toUpperCase()} - ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[Axios Request Error]:", error.message);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas exitosas y errores
api.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.status} - ${response.config.url}`);
    console.log("[Response Data]:", response.data);
    return response;
  },
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

        console.log("[Token Refresh] Intentando renovar token...");
        // Solicitar un nuevo token usando el token de renovación
        const { data } = await api.post("/auth/refresh-token", { refreshToken });

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

    // Manejar errores de autenticación y permisos
    if (error.response) {
      switch (error.response.status) {
        case 403:
          console.error("[Permission Error]:", error.response.data);
          window.alert("No tienes permisos para realizar esta acción.");
          break;

        case 404:
          console.error("[Not Found Error]:", error.response.config.url);
          window.alert("El recurso solicitado no fue encontrado.");
          break;

        case 500:
          console.error("[Server Error]:", error.response.data);
          window.alert("Error interno del servidor. Intenta nuevamente más tarde.");
          break;

        default:
          console.error(`[HTTP Error ${error.response.status}]:`, error.response.data);
      }
    } else {
      console.error("[Network Error]: No response received", error.message);
      window.alert("Hubo un problema de red. Por favor, revisa tu conexión.");
    }

    return Promise.reject(error);
  }
);

export default api;
