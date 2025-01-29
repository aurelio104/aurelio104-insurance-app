const express = require("express");
const router = express.Router();
const User = require("../models/User");
const ConnectionLog = require("../models/ConnectionLog");
const { check, validationResult } = require("express-validator");
const authMiddleware = require("../middlewares/authMiddleware");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("❌ Error:", error.message);
  res.status(statusCode).json({
    error: "Server error",
    details: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
};

// **Obtener perfil del usuario autenticado**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      console.error("⚠️ [Perfil] No se encontró el ID del usuario en la solicitud.");
      return res.status(400).json({ error: "No se pudo verificar el usuario." });
    }

    console.log(`🔎 [Perfil] Obteniendo datos del usuario con ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      console.error("⚠️ [Perfil] Usuario no encontrado.");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ message: "✅ Perfil de usuario obtenido con éxito.", user });
  } catch (error) {
    handleError(res, error);
  }
});

// **Actualizar perfil del usuario**
router.put(
  "/update",
  authMiddleware,
  [
    check("name").optional().isLength({ min: 3 }).withMessage("El nombre debe tener al menos 3 caracteres"),
    check("email").optional().isEmail().withMessage("Proporcione un correo electrónico válido"),
    check("password").optional().isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log(`✏️ [Actualizar Perfil] Actualizando usuario con ID: ${req.user.id}`);
      const { name, email, password } = req.body;
      const updates = { name, email };

      if (password) updates.password = password; // Se maneja el hash en el modelo User

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      res.json({
        message: "✅ Perfil actualizado con éxito.",
        user: { id: updatedUser._id, name: updatedUser.name, email: updatedUser.email },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Restablecimiento de contraseña**
router.post(
  "/forgot-password",
  [check("email").isEmail().withMessage("Proporcione un correo electrónico válido")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      console.log(`🔎 [Restablecimiento Contraseña] Buscando usuario: ${email}`);
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password/${resetToken}`;
      const message = `Haga clic en el enlace para restablecer su contraseña: ${resetUrl}`;

      await sendEmail({ to: user.email, subject: "🔑 Restablecimiento de contraseña", text: message });

      res.json({ message: "📧 Correo de restablecimiento de contraseña enviado." });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Historial de conexiones**
router.get("/history", authMiddleware, async (req, res) => {
  try {
    console.log(`📜 [Historial de Conexiones] Usuario ID: ${req.user.id}`);
    const history = await ConnectionLog.find({ user: req.user.id }).sort({ date: -1 });

    res.json({ message: "📊 Historial obtenido con éxito.", history });
  } catch (err) {
    handleError(res, err);
  }
});

// **Obtener datos del usuario autenticado**
router.get("/me", authMiddleware, async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(400).json({ error: "No se pudo verificar el usuario." });
    }

    console.log(`🔎 [Perfil] Obteniendo perfil del usuario ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select("name email role isActive");

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
