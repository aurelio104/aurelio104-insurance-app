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
      const policy = await Policy.findById(doc.policy).populate("payments");

      if (policy) {
        const totalPaid = await mongoose.model("Payment").aggregate([
          { $match: { policy: policy._id, status: "completed" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        const paidAmount = totalPaid[0]?.total || 0;
        policy.remainingBalance = Math.max(policy.premium - paidAmount, 0);
        if (policy.remainingBalance === 0) policy.status = "completed";
        await policy.save();
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Payment", paymentSchema);
