import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axios";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  CircularProgress,
  Alert,
  Button,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import "../stylespages.css";

const UserPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [updatedData, setUpdatedData] = useState({ name: "", email: "" });
  const [anchorEl, setAnchorEl] = useState(null);

  // Manejo del menú
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
        const response = await axios.get("/users/profile");
        setUserData(response.data.user);
        setUpdatedData({ name: response.data.user.name, email: response.data.user.email });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(
          err.response?.data?.message ||
            "Error al cargar los datos del usuario. Por favor, intenta nuevamente."
        );

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
  }, [token, logout, navigate]);

  const handleEditSubmit = async () => {
    setLoading(true);
    try {
      await axios.put("/users/update", updatedData);
      setUserData((prevData) => ({ ...prevData, ...updatedData }));
      setEditMode(false);
    } catch (err) {
      console.error("Error updating user data:", err);
      setError(
        err.response?.data?.message || "Error al actualizar los datos. Por favor, intenta nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

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
           Perfin de Usuario
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
        {/* Información del Usuario */}
        <div className="card">
          <h2 className="title">Información del Usuario</h2>
          {!editMode ? (
            <>
              <p>Nombre: {userData?.name}</p>
              <p>Correo: {userData?.email}</p>
              <p>Estado: {userData?.isActive ? "Activo" : "Inactivo"}</p>
              <p>
                Fecha de Creación:{" "}
                {new Date(userData?.createdAt).toLocaleDateString() || "N/A"}
              </p>
              <Button className="quote-button" 
                onClick={() => setEditMode(true)}
              >
                Editar Información
              </Button>
            </>
          ) : (
            <>
              <TextField
                className="text-field"
                label="Nombre"
                value={updatedData.name}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, name: e.target.value })
                }
                fullWidth
              />
              <TextField
                className="text-field"
                label="Correo"
                type="email"
                value={updatedData.email}
                onChange={(e) =>
                  setUpdatedData({ ...updatedData, email: e.target.value })
                }
                fullWidth
              />
              <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button className="quote-button"  onClick={handleEditSubmit}>
                  Guardar Cambios
                </Button>
                <Button className="quote-button" 
                  onClick={() => setEditMode(false)}
                >
                  Cancelar
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="card">
          <h2 className="title">Acciones</h2>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Button className="quote-button" 
              onClick={() => navigate("/history")}
            >
              Ver Historial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
