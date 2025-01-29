// Formatea un valor numérico como moneda en USD
export const formatCurrency = (value) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(value);
  
  // Formatea una fecha en un formato legible
  export const formatDate = (date) =>
    new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  