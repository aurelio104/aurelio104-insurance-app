const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// **Controlador para registrar un usuario**
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log(`[Registro] Intentando registrar usuario: ${JSON.stringify({ name, email })}`);

    // Validación de campos
    if (!name || !email || !password) {
      console.error("[Registro] Validación fallida: Faltan campos obligatorios");
      return res.status(400).json({ message: "Todos los campos son obligatorios." });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.error(`[Registro] Error: El correo ya está registrado: ${email}`);
      return res.status(400).json({ message: "El correo ya está registrado." });
    }

    // Crear un nuevo usuario
    const newUser = new User({ name, email, password }); // Middleware de pre('save') manejará el hasheo
    const savedUser = await newUser.save();

    console.log("[Registro] Usuario creado exitosamente:", {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
    });

    res.status(201).json({
      message: "Usuario registrado exitosamente.",
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
      },
    });
  } catch (error) {
    console.error("[Registro] Error durante el registro:", error.message);
    res.status(500).json({ message: "Error del servidor.", error: error.message });
  }
};

// **Controlador para iniciar sesión**
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log(`[Login] Intentando iniciar sesión con: ${email}`);

    // Buscar usuario por correo electrónico
    const user = await User.findOne({ email });
    if (!user) {
      console.error("[Login] Error: Usuario no encontrado en la base de datos.");
      return res.status(404).json({ error: "Correo o contraseña incorrectos" });
    }

    console.log("[Login] Usuario encontrado:", {
      id: user._id,
      name: user.name,
      email: user.email,
    });

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("[Login] Resultado de comparación de contraseña:", {
      inputPassword: password,
      storedHash: user.password,
      isMatch,
    });

    if (!isMatch) {
      console.error("[Login] Error: Contraseña incorrecta.");
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    // Generar token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log("[Login] Token JWT generado exitosamente para el usuario:", user._id);

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("[Login] Error durante el login:", error.message);
    res.status(500).json({ message: "Error del servidor.", error: error.message });
  }
};

module.exports = { registerUser, loginUser };
