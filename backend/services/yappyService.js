const { Client } = require("eprezto-yappy");

const YAPPY_SHOP_ID = process.env.YAPPY_SHOP_ID || "TEST_SHOP_ID";
const YAPPY_SECRET_KEY = process.env.YAPPY_SECRET_KEY || "TEST_SECRET_KEY";

// Verificar si las credenciales están configuradas
if (!YAPPY_SHOP_ID || !YAPPY_SECRET_KEY) {
  console.warn(
    "Advertencia: YAPPY_SHOP_ID y YAPPY_SECRET_KEY no están configurados.",
  );
}

// Crear una instancia del cliente Yappy
let yappy;
try {
  yappy = new Client({
    shopId: YAPPY_SHOP_ID,
    secretKey: YAPPY_SECRET_KEY,
  });
} catch (error) {
  throw new Error(`Error inicializando Yappy: ${error.message}`);
}

// Función para generar un enlace de pago
const generatePaymentLink = async (paymentData) => {
  try {
    const paymentLink = yappy.getPaymentURL({
      orderId: paymentData.orderId,
      total: paymentData.total,
      subTotal: paymentData.subTotal,
      taxes: paymentData.taxes || 0,
    });
    return paymentLink;
  } catch (error) {
    throw new Error(`Error generando enlace de pago: ${error.message}`);
  }
};

// Función para verificar el estado de un pago
const verifyPayment = async (reference) => {
  try {
    const paymentStatus = await yappy.getStatus(reference);
    return paymentStatus;
  } catch (error) {
    throw new Error(`Error verificando el estado del pago: ${error.message}`);
  }
};

module.exports = {
  generatePaymentLink,
  verifyPayment,
};
