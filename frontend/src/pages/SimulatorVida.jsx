import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  MenuItem,
  Menu,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "../services/axios";
import { useNavigate } from "react-router-dom";
import "../stylespages.css";

const SimulatorPage = () => {
  const [formData, setFormData] = useState({
    age: "",
    type: "",
    coverage: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post("/simulator", formData);
      setResult(response.data);
    } catch (err) {
      console.error("Error simulating policy:", err);
      setError(
        err.response?.data?.error ||
          "Error al calcular la prima. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAcquirePolicy = async () => {
    setLoading(true);
    setError(null);

    try {
      const { type, coverage, premium } = result;

      const policyData = {
        type,
        coverage,
        premium,
        startDate: new Date().toISOString(),
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      };

      await axios.post("/policies/acquire", policyData);

      // Redirigir al menú principal después de contratar la póliza
      navigate("/main");
    } catch (err) {
      console.error("Error acquiring policy:", err);
      setError(
        err.response?.data?.error ||
          "Error al contratar la póliza. Por favor, intenta nuevamente."
      );
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
           Simulador Poliza de Vida
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
        {/* Formulario del Simulador */}
        <div className="card">
          <h1 className="title">Simulador de Pólizas</h1>
          <form onSubmit={handleSubmit} className="form">
            <TextField
              fullWidth
              margin="normal"
              label="Edad"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
            />
            {/* Lista de opciones de póliza */}
            <TextField
              fullWidth
              margin="normal"
              label="Tipo de Póliza"
              name="type"
              select
              value={formData.type}
              onChange={handleChange}
              required
            >
              <MenuItem value="">
                <em>Selecciona una póliza</em>
              </MenuItem>
              <MenuItem value="auto">Vida</MenuItem>

            </TextField>
            <TextField
              fullWidth
              margin="normal"
              label="Cobertura"
              name="coverage"
              type="number"
              value={formData.coverage}
              onChange={handleChange}
              required
            />
            <Button
              className="quote-button"
                            type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Simular"}
            </Button>
          </form>
          {error && <Alert severity="error">{error}</Alert>}
        </div>

        {/* Resultado */}
        {result && (
          <div className="card">
            <h2 className="title">Resultado</h2>
            <p>Tipo: {result.type}</p>
            <p>Cobertura: ${result.coverage}</p>
            <p>Prima: ${result.premium}</p>
            {/* Botón de contratación */}
            <Button
              className="quote-button"
                            onClick={handleAcquirePolicy}
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : "Contratar Póliza"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulatorPage;
