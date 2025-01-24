const mongoose = require("mongoose");

// Esquema de pólizas
const policySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, // Relación con el usuario
      ref: "User",
      required: [true, "A policy must be associated with a user"],
    },
    type: {
      type: String,
      required: [true, "Policy type is required"],
      enum: ["vida", "auto", "salud", "hogar"], // Lista de tipos válidos
    },
    coverage: {
      type: Number,
      required: [true, "Coverage amount is required"],
      min: [0, "Coverage cannot be negative"],
    },
    premium: {
      type: Number,
      required: [true, "Premium amount is required"],
      min: [0, "Premium cannot be negative"],
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: "End date must be after the start date",
      },
    },
    status: {
      type: String,
      enum: ["active", "completed", "expired", "cancelled"],
      default: "active",
    },
    payments: [
      {
        amount: {
          type: Number,
          required: [true, "Payment amount is required"],
        },
        date: {
          type: Date,
          default: Date.now,
        },
        method: {
          type: String,
          enum: [
            "Credit Card",
            "Debit Card",
            "ACH",
            "Cash",
            "Transferencia",
            "Yappy",
            "Zelle",
            "Pago Móvil",
          ],
          required: [true, "Payment method is required"],
        },
      },
    ],
    remainingBalance: {
      type: Number,
      default: 0,
      validate: {
        validator: function (value) {
          return value >= 0; // El saldo restante no puede ser negativo
        },
        message: "Remaining balance cannot be negative",
      },
    },
  },
  {
    timestamps: true, // Agrega automáticamente `createdAt` y `updatedAt`
    toJSON: {
      // Ajusta las respuestas al cliente
      transform(doc, ret) {
        // Formatear valores numéricos como moneda
        ret.coverage = `$${ret.coverage.toLocaleString("en-US", {
          style: "currency",
          currency: "USD",
        }).replace("$US", "")}`;
        ret.premium = `$${ret.premium.toFixed(2)}`;
        ret.remainingBalance = `$${ret.remainingBalance.toFixed(2)}`;
        return ret;
      },
    },
  }
);

// Middleware pre-save para inicializar o actualizar automáticamente el saldo restante
policySchema.pre("save", function (next) {
  if (this.isNew) {
    // Al crear una nueva póliza, el saldo restante se inicializa con el valor de la prima
    this.remainingBalance = parseFloat(this.premium);
  } else {
    // Al actualizar la póliza, recalcular el saldo restante basado en los pagos realizados
    const totalPaid = this.payments.reduce(
      (sum, payment) => sum + parseFloat(payment.amount),
      0
    );
    this.remainingBalance = Math.max(parseFloat(this.premium) - totalPaid, 0);
  }
  next();
});

// Método para registrar un pago
policySchema.methods.addPayment = function (payment) {
  const totalPaid = this.payments.reduce(
    (sum, p) => sum + parseFloat(p.amount),
    0
  ) + parseFloat(payment.amount);

  if (totalPaid > parseFloat(this.premium)) {
    throw new Error(
      "Payment amount exceeds the total premium. Refunds are not allowed."
    );
  }

  this.payments.push(payment);
  this.remainingBalance = Math.max(parseFloat(this.premium) - totalPaid, 0);

  if (this.remainingBalance === 0) {
    this.status = "completed"; // Actualiza el estado a completado si el saldo restante es 0
  }

  return this.save();
};

module.exports = mongoose.model("Policy", policySchema);
