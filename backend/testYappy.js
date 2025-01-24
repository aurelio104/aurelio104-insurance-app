require("dotenv").config(); // Cargar variables de entorno
const {
  generatePaymentLink,
  verifyPayment,
} = require("./services/yappyService");

const testGeneratePaymentLink = async () => {
  try {
    const paymentData = {
      orderId: "ORDER12345",
      total: 100.0,
      subTotal: 100.0,
      taxes: 0.0,
    };
    const link = await generatePaymentLink(paymentData);
    console.log("Payment Link:", link);
  } catch (error) {
    console.error("Error generating payment link:", error.message);
  }
};

const testVerifyPayment = async () => {
  try {
    const reference = "TEST_REFERENCE";
    const status = await verifyPayment(reference);
    console.log("Payment Status:", status);
  } catch (error) {
    console.error("Error verifying payment status:", error.message);
  }
};

// Llamar funciones de prueba
testGeneratePaymentLink();
testVerifyPayment();
