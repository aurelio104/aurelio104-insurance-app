const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");

// Helper para manejar errores
const handleError = (res, error, statusCode = 500) => {
  console.error("Error:", error.message);
  res.status(statusCode).json({ error: "Server error", details: error.message });
};

// **Solicitar restablecimiento de contraseña**
router.post(
  "/forgot-password",
  [check("email", "Please provide a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn("[Forgot Password] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      console.log(`[Forgot Password] Searching for user with email: ${email}`);
      const user = await User.findOne({ email });

      if (!user) {
        console.warn(`[Forgot Password] User not found: ${email}`);
        return res.status(404).json({ message: "User not found" });
      }

      // Generar un token seguro para restablecer la contraseña
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `Please reset your password using the following link: ${resetUrl}`;

      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      console.log(`[Forgot Password] Reset email sent to: ${user.email}`);

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Restablecer contraseña**
router.post(
  "/reset-password",
  [
    check("token", "Token is required").notEmpty(),
    check("password", "Password must be at least 6 characters").isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn("[Reset Password] Validation failed:", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
      console.log("[Reset Password] Verifying reset token...");
      const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        console.warn("[Reset Password] Invalid or expired token");
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      console.log(`[Reset Password] Resetting password for user: ${user.email}`);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      handleError(res, error);
    }
  }
);

module.exports = router;
