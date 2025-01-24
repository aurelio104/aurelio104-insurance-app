import React, { useEffect, useState } from "react";
import axios from "../services/axios";
import { useNavigate } from "react-router-dom";
import { CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";
import "../stylespages.css";

const HistoryPage = () => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/users/history");
        setConnections(response.data.history || []);
      } catch (err) {
        console.error("Error fetching connection history:", err);
        setError("Error al cargar el historial de conexiones.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
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
      {/* Contenedor de tarjeta */}
      <div className="card">
        <h1 className="title">Últimas Conexiones</h1>
        <List>
          {connections.length > 0 ? (
            connections.map((connection, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`Fecha: ${new Date(connection.date).toLocaleString("es-ES")}`}
                  secondary={`IP: ${connection.ip}`}
                />
              </ListItem>
            ))
          ) : (
            <Alert severity="info">No hay historial de conexiones disponible.</Alert>
          )}
        </List>
      </div>
    </div>
  );
};

export default HistoryPage;
