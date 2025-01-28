const express = require("express");
const { check, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const router = express.Router();
const Policy = require("../models/Policy");
const authMiddleware = require("../middlewares/authMiddleware");

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("❌ Error:", error.message);
  res.status(statusCode).json({
    error: "Server error",
    details: error.message,
  });
};

// **Helper para formatear pólizas**
const formatPolicy = (policy) => ({
  id: policy._id,
  user: policy.user,
  type: policy.type,
  coverage: policy.coverage,
  premium: policy.premium,
  remainingBalance: policy.remainingBalance || 0,
  startDate: policy.startDate.toISOString().split("T")[0],
  endDate: policy.endDate.toISOString().split("T")[0],
  status: policy.status,
});

// **Adquirir una póliza**
router.post(
  "/acquire",
  authMiddleware,
  [
    check("type", "Type is required").notEmpty(),
    check("coverage", "Coverage must be a positive number").isFloat({ gt: 0 }),
    check("premium", "Premium must be a positive number").isFloat({ gt: 0 }),
    check("startDate", "Start date must be a valid ISO8601 date").isISO8601(),
    check("endDate", "End date must be a valid ISO8601 date").isISO8601(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, coverage, premium, startDate, endDate } = req.body;

    try {
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          error: "Start date must be earlier than end date",
        });
      }

      const newPolicy = new Policy({
        user: req.user.id,
        type,
        coverage: parseFloat(coverage),
        premium: parseFloat(premium),
        startDate,
        endDate,
        status: "active",
      });

      await newPolicy.save();

      res.status(201).json({
        message: "Policy acquired successfully",
        data: formatPolicy(newPolicy),
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

// **Consultar todas las pólizas del usuario autenticado**
router.get("/", authMiddleware, async (req, res) => {
  try {
    const { type, status, sortBy, order, minBalance } = req.query;
    const filters = { user: req.user.id };
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (minBalance) filters.remainingBalance = { $gte: parseFloat(minBalance) };

    const validSortFields = ["startDate", "endDate", "coverage", "premium"];
    if (sortBy && !validSortFields.includes(sortBy)) {
      return res.status(400).json({
        error: "Invalid sort field. Allowed fields: startDate, endDate, coverage, premium.",
      });
    }

    const sortOptions = sortBy ? { [sortBy]: order === "desc" ? -1 : 1 } : { startDate: -1 };

    const policies = await Policy.find(filters).sort(sortOptions);
    res.json({
      message: "Policies retrieved successfully",
      data: policies.map(formatPolicy),
    });
  } catch (error) {
    handleError(res, error);
  }
});

// **Obtener detalles de una póliza específica**
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid policy ID" });
    }

    const policy = await Policy.findOne({ _id: req.params.id, user: req.user.id });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json({
      message: "Policy details retrieved successfully",
      data: formatPolicy(policy),
    });
  } catch (error) {
    handleError(res, error);
  }
});

// **Eliminar una póliza**
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: "Invalid policy ID" });
    }

    const policy = await Policy.findOneAndDelete({ _id: req.params.id, user: req.user.id });

    if (!policy) {
      return res.status(404).json({ message: "Policy not found" });
    }

    res.json({ message: "Policy deleted successfully" });
  } catch (error) {
    handleError(res, error);
  }
});

// **Actualizar una póliza**
router.put(
  "/:id",
  authMiddleware,
  [
    check("type", "Type must be a valid string").optional().notEmpty(),
    check("coverage", "Coverage must be a positive number").optional().isFloat({ gt: 0 }),
    check("premium", "Premium must be a positive number").optional().isFloat({ gt: 0 }),
    check("startDate", "Start date must be valid ISO8601 format").optional().isISO8601(),
    check("endDate", "End date must be valid ISO8601 format").optional().isISO8601(),
    check("status", "Status must be a valid string").optional().notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, coverage, premium, startDate, endDate, status } = req.body;

    try {
      if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          error: "Start date must be earlier than end date",
        });
      }

      const updateData = { type, coverage, premium, startDate, endDate, status };
      Object.keys(updateData).forEach((key) => {
        if (!updateData[key]) delete updateData[key];
      });

      const updatedPolicy = await Policy.findOneAndUpdate(
        { _id: req.params.id, user: req.user.id },
        updateData,
        { new: true }
      );

      if (!updatedPolicy) {
        return res.status(404).json({ message: "Policy not found" });
      }

      res.json({
        message: "Policy updated successfully",
        data: formatPolicy(updatedPolicy),
      });
    } catch (error) {
      handleError(res, error);
    }
  }
);

module.exports = router;
