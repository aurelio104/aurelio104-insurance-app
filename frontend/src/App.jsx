import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PoliciesPage from "./pages/PoliciesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/NotFoundPage";
import UserPage from "./pages/UserPage";
import StatsPage from "./pages/StatsPage";
import SimulatorPage from "./pages/SimulatorPage";
import ReportClaimPage from "./pages/ReportClaimPage";
import SimulatorSalud from "./pages/SimulatorSalud";
import SimulatorAuto from "./pages/SimulatorAuto";
import SimulatorHogar from "./pages/SimulatorHogar";
import SimulatorVida from "./pages/SimulatorVida";

// Componente para rutas protegidas
const ProtectedRoute = ({ isAuthenticated, children }) => {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/main" replace />}
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/main" replace />}
        />
        <Route
          path="/forgot-password"
          element={!isAuthenticated ? <ForgotPasswordPage /> : <Navigate to="/main" replace />}
        />

        {/* Rutas protegidas */}
        <Route path="/main" element={<ProtectedRoute isAuthenticated={isAuthenticated}><MainPage /></ProtectedRoute>} />
        <Route path="/user" element={<ProtectedRoute isAuthenticated={isAuthenticated}><UserPage /></ProtectedRoute>} />
        <Route path="/policies" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PoliciesPage /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute isAuthenticated={isAuthenticated}><PaymentsPage /></ProtectedRoute>} />
        <Route path="/stats" element={<ProtectedRoute isAuthenticated={isAuthenticated}><StatsPage /></ProtectedRoute>} />
        <Route path="/simulator" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SimulatorPage /></ProtectedRoute>} />
        <Route path="/report-claim" element={<ProtectedRoute isAuthenticated={isAuthenticated}><ReportClaimPage /></ProtectedRoute>} />

        {/* Rutas específicas de simuladores protegidas */}
        <Route path="/simulator/salud" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SimulatorSalud /></ProtectedRoute>} />
        <Route path="/simulator/auto" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SimulatorAuto /></ProtectedRoute>} />
        <Route path="/simulator/hogar" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SimulatorHogar /></ProtectedRoute>} />
        <Route path="/simulator/vida" element={<ProtectedRoute isAuthenticated={isAuthenticated}><SimulatorVida /></ProtectedRoute>} />

        {/* Redirección automática en la raíz */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/main" replace /> : <Navigate to="/login" replace />} />

        {/* Página 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
