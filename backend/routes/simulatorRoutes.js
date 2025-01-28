const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { check, validationResult } = require("express-validator");

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("❌ Error:", error.message);
  res.status(statusCode).json({
    error: "Server error",
    details: error.message,
  });
};

// **Simulación de pólizas**
router.post(
  "/",
  authMiddleware,
  [
    check("age", "La edad es obligatoria y debe ser un número mayor a 0").isInt({ min: 1 }),
    check("type", "El tipo de seguro es obligatorio y debe ser uno válido")
      .isIn(["vida", "auto", "salud", "hogar"]),
    check("coverage", "El monto de cobertura es obligatorio y debe ser mayor a 0").isFloat({ min: 1 }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Simulador] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { age, type, coverage } = req.body;

    try {
      console.log(`🛠️ [Simulador] Calculando prima para ${type} con cobertura de $${coverage} y edad ${age}`);

      // Tarifa base por tipo de seguro
      const baseRate = {
        vida: 0.02,
        auto: 0.03,
        salud: 0.05,
        hogar: 0.01,
      };

      // Cálculo de la prima del seguro
      const premium = coverage * baseRate[type] * (age / 30); 

      res.json({
        message: `✅ La prima estimada para tu seguro de ${type} es de $${premium.toFixed(2)}`,
        type,
        coverage,
        premium: premium.toFixed(2),
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

module.exports = router;
