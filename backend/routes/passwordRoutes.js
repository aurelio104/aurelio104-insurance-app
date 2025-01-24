const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const router = express.Router();
const User = require("../models/User");
const { check, validationResult } = require("express-validator");
const sendEmail = require("../utils/sendEmail");


// **Solicitar restablecimiento de contraseña**
router.post(
  "/forgot-password",
  [check("email", "Please provide a valid email").isEmail()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const resetToken = crypto.randomBytes(20).toString("hex");
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
      await user.save();

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
      const message = `Please reset your password using the following link: ${resetUrl}`;

      await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        text: message,
      });

      res.json({ message: "Password reset email sent" });
    } catch (error) {
      console.error("Error requesting password reset:", error.message);
      res.status(500).json({ error: "Server error", details: error.message });
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
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    try {
      const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Error resetting password:", error.message);
      res.status(500).json({ error: "Server error", details: error.message });
    }
  }
);

module.exports = router;
