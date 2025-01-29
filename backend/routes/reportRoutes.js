const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Policy = require("../models/Policy");
const Payment = require("../models/Payment");

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("❌ Error:", error.message);
  res.status(statusCode).json({
    error: "Server error",
    details: error.message,
  });
};

// **Historial de pólizas**
router.get("/policies", authMiddleware, async (req, res) => {
  try {
    console.log(`📄 [Reportes] Historial de pólizas para usuario ID: ${req.user.id}`);
    const policies = await Policy.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!policies.length) {
      console.warn("⚠️ [Reportes] No se encontraron pólizas para este usuario.");
      return res.status(200).json({ message: "No policies found", data: [] });
    }

    const formattedPolicies = policies.map((policy) => ({
      id: policy._id,
      type: policy.type,
      coverage: policy.coverage,
      premium: policy.premium,
      status: policy.status,
      startDate: policy.startDate.toISOString().split("T")[0],
      endDate: policy.endDate.toISOString().split("T")[0],
      remainingBalance: policy.remainingBalance || 0,
    }));
    
    res.status(200).json({
      message: "Policies retrieved successfully",
      data: formattedPolicies,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// **Historial de pagos**
router.get("/payments", authMiddleware, async (req, res) => {
  try {
    console.log(`💰 [Reportes] Historial de pagos para usuario ID: ${req.user.id}`);
    const payments = await Payment.find({ user: req.user.id })
      .populate("policy", "type premium remainingBalance")
      .sort({ createdAt: -1 });

    if (!payments.length) {
      console.warn("⚠️ [Reportes] No se encontraron pagos para este usuario.");
      return res.status(200).json({ message: "No payments found", data: [] });
    }

    const formattedPayments = payments.map((payment) => ({
      id: payment._id,
      policyType: payment.policy?.type || "Unknown",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.date ? payment.date.toISOString().split("T")[0] : payment.createdAt.toISOString().split("T")[0], // Usa date o fallback a createdAt
    }));
            
    res.status(200).json({
      message: "Payments retrieved successfully",
      data: formattedPayments,
    });
  } catch (error) {
    handleError(res, error);
  }
});

// **Estadísticas de la cuenta**
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    console.log(`📊 [Reportes] Estadísticas de cuenta para usuario ID: ${req.user.id}`);
    const policies = await Policy.find({ user: req.user.id });
    const payments = await Payment.find({ user: req.user.id });

    const stats = {
      totalPolicies: policies.length || 0,
      totalSpent: payments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPremiums: policies.reduce((sum, policy) => sum + policy.premium, 0),
      totalRemainingBalance: policies.reduce((sum, policy) => sum + (policy.remainingBalance || 0), 0),
    };

    res.status(200).json({
      message: "Account statistics retrieved successfully",
      data: stats,
    });

  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
