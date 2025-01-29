const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Importar rutas
const userRoutes = require("./routes/userRoutes");
const simulatorRoutes = require("./routes/simulatorRoutes");
const policyRoutes = require("./routes/policyRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const passwordRoutes = require("./routes/passwordRoutes");
const reportRoutes = require("./routes/reportRoutes");
const authRoutes = require("./routes/authRoutes");
const claimRoutes = require("./routes/claimRoutes");

// Cargar variables de entorno
dotenv.config();

// Validar variables de entorno requeridas
const requiredEnvVars = ["MONGO_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "CLIENT_URL"];
const missingVars = requiredEnvVars.filter((env) => !process.env[env]);

if (missingVars.length) {
  console.error("❌ Error: Faltan variables de entorno obligatorias:", missingVars);
  process.exit(1);
}

// Conectar a la base de datos
connectDB()
  .then(() => console.log("✅ Conexión a la base de datos establecida"))
  .catch((err) => {
    console.error("❌ Error al conectar a la base de datos:", err.message);
    process.exit(1);
  });

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware de seguridad
app.use(helmet({ contentSecurityPolicy: false }));

// Configuración de CORS dinámica
const allowedOrigins = [
  process.env.CLIENT_URL?.replace(/\/$/, ""),
  "http://localhost:3000",
  "http://localhost:5173",
  "https://insurance-app-xi.vercel.app",
  "https://insurance-app-sandy.vercel.app",
  "https://wealthy-kellie-aurelio104-48c9a52a.koyeb.app",
  "https://insurance-3gzup83o0-aurelio104s-projects.vercel.app",
  "https://insurance-frq4np317-aurelio104s-projects.vercel.app",
  "https://insurance-99hv2wop0-aurelio104s-projects.vercel.app", // ✅ Agregada la nueva URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`🛑 Origen no permitido por CORS: ${origin}`);
      callback(new Error("No permitido por CORS"));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));

// Middleware para parsear JSON y datos codificados en URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use(morgan("dev"));

// Middleware de debugging detallado
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.ip} ${req.method} ${req.path}`);
  if (Object.keys(req.body).length) console.log("📌 Body:", req.body);
  if (Object.keys(req.query).length) console.log("📌 Query:", req.query);
  if (req.headers.authorization) console.log("🔐 Authorization Header:", req.headers.authorization);
  next();
});

// Configuración de rutas principales
app.use("/api/users", userRoutes);
app.use("/api/simulator", simulatorRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/password", passwordRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/claims", claimRoutes);

// Ruta base para verificar el estado del servidor
app.get("/", (req, res) => {
  res.status(200).json({
    message: "🚀 Bienvenido al servidor de Insurance API",
    status: "Running",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  console.warn(`⚠️ Ruta no encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error(`❌ Error global capturado: ${err.stack || err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "Error interno del servidor",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
  console.log(`🔧 Modo: ${process.env.NODE_ENV || "development"}`);
});
