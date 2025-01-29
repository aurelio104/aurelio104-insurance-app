const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const Claim = require("../models/Claim");
const Policy = require("../models/Policy"); // Para verificar la existencia de la póliza

// **Helper para manejar errores**
const handleError = (res, error, statusCode = 500) => {
  console.error("Error:", error.message);
  res.status(statusCode).json({ error: "Server error", details: error.message });
};

// **Ruta para reportar siniestros**
router.post("/report", authMiddleware, async (req, res) => {
  const { policyId, description, date } = req.body;

  // Validación de los datos recibidos
  if (!policyId || !description || !date) {
    return res.status(400).json({ error: "Todos los campos son obligatorios." });
  }

  try {
    console.log(`[Claims] Verificando existencia de póliza: ${policyId}`);
    
    const policyExists = await Policy.findOne({ _id: policyId, user: req.user.id });
    if (!policyExists) {
      console.warn(`[Claims] Póliza no encontrada para el usuario: ${req.user.id}`);
      return res.status(404).json({ error: "No se encontró la póliza asociada." });
    }

    console.log(`[Claims] Creando reporte de siniestro para el usuario: ${req.user.id}`);

    const newClaim = await Claim.create({
      userId: req.user.id,
      policyId,
      description,
      date: new Date(date),
      status: "Pendiente", // Estado inicial del reporte
    });

    res.status(201).json({ message: "Reporte creado exitosamente.", claim: newClaim });
  } catch (error) {
    handleError(res, error);
  }
});

// **Ruta para obtener los reportes del usuario autenticado**
router.get("/user-reports", authMiddleware, async (req, res) => {
  try {
    console.log(`[Claims] Obteniendo reportes para el usuario: ${req.user.id}`);

    const reports = await Claim.find({ userId: req.user.id }).populate("policyId");

    if (!reports.length) {
      console.warn(`[Claims] No se encontraron reportes para el usuario: ${req.user.id}`);
      return res.status(200).json({ message: "No se encontraron reportes", data: [] });
    }

    // Transformar los datos para enviarlos al frontend
    const transformedReports = reports.map((report) => ({
      id: report._id,
      policyId: report.policyId ? report.policyId._id : "No asociado",
      policyType: report.policyId ? report.policyId.type : "Desconocido",
      description: report.description || "Sin descripción",
      date: report.date ? report.date.toISOString() : null,
      status: report.status || "Pendiente",
    }));

    res.status(200).json({ message: "Reportes obtenidos exitosamente.", data: transformedReports });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
