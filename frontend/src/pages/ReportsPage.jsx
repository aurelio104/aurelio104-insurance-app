import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import {
  CircularProgress,
  Alert,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import "../stylespages.css";
import { useNavigate } from "react-router-dom";

const ReportsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/reports/stats");
        setStats(response.data.data);
      } catch (err) {
        console.error("Error al obtener las estadísticas:", err);
        setError(
          err.response?.data?.message || "Error al cargar los reportes. Por favor, intenta nuevamente."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
            <MenuItem onClick={() => navigate("/report-claim")}>Reporte de Siniestro</MenuItem>
          </Menu>
          <Typography variant="h6" className="app-bar-title">
            Bienvenido, {userData?.name || "Usuario"}
          </Typography>
          <IconButton color="inherit" onClick={logout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Contenedor principal de estadísticas */}
      <div className="content">
        {/* Resumen de estadísticas */}
        <div className="card">
          <h1 className="title">Resumen</h1>
          <p>Total de Pólizas: {stats?.totalPolicies || 0}</p>
          <p>Total Pagado: ${stats?.totalSpent?.toFixed(2) || "0.00"}</p>
          <p>Total Adeudado: ${stats?.totalRemainingBalance?.toFixed(2) || "0.00"}</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
