const express = require("express");
const { check, validationResult } = require("express-validator");
const Payment = require("../models/Payment");
const Policy = require("../models/Policy");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// Métodos de pago permitidos
const validPaymentMethods = [
  "Transferencia",
  "Yappy",
  "Zelle",
  "Pago Móvil",
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
];

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("❌ Error:", error.message);
  res.status(statusCode).json({ error: "Server error", details: error.message });
};

// **Registrar un nuevo pago**
router.post(
  "/",
  authMiddleware,
  [
    check("policyId", "Policy ID is required").notEmpty().isMongoId(),
    check("amount", "Amount must be a positive number").isFloat({ gt: 0 }),
    check("method")
      .notEmpty()
      .withMessage("Payment method is required")
      .isIn(validPaymentMethods)
      .withMessage(`Payment method must be one of: ${validPaymentMethods.join(", ")}`),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Payment Error] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { policyId, amount, method } = req.body;

    try {
      const policy = await Policy.findById(policyId);
      if (!policy) {
        console.warn(`⚠️ [Payment] Policy not found: ${policyId}`);
        return res.status(404).json({ message: "Policy not found" });
      }

      if (policy.remainingBalance <= 0) {
        console.warn(`⚠️ [Payment] Policy already fully paid: ${policyId}`);
        return res.status(400).json({ message: "Policy is already fully paid." });
      }

      if (amount > policy.remainingBalance) {
        console.warn(`⚠️ [Payment] Payment exceeds remaining balance for policy ${policyId}`);
        return res.status(400).json({
          message: `Payment exceeds remaining balance of $${policy.remainingBalance.toFixed(2)}`,
        });
      }

      // **📌 CREAR PAGO**
      const newPayment = new Payment({
        policy: policyId,
        user: req.user.id,
        amount,
        method,
        status: "completed",
      });

      await newPayment.save();

      // **💰 ACTUALIZAR EL SALDO DE LA PÓLIZA**
      policy.remainingBalance -= amount;
      await policy.save();

      console.log(`✅ [Payment] Payment of $${amount} applied to policy ${policyId}`);
      res.status(201).json({
        message: "Payment registered successfully",
        data: {
          id: newPayment._id,
          policy: policyId,
          user: req.user.id,
          amount,
          method,
          status: newPayment.status,
          remainingBalance: policy.remainingBalance, // Nuevo saldo
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Actualizar el estado de un pago**
router.put(
  "/:id",
  authMiddleware,
  [
    check("status", "Status is required").notEmpty().isString(),
    check("reference", "Reference must be a string").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Update Payment] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reference } = req.body;

    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        console.warn(`⚠️ [Update Payment] Payment not found: ${req.params.id}`);
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.status = status;
      if (reference) payment.reference = reference;
      await payment.save();

      res.json({
        message: "✅ Payment status updated successfully",
        data: payment,
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Obtener historial de pagos de un usuario**
router.get("/", authMiddleware, async (req, res) => {
  try {
    console.log(`📜 [Payments] Retrieving payment history for user: ${req.user.id}`);
    const payments = await Payment.find({ user: req.user.id })
      .populate("policy", "type coverage premium remainingBalance")
      .sort({ createdAt: -1 });

    if (!payments.length) {
      console.warn(`⚠️ [Payments] No payments found for user: ${req.user.id}`);
      return res.status(200).json({ message: "No payments found", data: [] });
    }

    // **📌 FORMATEAR RESPUESTA**
    const formattedPayments = payments.map((payment) => ({
      id: payment._id,
      policyType: payment.policy?.type || "Unknown",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.createdAt.toISOString().split("T")[0], // Fecha en formato YYYY-MM-DD
      remainingBalance: payment.policy?.remainingBalance || 0, // Saldo restante actualizado
    }));

    res.json({
      message: "✅ Payments retrieved successfully",
      data: formattedPayments,
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
