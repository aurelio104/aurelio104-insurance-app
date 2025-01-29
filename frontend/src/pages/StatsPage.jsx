import React, { useEffect, useState } from "react";
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
  Button,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "../stylespages.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const StatsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [policies, setPolicies] = useState([]);
  const [payments, setPayments] = useState([]);
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
      try {
        const [statsResponse, policiesResponse, paymentsResponse] = await Promise.all([
          axios.get("/reports/stats"),
          axios.get("/policies"),
          axios.get("/payments"),
        ]);

        const parsedStats = {
          totalPolicies: statsResponse.data.data?.totalPolicies || 0,
          totalSpent: parseFloat(statsResponse.data.data?.totalSpent || "0") || 0,
          totalRemainingBalance: parseFloat(statsResponse.data.data?.totalRemainingBalance || "0") || 0,
        };

        setStats(parsedStats);
        setPolicies(
          (policiesResponse.data.data || []).map((policy) => ({
            ...policy,
            premium: typeof policy.premium === "string"
              ? parseFloat(policy.premium.replace(/[$,]/g, ""))
              : policy.premium || 0,
            remainingBalance: typeof policy.remainingBalance === "string"
              ? parseFloat(policy.remainingBalance.replace(/[$,]/g, ""))
              : policy.remainingBalance || 0,
          }))
        );
        setPayments(paymentsResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError(
          err.response?.data?.message ||
          "Error al cargar las estadísticas. Por favor, intenta nuevamente."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    window.scrollTo(0, 0);
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

  const totalPolicies = stats?.totalPolicies || 0;
  const totalSpent = formatCurrency(stats?.totalSpent);
  const totalRemainingBalance = formatCurrency(stats?.totalRemainingBalance);

  const policyChartData = {
    labels: policies.map((policy) => policy.type),
    datasets: [
      {
        label: "Pólizas por tipo",
        data: policies.map((policy) => policy.premium || 0),
        backgroundColor: "#3f51b5",
      },
    ],
  };

  const paymentChartData = {
    labels: payments.map((payment) => new Date(payment.date).toLocaleDateString()),
    datasets: [
      {
        label: "Pagos realizados",
        data: payments.map((payment) => payment.amount),
        backgroundColor: "#f50057",
      },
    ],
  };

  return (
    <div className="container">
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
          Estadisticas del Usuario
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

      <div className="grid">
        {/* Resumen de estadísticas */}
        <div className="card">
          <h2 className="title">Total de Pólizas</h2>
          <p>{totalPolicies}</p>
        </div>
        <div className="card">
          <h2 className="title">Total Pagado</h2>
          <p>{totalSpent}</p>
        </div>
        <div className="card">
          <h2 className="title">Total Adeudado</h2>
          <p>{totalRemainingBalance}</p>

          <Button className="quote-button" 

                                           onClick={() => navigate("/payments")}>Pagar / Abonar</Button>

        </div>
      </div>

      {/* Gráficos */}
      <div className="grid">
        <div className="card">
          <h2 className="title">Pólizas por Tipo</h2>
          <div className="chart-container">
            <Bar data={policyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card">
          <h2 className="title">Pagos Realizados</h2>
          <div className="chart-container">
            <Bar data={paymentChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
