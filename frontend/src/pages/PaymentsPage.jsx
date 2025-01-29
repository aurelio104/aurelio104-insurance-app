import React, { useEffect, useState } from "react";
import {
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  MenuItem,
  TextField,
  Menu,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuIcon from "@mui/icons-material/Menu";
import axios from "../services/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../stylespages.css";
import { formatCurrency } from "../utils/formatters";

const PaymentsPage = () => {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPolicyId, setSelectedPolicyId] = useState("");
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const paymentMethods = [
    "Transferencia",
    "Yappy",
    "Zelle",
    "Pago Móvil",
    "Tarjeta de Crédito",
    "Tarjeta de Débito",
  ];

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [paymentsResponse, policiesResponse] = await Promise.all([
        axios.get("/payments"),
        axios.get("/policies"),
      ]);

      setPayments(paymentsResponse.data.data || []);
      setPolicies(
        (policiesResponse.data.data || []).map((policy) => ({
          ...policy,
          premium: policy.premium || 0,
          remainingBalance: policy.remainingBalance || 0,
        }))
      );
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.message || "Error al cargar los datos. Por favor, intenta nuevamente."
      );
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePolicySelection = (policyId) => {
    setSelectedPolicyId(policyId);
    const selectedPolicy = policies.find((policy) => policy.id === policyId);
    setRemainingBalance(selectedPolicy ? selectedPolicy.remainingBalance : 0);
  };

  const handlePayment = async () => {
    if (!amount || !selectedPolicyId || !paymentMethod) {
      alert("Por favor, selecciona una póliza, un método de pago y un monto válido.");
      return;
    }
    try {
      const response = await axios.post("/payments", {
        policyId: selectedPolicyId,
        amount: parseFloat(amount),
        method: paymentMethod,
      });
      alert(response.data.message || "Pago realizado con éxito");
      fetchData();
      setAmount("");
      setSelectedPolicyId("");
      setPaymentMethod("");
      setRemainingBalance(0);
    } catch (err) {
      console.error("Error processing payment:", err);
      alert(
        err.response?.data?.error || "Error al procesar el pago. Intenta nuevamente."
      );
    }
  };

  useEffect(() => {
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
           Pagos Realizados
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
        {/* Historial de Pagos */}
        <div className="card">
          <h1 className="title">Historial de Pagos</h1>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <div key={index} className="list-item">
                <p><strong>Monto:</strong> {formatCurrency(payment.amount)}</p>
                <p>
                  <strong>Fecha:</strong>{" "}
                  {payment.date
                    ? new Date(payment.date).toLocaleDateString()
                    : "Fecha no disponible"}
                </p>
              </div>
            ))
          ) : (
            <p>No hay pagos registrados.</p>
          )}
        </div>

        {/* Realizar Pago */}
        <div className="card">
          <h2 className="title">Realizar Pago</h2>
          <TextField
            select
            label="Selecciona una Póliza"
            value={selectedPolicyId}
            onChange={(e) => handlePolicySelection(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {policies.map((policy) => (
              <MenuItem key={policy.id} value={policy.id}>
                {`${policy.type} (Balance: ${formatCurrency(policy.remainingBalance)})`}
              </MenuItem>
            ))}
          </TextField>

          {selectedPolicyId && (
            <Typography sx={{ mb: 2 }}>
              <strong>Monto de la deuda:</strong> {formatCurrency(remainingBalance)}
            </Typography>
          )}

          <TextField
            type="number"
            label="Monto a pagar"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Método de Pago"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          >
            {paymentMethods.map((method, index) => (
              <MenuItem key={index} value={method}>
                {method}
              </MenuItem>
            ))}
          </TextField>

          <Button className="quote-button" 
            onClick={handlePayment}
            fullWidth
          >
            Pagar / Abonar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
