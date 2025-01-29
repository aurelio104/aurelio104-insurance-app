import React, { useState, useEffect } from "react";
import {
  CircularProgress,
  Alert,
  Typography,
  Button,
  TextField,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "../services/axios";
import { useNavigate } from "react-router-dom";
import "../stylespages.css";

const ReportClaimPage = () => {
  const [formData, setFormData] = useState({
    policyId: "",
    description: "",
    date: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingPolicies, setLoadingPolicies] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [policies, setPolicies] = useState([]);
  const [reports, setReports] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const response = await axios.get("/policies");
        setPolicies(response.data?.data || []);
      } catch (err) {
        console.error("Error al obtener las pólizas:", err);
        setError("Error al cargar las pólizas. Por favor, intenta nuevamente.");
      } finally {
        setLoadingPolicies(false);
      }
    };

    const fetchReports = async () => {
      try {
        const response = await axios.get("/claims/user-reports");
        setReports(response.data?.data || []);
      } catch (err) {
        console.error("Error al obtener los reportes:", err);
        setError("Error al cargar los reportes. Por favor, intenta nuevamente.");
      } finally {
        setLoadingReports(false);
      }
    };

    fetchPolicies();
    fetchReports();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("/claims/report", formData);
      setSuccess(response.data.message || "Reporte enviado exitosamente.");
      setFormData({ policyId: "", description: "", date: "" });

      const updatedReports = await axios.get("/claims/user-reports");
      setReports(updatedReports.data?.data || []);
    } catch (err) {
      console.error("Error al enviar el reporte:", err);
      setError(err.response?.data?.error || "Error al enviar el reporte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Barra superior */}
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
           Reportar Siniestro
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
        <div className="card">
          {success && <Alert severity="success">{success}</Alert>}
          {error && <Alert severity="error">{error}</Alert>}

          <h1 className="title">Formulario de Reporte</h1>
          <form onSubmit={handleSubmit}>
            {loadingPolicies ? (
              <CircularProgress />
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel id="policy-select-label">Selecciona una Póliza</InputLabel>
                <Select
                  labelId="policy-select-label"
                  name="policyId"
                  value={formData.policyId}
                  onChange={handleInputChange}
                  required
                >
                  {policies.length > 0 ? (
                    policies.map((policy) => (
                      <MenuItem key={policy.id} value={policy.id}>
                        {`${policy.type} (ID: ${policy.id})`}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No tienes pólizas disponibles</MenuItem>
                  )}
                </Select>
              </FormControl>
            )}

            <TextField
              fullWidth
              label="Descripción"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              multiline
              rows={4}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Fecha del Siniestro"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
              margin="normal"
            />
            <Button
              className="quote-button"              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Enviar Reporte"}
            </Button>
          </form>
        </div>

        {/* Lista de reportes */}
        <div className="card">
          <h2 className="title">Tus Reportes</h2>
          {loadingReports ? (
            <CircularProgress />
          ) : reports.length > 0 ? (
            reports.map((report) => (
              <div key={report.id} className="list-item">
                <p>
                  <strong>Póliza:</strong> {report.policyId || "No asociado"}
                </p>
                <p>
                  <strong>Descripción:</strong> {report.description || "Sin descripción"}
                </p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {report.date
                    ? new Date(report.date).toLocaleDateString("es-ES")
                    : "Fecha no disponible"}
                </p>
              </div>
            ))
          ) : (
            <p>No tienes reportes registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportClaimPage;
