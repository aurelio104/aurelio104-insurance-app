import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axios";
import { formatCurrency } from "../utils/formatters";
import {
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import "../stylespages.css";

const MainPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  // Abrir y cerrar el menú
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Fetch de datos del usuario y estadísticas
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, statsResponse] = await Promise.all([
          axios.get("/users/profile"),
          axios.get("/reports/stats"),
        ]);

        setUserData(userResponse.data.user);
        setStats(statsResponse.data.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        const errorMessage =
          err.response?.data?.message ||
          "Error al cargar los datos. Por favor, intenta nuevamente.";
        setError(errorMessage);

        if (err.response?.status === 401) {
          logout();
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }

    // Scroll al inicio de la página al cargar
    window.scrollTo(0, 0);
  }, [token, logout, navigate]);

  if (loading) {
    return (
      <div className="container">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <Alert severity="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Barra de navegación */}
      <AppBar position="static" className="app-bar">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => navigate("/main")}>Inicio</MenuItem>
            <MenuItem onClick={() => navigate("/policies")}>Pólizas</MenuItem>
            <MenuItem onClick={() => navigate("/payments")}>Pagos</MenuItem>
            <MenuItem onClick={() => navigate("/stats")}>Estadísticas</MenuItem>
            <MenuItem onClick={() => navigate("/simulator")}>Simulador</MenuItem>
            <MenuItem onClick={() => navigate("/report-claim")}>
              Reporte de Siniestro
            </MenuItem>
          </Menu>
          <Typography variant="h6" className="app-bar-title">
            Bienvenido, {userData?.name || "Usuario"}
          </Typography>
          <IconButton color="inherit" onClick={logout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenido principal */}
      <div className="grid">
        {/* Información del Usuario */}
        <div className="card" onClick={() => navigate("/user")}>
          <h2 className="title">Información del Usuario</h2>
          <p><strong>Nombre:</strong> {userData?.name}</p>
          <p><strong>Correo:</strong> {userData?.email}</p>
          <p>
            <strong>Estado de la Cuenta:</strong> {userData?.isActive ? "Activa" : "Inactiva"}
          </p>
          <p>
            <strong>Fecha de Creación:</strong>{" "}
            {new Date(userData?.createdAt).toLocaleDateString() || "N/A"}
          </p>
        </div>

        {/* Estadísticas */}
        <div className="card" onClick={() => navigate("/stats")}>
          <h2 className="title">Estadísticas</h2>
          <p><strong>Total de Pólizas:</strong> {stats?.totalPolicies || 0}</p>
          <p><strong>Total Pagado:</strong> {formatCurrency(stats?.totalSpent) || "$0.00"}</p>
          <p><strong>Total Adeudado:</strong> {formatCurrency(stats?.totalRemainingBalance) || "$0.00"}</p>
        </div>

        {/* Simulador */}
        <div className="card" onClick={() => navigate("/simulator")}>
          <h2 className="title">Simulador</h2>
          <p>Simula diferentes pólizas y opciones de cobertura.</p>
        </div>

        {/* Reporte de Siniestro */}
        <div className="card" onClick={() => navigate("/report-claim")}>
          <h2 className="title">Reporte de Siniestro</h2>
          <p>Reporta un siniestro de manera rápida y sencilla.</p>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
