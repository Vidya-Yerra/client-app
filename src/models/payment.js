import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    month: {
      type: String,
      required: true,
      enum: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ],
    },
    year: { type: Number, required: true },
    enteredAmount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
  },
  { timestamps: true }
);

// Ensure only one payment per client per month-year combo
paymentSchema.index({ client: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Payment", paymentSchema);
