import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../services/axios";
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
import LogoutIcon from "@mui/icons-material/Logout";
import HealthIcon from "@mui/icons-material/LocalHospital";
import CarIcon from "@mui/icons-material/DirectionsCar";
import HomeIcon from "@mui/icons-material/Home";
import ShieldIcon from "@mui/icons-material/Security";
import CheckIcon from "@mui/icons-material/CheckCircle";
import "../stylespages.css";

const MainPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

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
          navigate("/login", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token, logout, navigate]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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

const promotions = [
  {
    title: "Seguro de Salud",
    description: "20% de descuento en farmacias afiliadas con tu seguro de salud.",
    image: "/images/salud.jpg", // ✅ CORRECTO
  },
  {
    title: "Seguro de Auto",
    description: "Revisión gratuita en talleres afiliados con tu seguro de auto.",
    image: "/images/auto.jpg", // ✅ CORRECTO
  },
  {
    title: "Seguro de Hogar",
    description: "Cobertura completa para desastres naturales sin costo adicional.",
    image: "/images/hogar.jpg", // ✅ CORRECTO
  },
  {
    title: "Seguro de Vida",
    description: "Plan de ahorro incluido con tu seguro de vida premium.",
    image: "/images/vida.jpg", // ✅ CORRECTO
  },
];


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
            Bienvenido, {userData?.name || "Usuario"}
          </Typography>
          <IconButton color="inherit" onClick={logout} aria-label="logout">
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <div className="insurance-container">
        <Typography variant="h4" className="insurance-title">Información del Usuario</Typography>
        <div className="card" onClick={() => navigate("/user")}>
          <p><strong>Nombre:</strong> {userData?.name}</p>
          <p><strong>Correo:</strong> {userData?.email}</p>
        </div>
      </div>

      <div className="insurance-container">
        <Typography variant="h4" className="insurance-title">Elige tu Seguro</Typography>
        <Grid container spacing={2} className="insurance-options">
          <Grid item>
            <Card className="selected" onClick={() => navigate("/SimulatorSalud")} sx={{ "&:hover": { boxShadow: 3 } }}>
              <CardContent>
                <HealthIcon />
                <Typography>Salud</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card className="selected" onClick={() => navigate("/SimulatorAuto")} sx={{ "&:hover": { boxShadow: 3 } }}>
              <CardContent>
                <CarIcon />
                <Typography>Autos</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card className="selected" onClick={() => navigate("/SimulatorHogar")} sx={{ "&:hover": { boxShadow: 3 } }}>
              <CardContent>
                <HomeIcon />
                <Typography>Hogar</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item>
            <Card className="selected" onClick={() => navigate("/SimulatorVida")} sx={{ "&:hover": { boxShadow: 3 } }}>
              <CardContent>
                <ShieldIcon />
                <Typography>Vida</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        <Typography variant="body1" className="insurance-info">
          <CheckIcon /> Mi Médico Personal <CheckIcon /> Atención en Casa
        </Typography>
        <Typography variant="h5" className="insurance-price">Desde <strong>$20</strong>.79 USD al mes</Typography>
        <Button className="quote-button" onClick={() => navigate("/simulator")}>COTIZA AQUÍ</Button>
      </div>

      <div className="insurance-container">
        <Typography variant="h4" className="insurance-title">Promociones Especiales</Typography>
        <Grid container spacing={2} className="insurance-options">
          {promotions.map((promo, index) => (
            <Grid item key={index}>
              <Card className="selected" sx={{ "&:hover": { boxShadow: 3 } }}>
                <CardContent>
                  <img src={promo.image} alt={promo.title} className="promo-image" />
                  <Typography variant="h6" className="promo-title">{promo.title}</Typography>
                  <Typography className="promo-description">{promo.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Button className="quote-button" onClick={() => navigate("/simulator")}>VER PROMOCIONES</Button>
      </div>
    </div>
  );
};

export default MainPage;
