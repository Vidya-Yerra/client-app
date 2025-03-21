import mongoose from "mongoose";

// Monthly payment schema
const monthlyPaymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, default: 0 }, // Amount paid for the month
    isPaid: { type: Boolean, default: false }, // Tick or cross
    carriedFromPrevious: { type: Number, default: 0 }, // Extra amount carried over
    balance: { type: Number, default: 0 }, // Remaining balance for this month
  },
  { _id: false }
);

// Schema for a year containing months
const yearSchema = new mongoose.Schema(
  {
    January: { type: monthlyPaymentSchema, default: () => ({}) },
    February: { type: monthlyPaymentSchema, default: () => ({}) },
    March: { type: monthlyPaymentSchema, default: () => ({}) },
    April: { type: monthlyPaymentSchema, default: () => ({}) },
    May: { type: monthlyPaymentSchema, default: () => ({}) },
    June: { type: monthlyPaymentSchema, default: () => ({}) },
    July: { type: monthlyPaymentSchema, default: () => ({}) },
    August: { type: monthlyPaymentSchema, default: () => ({}) },
    September: { type: monthlyPaymentSchema, default: () => ({}) },
    October: { type: monthlyPaymentSchema, default: () => ({}) },
    November: { type: monthlyPaymentSchema, default: () => ({}) },
    December: { type: monthlyPaymentSchema, default: () => ({}) },
  },
  { _id: false }
);

// Client schema
const clientSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    fixedAmount: { type: Number, required: true },

    // Using plain object for payments
    payments: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", clientSchema);

