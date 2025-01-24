const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Payment = require("../models/Payment");
const Policy = require("../models/Policy");
const authMiddleware = require("../middlewares/authMiddleware");

// Métodos de pago permitidos
const validPaymentMethods = [
  "Transferencia",
  "Yappy",
  "Zelle",
  "Pago Móvil",
  "Tarjeta de Crédito",
  "Tarjeta de Débito",
];

// **Registrar un nuevo pago**
router.post(
  "/",
  authMiddleware,
  [
    check("policyId", "Policy ID is required").notEmpty(),
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
      return res.status(400).json({ errors: errors.array() });
    }

    const { policyId, amount, method } = req.body;

    try {
      const policy = await Policy.findById(policyId);
      if (!policy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      if (policy.remainingBalance <= 0) {
        return res.status(400).json({ message: "Policy is already fully paid." });
      }

      if (amount > policy.remainingBalance) {
        return res.status(400).json({
          message: `Payment exceeds remaining balance of $${policy.remainingBalance.toFixed(2)}`,
        });
      }

      const newPayment = new Payment({
        policy: policyId,
        user: req.user.id,
        amount,
        method,
        status: "completed",
      });

      await newPayment.save();

      res.status(201).json({
        message: "Payment registered successfully",
        data: newPayment,
      });
    } catch (error) {
      console.error("Error processing payment:", error.message);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// **Actualizar el estado de un pago**
router.put(
  "/:id",
  authMiddleware,
  [
    check("status", "Status is required").notEmpty(),
    check("reference", "Reference must be a string").optional().isString(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, reference } = req.body;

    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        return res.status(404).json({ message: "Payment not found" });
      }

      payment.status = status;
      if (reference) payment.reference = reference;

      await payment.save();

      res.json({
        message: "Payment status updated",
        data: payment,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);

// **Obtener historial de pagos de un usuario**
router.get("/", authMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate("policy", "type coverage premium remainingBalance")
      .sort({ createdAt: -1 });

    res.json({
      message: "Payments retrieved successfully",
      data: payments,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
