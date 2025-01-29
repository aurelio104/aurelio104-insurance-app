const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
      required: [true, "Policy is required"],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    method: {
      type: String,
      required: [true, "Payment method is required"],
      enum: [
        "Transferencia",
        "Yappy",
        "Zelle",
        "Pago Móvil",
        "Tarjeta de Crédito",
        "Tarjeta de Débito",
      ],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "completed", "failed"],
    },
    reference: {
      type: String,
      unique: true,
      sparse: true,
    },
    date: {
      type: Date,
      default: Date.now, // Asignar una fecha por defecto al momento de creación
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas frecuentes
paymentSchema.index({ policy: 1, user: 1, createdAt: -1 });

// Middleware post-save para actualizar el saldo restante de la póliza
paymentSchema.post("save", async function (doc, next) {
  try {
    if (doc.status === "completed") {
      const Policy = mongoose.model("Policy");

      // 🔹 Buscar la póliza relacionada
      const policy = await Policy.findById(doc.policy);
      if (!policy) {
        console.error("⚠️ Póliza no encontrada:", doc.policy);
        return next(new Error("Policy not found"));
      }

      // 🔹 Calcular el monto total pagado
      const totalPaid = await mongoose.model("Payment").aggregate([
        { $match: { policy: policy._id, status: "completed" } }, // Asegurar coincidencia con el ID
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      // 🔹 Actualizar saldo restante
      const paidAmount = totalPaid[0]?.total || 0;
      const newRemainingBalance = Math.max(policy.premium - paidAmount, 0);

      policy.remainingBalance = newRemainingBalance;

      // 🔹 Cambiar el estado si el saldo llega a 0
      if (newRemainingBalance === 0) {
        policy.status = "completed";
      }

      await policy.save(); // Guardar cambios en la póliza
    }
    next(); // Continuar ejecución
  } catch (error) {
    console.error("⚠️ [Payment Middleware Error]:", error.message);
    next(error); // Pasar el error a la pila
  }
});


module.exports = mongoose.model("Payment", paymentSchema);
