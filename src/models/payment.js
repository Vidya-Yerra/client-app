import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client", required: true },
    month: { type: String, required: true }, 
    year: { type: Number, required: true },  
    enteredAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

// Optional: ensure one payment per month per client
paymentSchema.index({ client: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model("Payment", paymentSchema);
