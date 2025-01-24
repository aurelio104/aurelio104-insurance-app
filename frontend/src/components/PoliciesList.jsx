import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Typography,
  Box,
} from "@mui/material";

const PoliciesList = ({ policies }) => {
  if (!policies || policies.length === 0) {
    return (
      <Box textAlign="center" mt={2}>
        <Typography variant="h6" color="textSecondary">
          No hay pólizas disponibles.
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {policies.map((policy) => (
        <React.Fragment key={policy.id}>
          <ListItem>
            <ListItemText
              primary={`Póliza: ${policy.policyNumber || "Sin Número"}`}
              secondary={`Vencimiento: ${
                policy.expiryDate
                  ? new Date(policy.expiryDate).toLocaleDateString()
                  : "No especificado"
              }`}
            />
            <Chip
              label={policy.status === "active" ? "Activa" : "Vencida"}
              color={policy.status === "active" ? "success" : "error"}
              variant="outlined"
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default PoliciesList;
