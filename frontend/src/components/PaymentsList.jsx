import React from "react";
import { List, ListItem, ListItemText, Divider } from "@mui/material";

const PaymentsList = ({ payments }) => {
  return (
    <List>
      {payments.map((payment) => (
        <React.Fragment key={payment.id}>
          <ListItem>
            <ListItemText
              primary={`Pago: ${payment.paymentId}`}
              secondary={`Monto: $${payment.amount} - Fecha: ${new Date(
                payment.date
              ).toLocaleDateString()}`}
            />
          </ListItem>
          <Divider />
        </React.Fragment>
      ))}
    </List>
  );
};

export default PaymentsList;
