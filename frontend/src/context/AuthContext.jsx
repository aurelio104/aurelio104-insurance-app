import { createContext, useContext, useState, useEffect, useCallback } from "react";

// Crear el contexto de autenticación
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado para almacenar el token y el estado de autenticación
  const [token, setToken] = useState(() => localStorage.getItem("token")); // Inicializa con el token del almacenamiento local
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("token")); // Estado booleano basado en si hay un token

  // Sincronizar el estado de autenticación cuando cambia el token
  useEffect(() => {
    setIsAuthenticated(!!token); // Si el token existe, el usuario está autenticado
  }, [token]);

  // Manejar el inicio de sesión
  const login = useCallback((newToken) => {
    if (!newToken) {
      console.error("No se proporcionó un token para iniciar sesión.");
      return;
    }
    try {
      localStorage.setItem("token", newToken); // Guarda el token en el almacenamiento local
      setToken(newToken); // Actualiza el estado del token
    } catch (error) {
      console.error("Error guardando el token:", error);
    }
  }, []);

  // Manejar el cierre de sesión
  const logout = useCallback(() => {
    try {
      localStorage.removeItem("token"); // Elimina el token del almacenamiento local
      setToken(null); // Limpia el estado del token
    } catch (error) {
      console.error("Error eliminando el token:", error);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children} {/* Proveer los valores de autenticación a los hijos */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider."); // Error si se usa fuera del proveedor
  }
  return context;
};
