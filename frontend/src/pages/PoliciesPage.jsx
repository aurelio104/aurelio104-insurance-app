import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../stylespages.css";

const PoliciesPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [userResponse, policiesResponse, paymentsResponse] = await Promise.all([
          axios.get("/users/profile", { headers }),
          axios.get("/policies", { headers }),
          axios.get("/payments", { headers }),
        ]);

        setUserData(userResponse.data?.user || null);
        setPolicies(policiesResponse.data?.data || []);
        setPayments(paymentsResponse.data?.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(
          err.response?.data?.message ||
            `Error ${err.response?.status || ""}: ${
              err.response?.statusText || "al cargar los datos"
            }.`
        );
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    } else {
      navigate("/login");
    }
  }, [token, navigate]);

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
      <AppBar position="static" className="app-bar" style={{ backgroundColor: "#4a4a4a", color: "#ffffff" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" aria-label="menu" onClick={handleMenuOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate("/main")}>Inicio</MenuItem>
            <MenuItem onClick={() => navigate("/policies")}>Pólizas</MenuItem>
            <MenuItem onClick={() => navigate("/payments")}>Pagos</MenuItem>
            <MenuItem onClick={() => navigate("/stats")}>Estadísticas</MenuItem>
            <MenuItem onClick={() => navigate("/simulator")}>Simulador</MenuItem>
            <MenuItem onClick={() => navigate("/report-claim")}>Reporte de Siniestro</MenuItem>
          </Menu>
          <Typography variant="h6" className="app-bar-title">
           Mis Polizas
          </Typography>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate(-1)}
          >
            <ArrowBackIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      {/* Contenido principal */}
      <div className="grid">
        {/* Resumen de Pólizas */}
        <div className="card">
          <h2 className="title">Pólizas Activas</h2>
          {policies.length > 0 ? (
            policies.map((policy, index) => (
              <div key={policy.id || index} className="list-item">
                <p><strong>Tipo:</strong> {policy.type}</p>
                <p><strong>Estado:</strong> {policy.status}</p>
              </div>
            ))
          ) : (
            <p>No tienes pólizas activas.</p>
          )}
        </div>

        {/* Historial de Pagos */}
        <div className="card">
          <h2 className="title">Historial de Pagos</h2>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={payment.id || index} className="list-item">
                <p><strong>Monto:</strong> ${payment.amount?.toFixed(2) || "0.00"}</p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {payment.date
                    ? new Date(payment.date).toLocaleDateString()
                    : "Fecha no disponible"}
                </p>
              </div>
            ))
          ) : (
            <p>No tienes pagos registrados.</p>
          )}
        </div>

        {/* Botón de Nueva Póliza */}
        <div className="card">
        <Button className="quote-button" 
            onClick={() => navigate("/simulator")}
            fullWidth
          >
            Nueva Póliza
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PoliciesPage;
