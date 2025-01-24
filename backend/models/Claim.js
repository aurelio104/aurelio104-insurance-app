const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema(
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      policyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Policy",
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Claim", claimSchema);
  