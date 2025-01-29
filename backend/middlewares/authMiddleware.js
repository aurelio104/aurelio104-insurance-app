const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el encabezado de autorización
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided, authorization denied" });
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar los datos del usuario decodificados al objeto req
    next();
  } catch (err) {
    console.error("Error en la verificación del token:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
