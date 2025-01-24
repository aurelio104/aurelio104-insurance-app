const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Policy = require("../models/Policy");
const Payment = require("../models/Payment");

// **Historial de pólizas**
router.get("/policies", authMiddleware, async (req, res) => {
  try {
    console.log(`[Reportes] Obteniendo historial de pólizas para el usuario: ${req.user.id}`);
    const policies = await Policy.find({ user: req.user.id }).sort({ createdAt: -1 });

    if (!policies.length) {
      console.warn("[Reportes] No se encontraron pólizas para este usuario.");
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
      remainingBalance: policy.remainingBalance,
    }));
    
    res.status(200).json({
      message: "Policies retrieved successfully",
      data: formattedPolicies,
    });
  } catch (error) {
    console.error("[Reportes] Error al obtener el historial de pólizas:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// **Historial de pagos**
router.get("/payments", authMiddleware, async (req, res) => {
  try {
    console.log(`[Reportes] Obteniendo historial de pagos para el usuario: ${req.user.id}`);
    const payments = await Payment.find({ user: req.user.id })
      .populate("policy", "type premium remainingBalance")
      .sort({ createdAt: -1 });

    if (!payments.length) {
      console.warn("[Reportes] No se encontraron pagos para este usuario.");
      return res.status(200).json({ message: "No payments found", data: [] });
    }

    const formattedPayments = payments.map((payment) => ({
      id: payment._id,
      policyType: payment.policy?.type || "Unknown",
      amount: payment.amount,
      method: payment.method,
      status: payment.status,
      date: payment.date ? payment.date : payment.createdAt, // Usa date o fallback a createdAt
    }));
            
    res.status(200).json({
      message: "Payments retrieved successfully",
      data: formattedPayments,
    });
  } catch (error) {
    console.error("[Reportes] Error al obtener el historial de pagos:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// **Estadísticas de la cuenta**
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    console.log(`[Reportes] Obteniendo estadísticas de cuenta para el usuario: ${req.user.id}`);
    const policies = await Policy.find({ user: req.user.id });
    const payments = await Payment.find({ user: req.user.id });

    // Estadísticas inicializadas a 0 si no hay datos
    const stats = {
      totalPolicies: policies.length || 0,
      totalSpent: payments.reduce((sum, payment) => sum + payment.amount, 0),
      totalPremiums: policies.reduce((sum, policy) => sum + policy.premium, 0),
      totalRemainingBalance: policies.reduce(
        (sum, policy) => sum + (policy.remainingBalance || 0),
        0
      ),
    };

    res.status(200).json({
      message: "Account statistics retrieved successfully",
      data: {
        totalPolicies: stats.totalPolicies,
        totalSpent: stats.totalSpent,
        totalPremiums: stats.totalPremiums,
        totalRemainingBalance: stats.totalRemainingBalance,
      },
    });

  } catch (error) {
    console.error("[Reportes] Error al obtener estadísticas de cuenta:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
