const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    // Obtener el encabezado de autorización
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.warn("[AuthMiddleware] No token provided.");
      return res.status(401).json({ error: "Acceso no autorizado: Token no proporcionado" });
    }

    // Extraer el token
    const token = authHeader.split(" ")[1];

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adjuntar los datos del usuario al objeto req

    console.log("[AuthMiddleware] Usuario autenticado:", decoded.id);
    next();
  } catch (err) {
    console.error("[AuthMiddleware] Error en la verificación del token:", err.message);

    const errorMessage =
      err.name === "TokenExpiredError"
        ? "El token ha expirado, por favor inicia sesión nuevamente."
        : "Token inválido o no autorizado.";

    return res.status(401).json({ error: errorMessage });
  }
};

module.exports = protect;
