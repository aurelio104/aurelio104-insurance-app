const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      minlength: [3, "El nombre debe tener al menos 3 caracteres"],
      maxlength: [50, "El nombre no puede exceder los 50 caracteres"],
      trim: true, // Elimina espacios innecesarios
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true,
      lowercase: true, // Convierte automáticamente el correo a minúsculas
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Por favor, proporcione un correo electrónico válido",
      ],
    },
    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Roles válidos
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true, // Indica si la cuenta está activa
    },
    resetPasswordToken: {
      type: String, // Token para restablecer contraseña
      default: null,
    },
    resetPasswordExpires: {
      type: Date, // Fecha de expiración del token de restablecimiento
      default: null,
    },
  },
  {
    timestamps: true, // Agrega automáticamente campos `createdAt` y `updatedAt`
  }
);

// Oculta campos sensibles al convertir el documento a JSON
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

// Manejo de errores de clave duplicada con un mensaje claro
UserSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    next(new Error("El correo electrónico ya está registrado"));
  } else {
    next(error);
  }
});

// Middleware para hashear la contraseña antes de guardar
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    console.log("Contraseña original antes del hash:", this.password);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log("Hash generado antes de guardar:", this.password);
    next();
  } catch (error) {
    console.error("Error al hashear contraseña:", error.message);
    next(error);
  }
});

// Middleware para hashear contraseña antes de actualizar
UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update?.password) {
    if (!update.password.startsWith("$2a$")) {
      try {
        const salt = await bcrypt.genSalt(10);
        update.password = await bcrypt.hash(update.password, salt);
        console.log("Contraseña hasheada antes de actualizar:", update.password);
        this.setUpdate(update);
      } catch (error) {
        console.error("Error al hashear contraseña antes de actualizar:", error.message);
        return next(error);
      }
    } else {
      console.log("La contraseña ya está en formato hash. No se hasheará nuevamente.");
    }
  } else {
    console.log("No se proporcionó una contraseña para actualizar.");
  }

  next();
});

// Método para verificar contraseña
UserSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log("Comparación de contraseña:", {
      enteredPassword,
      storedHash: this.password,
      isMatch,
    });
    return isMatch;
  } catch (error) {
    console.error("Error al comparar contraseñas:", error.message);
    throw error;
  }
};

module.exports = mongoose.model("User", UserSchema);
