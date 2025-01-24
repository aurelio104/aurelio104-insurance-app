import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PoliciesPage from "./pages/PoliciesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MainPage from "./pages/MainPage"; // Importar la página principal
import NotFoundPage from "./pages/NotFoundPage";
import UserPage from "./pages/UserPage"; // Importar la página del usuario
import StatsPage from "./pages/StatsPage"; // Importar la página de estadísticas
import SimulatorPage from "./pages/SimulatorPage"; // Nueva página para el simulador
import ReportClaimPage from "./pages/ReportClaimPage"; // Nueva página para reportar siniestros
import SimulatorSalud from "./pages/SimulatorSalud";
import SimulatorAuto from "./pages/SimulatorAuto";
import SimulatorHogar from "./pages/SimulatorHogar";
import SimulatorVida from "./pages/SimulatorVida";

// Componente para rutas protegidas
const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useAuth(); // Verificar si el usuario está autenticado

  return (
    <Router>
      <Routes>
        {/* Página de inicio de sesión */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to="/main" replace />
          }
        />

        {/* Página de registro */}
        <Route
          path="/register"
          element={
            !isAuthenticated ? <RegisterPage /> : <Navigate to="/main" replace />
          }
        />

        {/* Página de recuperación de contraseña */}
        <Route
          path="/forgot-password"
          element={
            !isAuthenticated ? (
              <ForgotPasswordPage />
            ) : (
              <Navigate to="/main" replace />
            )
          }
        />

        {/* Página principal protegida */}
        <Route
          path="/main"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <MainPage />
            </ProtectedRoute>
          }
        />

        {/* Página de usuario protegida */}
        <Route
          path="/user"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <UserPage />
            </ProtectedRoute>
          }
        />

{/* Página del simulador de salud protegida */}
<Route
  path="/SimulatorSalud"
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <SimulatorSalud />
    </ProtectedRoute>
  }
/>

<Route
  path="/SimulatorAuto"
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <SimulatorAuto />
    </ProtectedRoute>
  }
/>


<Route
  path="/SimulatorHogar"
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <SimulatorHogar />
    </ProtectedRoute>
  }
/>



<Route
  path="/SimulatorVida"
  element={
    <ProtectedRoute isAuthenticated={isAuthenticated}>
      <SimulatorVida />
    </ProtectedRoute>
  }
/>



        {/* Página de pólizas protegida */}
        <Route
          path="/policies"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PoliciesPage />
            </ProtectedRoute>
          }
        />

        {/* Página de pagos protegida */}
        <Route
          path="/payments"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <PaymentsPage />
            </ProtectedRoute>
          }
        />

        {/* Página de estadísticas protegida */}
        <Route
          path="/stats"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <StatsPage />
            </ProtectedRoute>
          }
        />

        {/* Página del simulador protegida */}
        <Route
          path="/simulator"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <SimulatorPage />
            </ProtectedRoute>
          }
        />

        {/* Página para reportar siniestros protegida */}
        <Route
          path="/report-claim"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ReportClaimPage />
            </ProtectedRoute>
          }
        />

        {/* Ruta raíz redirige según el estado de autenticación */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/main" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta para manejar 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
