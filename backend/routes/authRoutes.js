const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// ✅ Ruta de verificación para comprobar que `authRoutes` está funcionando
router.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Ruta de autenticación funcionando correctamente 🚀" });
});

// 📌 Validaciones para autenticación
const authValidations = {
  register: [
    check("name").trim().notEmpty().withMessage("El nombre es obligatorio"),
    check("email").trim().normalizeEmail().isEmail().withMessage("Incluya un correo electrónico válido"),
    check("password").isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  login: [
    check("email").trim().normalizeEmail().isEmail().withMessage("Incluya un correo electrónico válido"),
    check("password").notEmpty().withMessage("La contraseña es obligatoria"),
  ],
};

// **Ruta para registrar un usuario**
router.post(
  "/register",
  authValidations.register,
  async (req, res, next) => {
    console.log("📝 [Registro] Intentando registrar usuario:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Registro] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
  registerUser
);

// **Ruta para iniciar sesión**
router.post(
  "/login",
  authValidations.login,
  async (req, res, next) => {
    console.log("🔑 [Login] Intentando iniciar sesión con:", req.body.email);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Login] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const User = require("../models/User");

      // Verificar si el usuario existe
      const user = await User.findOne({ email });
      if (!user) {
        console.error("🚫 [Login] Usuario no encontrado:", email);
        return res.status(404).json({ error: "Usuario no registrado" });
      }

      next();
    } catch (error) {
      console.error("❌ [Login] Error inesperado:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  loginUser
);

// **Ruta para renovar el token JWT usando un refresh token**
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.error("⚠️ [Token Refresh] No se proporcionó un token de renovación.");
    return res.status(400).json({ error: "No se proporcionó un token de renovación" });
  }

  if (!process.env.JWT_REFRESH_SECRET) {
    console.error("❌ [Token Refresh] JWT_REFRESH_SECRET no está configurado.");
    return res.status(500).json({ error: "Error del servidor: Token de actualización no disponible" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("🔄 [Token Refresh] Token renovado exitosamente para el usuario:", decoded.id);
    res.json({ token: newToken });
  } catch (err) {
    console.error("❌ [Token Refresh] Error al renovar el token:", err.message);
    res.status(401).json({ error: "Token de renovación inválido o expirado" });
  }
});

module.exports = router;
