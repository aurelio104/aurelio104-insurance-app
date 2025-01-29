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

      console.log("🔍 Buscando póliza con ID:", doc.policy);
      const policy = await Policy.findById(doc.policy);

      if (!policy) {
        console.error("❌ Error: Póliza no encontrada");
        return next(new Error("Policy not found"));
      }

      console.log("✅ Póliza encontrada:", policy._id);

      // 🔄 Calcular el total pagado correctamente
      const totalPaid = await mongoose.model("Payment").aggregate([
        {
          $match: {
            policy: doc.policy,
            status: "completed",
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$amount" },
          },
        },
      ]);

      const paidAmount = totalPaid[0]?.total || 0;
      console.log("💰 Total pagado hasta ahora:", paidAmount);

      // 🏦 Calcular el saldo restante
      const newRemainingBalance = Math.max(policy.premium - paidAmount, 0);
      console.log("💳 Nuevo saldo restante:", newRemainingBalance);

      // 📌 Determinar el nuevo estado de la póliza
      const newStatus = newRemainingBalance === 0 ? "completed" : policy.status;

      // 🔄 Actualizar la póliza de forma explícita en la base de datos
      const updatedPolicy = await Policy.findByIdAndUpdate(
        policy._id,
        {
          remainingBalance: newRemainingBalance,
          status: newStatus,
        },
        { new: true } // Esta opción asegura que obtenemos la versión actualizada del documento
      );

      console.log("✅ Póliza actualizada correctamente:", updatedPolicy);
    }

    next(); // Continuar con la ejecución normal
  } catch (error) {
    console.error("⚠️ [Payment Middleware Error]:", error.message);
    next(error);
  }
});


module.exports = mongoose.model("Payment", paymentSchema);
