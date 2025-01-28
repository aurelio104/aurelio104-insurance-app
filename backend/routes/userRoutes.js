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
    details: error.message,
  });
};

// **Obtener perfil del usuario**
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      console.error("⚠️ [Perfil] No se encontró el ID del usuario en la solicitud.");
      return res.status(400).json({ error: "No se pudo verificar el usuario." });
    }

    console.log(`🔎 [Perfil] Obteniendo perfil para el usuario con ID: ${req.user.id}`);
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      console.error("⚠️ [Perfil] Usuario no encontrado.");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    res.json({ message: "Perfil de usuario obtenido con éxito.", user });
  } catch (error) {
    handleError(res, error);
  }
});

// **Actualizar perfil del usuario**
router.put(
  "/update",
  authMiddleware,
  [
    check("name", "El nombre debe tener al menos 3 caracteres").optional().isLength({ min: 3 }),
    check("email", "Proporcione un correo electrónico válido").optional().isEmail(),
    check("password", "La contraseña debe tener al menos 6 caracteres").optional().isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Actualizar Perfil] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      console.log(`✏️ [Actualizar Perfil] Actualizando datos para el usuario con ID: ${req.user.id}`);
      const { name, email, password } = req.body;
      const updates = { name, email };

      if (password) {
        updates.password = password; // Se maneja el hash en el modelo User
      }

      const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updatedUser) {
        console.error("⚠️ [Actualizar Perfil] Usuario no encontrado.");
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      res.json({
        message: "✅ Perfil de usuario actualizado con éxito.",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Restablecimiento de contraseña**
router.post(
  "/forgot-password",
  [check("email", "Proporcione un correo electrónico válido").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error("⚠️ [Restablecimiento Contraseña] Errores de validación:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      console.log(`🔎 [Restablecimiento Contraseña] Buscando usuario con correo: ${email}`);
      const user = await User.findOne({ email });
      if (!user) {
        console.error("⚠️ [Restablecimiento Contraseña] Usuario no encontrado.");
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `Haga clic en el enlace para restablecer su contraseña: ${resetUrl}`;

      await sendEmail({
        to: user.email,
        subject: "🔑 Restablecimiento de contraseña",
        text: message,
      });

      res.json({ message: "📧 Correo de restablecimiento de contraseña enviado." });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Historial de conexiones**
router.get("/history", authMiddleware, async (req, res) => {
  try {
    console.log(`📜 [Historial de Conexiones] Obteniendo historial para el usuario con ID: ${req.user.id}`);
    const history = await ConnectionLog.find({ user: req.user.id }).sort({ date: -1 });

    res.json({ message: "📊 Historial de conexiones obtenido con éxito.", history });
  } catch (err) {
    handleError(res, err);
  }
});

module.exports = router;
