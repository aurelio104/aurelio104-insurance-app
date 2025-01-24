const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Claim = require("../models/Claim"); // Modelo para manejar los reportes de siniestros

// Ruta para reportar siniestros
router.post("/report", authMiddleware, async (req, res) => {
  const { policyId, description, date } = req.body;

  // Validar los datos recibidos
  if (!policyId || !description || !date) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    // Crear un nuevo reporte en la base de datos
    const newClaim = await Claim.create({
      userId: req.user.id, // Nota: Asegúrate de que `userId` sea correcto en el modelo
      policyId, // Nota: Asegúrate de que `policyId` sea correcto en el modelo
      description,
      date,
    });

    res.status(201).json({ message: "Reporte creado exitosamente.", claim: newClaim });
  } catch (error) {
    console.error("Error al guardar el reporte:", error);
    res.status(500).json({ error: "Error al guardar el reporte. Intente nuevamente." });
  }
});

// Ruta para obtener los reportes del usuario autenticado
router.get("/user-reports", authMiddleware, async (req, res) => {
  try {
    // Buscar los reportes del usuario autenticado
    const reports = await Claim.find({ userId: req.user.id }).populate("policyId");

    // Transformar los datos para enviarlos al cliente
    const transformedReports = reports.map((report) => ({
      id: report._id,
      policyId: report.policyId ? report.policyId._id : "No asociado",
      policyType: report.policyId ? report.policyId.type : "Desconocido",
      description: report.description || "Sin descripción",
      date: report.date
        ? report.date.toISOString() // Enviar fecha en formato ISO para el frontend
        : null,
    }));

    res.status(200).json({ data: transformedReports });
  } catch (err) {
    console.error("Error al obtener reportes del usuario:", err);
    res.status(500).json({ error: "Error al obtener los reportes del usuario." });
  }
});

module.exports = router;
