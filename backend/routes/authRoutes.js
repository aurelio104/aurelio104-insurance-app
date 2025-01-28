const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Validaciones para autenticación
const authValidations = {
  register: [
    check("name", "El nombre es obligatorio").notEmpty(),
    check("email", "Incluya un correo electrónico válido").isEmail(),
    check("password", "La contraseña debe tener al menos 6 caracteres").isLength({ min: 6 }),
  ],
  login: [
    check("email", "Incluya un correo electrónico válido").isEmail(),
    check("password", "La contraseña es obligatoria").notEmpty(),
  ],
};

// **Ruta para registrar un usuario**
router.post(
  "/register",
  authValidations.register,
  async (req, res, next) => {
    console.log("[Registro] Intentando registrar usuario:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[Registro] Errores de validación:", errors.array());
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
    console.log("[Login] Intentando iniciar sesión con:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("[Login] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const User = require("../models/User");

      const user = await User.findOne({ email });
      if (!user) {
        console.error("[Login] Error: Usuario no encontrado.");
        return res.status(404).json({ error: "Usuario no registrado" });
      }

      next();
    } catch (error) {
      console.error("[Login] Error inesperado:", error.message);
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  loginUser
);

// **Ruta para obtener datos del usuario autenticado**
router.get("/me", protect, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "No autorizado" });
    }

    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
    });
  } catch (error) {
    console.error("[Perfil] Error obteniendo perfil del usuario:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// **Ruta para renovar el token JWT usando un refresh token**
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.error("[Token Refresh] Error: No se proporcionó un token.");
    return res.status(400).json({ error: "No se proporcionó un token de renovación" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    console.log("[Token Refresh] Token renovado exitosamente para:", decoded.id);

    res.json({ token: newToken });
  } catch (err) {
    console.error("[Token Refresh] Error al renovar el token:", err.message);
    res.status(401).json({ error: "Token de renovación inválido o expirado" });
  }
});

module.exports = router;
