const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

// Endpoint para simular pólizas
router.post("/", authMiddleware, (req, res) => {
  const { age, type, coverage } = req.body;

  try {
    // Ejemplo básico de cálculo de la prima
    const baseRate = {
      vida: 0.02,
      auto: 0.03,
      salud: 0.05,
      hogar: 0.01,
    };

    if (!baseRate[type]) {
      return res.status(400).json({ error: "Invalid insurance type" });
    }

    const premium = coverage * baseRate[type] * (age / 30); // Cálculo simple

    res.json({
      type,
      coverage,
      premium: premium.toFixed(2),
      message: `The premium for your ${type} insurance is $${premium.toFixed(2)}`,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
