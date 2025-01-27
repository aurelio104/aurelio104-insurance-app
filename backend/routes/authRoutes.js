const express = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const { registerUser, loginUser } = require("../controllers/authController");

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

// **Ruta de prueba para verificar la conectividad**
router.get("/", (req, res) => {
  res.status(200).json({ message: "Ruta de autenticación funcionando correctamente" });
});

// **Ruta para registrar un usuario**
router.post(
  "/register",
  authValidations.register,
  async (req, res, next) => {
    console.log("Intentando registrar usuario:", req.body);

    // Validación de campos
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Errores de validación al registrar:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    next(); // Continuar al controlador
  },
  registerUser
);

// **Ruta para iniciar sesión**
router.post(
  "/login",
  authValidations.login,
  async (req, res, next) => {
    console.log("Intentando iniciar sesión con:", req.body);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("Errores de validación al iniciar sesión:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;
      const User = require("../models/User");

      const user = await User.findOne({ email });
      if (!user) {
        console.error("[Login] Usuario no encontrado");
        return res.status(404).json({ error: "Usuario no registrado" });
      }

      next();
    } catch (error) {
      console.error("[Login] Error inesperado:", error.message);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  loginUser
);

// **Ruta para renovar el token JWT usando un refresh token**
router.post("/refresh-token", async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    console.error("Error: No se proporcionó un token de renovación.");
    return res.status(400).json({ error: "No se proporcionó un token de renovación" });
  }

  try {
    // Verificar el token de renovación
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Generar un nuevo token de acceso
    const newToken = jwt.sign(
      { id: decoded.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("Token renovado exitosamente para el usuario:", decoded.id);

    res.json({ token: newToken });
  } catch (err) {
    console.error("Error al renovar el token:", err.message);
    res.status(401).json({ error: "Token de renovación inválido o expirado" });
  }
});

module.exports = router;
