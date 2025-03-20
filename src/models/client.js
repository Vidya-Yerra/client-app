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
    
    // ✅ Changed from Map to Object
    payments: {
      type: Object, // Use plain object for compatibility
      default: {},
    },
  },
  { timestamps: true }
);

// === 🔄 UTILITY METHODS ===

// Recalculate tick/cross + balances cumulatively
clientSchema.methods.recalculatePayments = function (year) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const yearData = this.payments[year];
  if (!yearData) return;

  let totalExpected = 0;
  let totalPaid = 0;

  months.forEach(month => {
    const monthData = yearData[month] || {};
    const amount = monthData.amount || 0;
    const carried = monthData.carriedFromPrevious || 0;

    totalExpected += this.fixedAmount;
    totalPaid += amount;

    const balance = totalExpected - totalPaid;

    yearData[month] = {
      amount,
      isPaid: totalPaid >= totalExpected,
      carriedFromPrevious: carried,
      balance: balance > 0 ? balance : 0
    };
  });

  this.payments[year] = yearData;
};

// Update a specific month's payment
clientSchema.methods.updateMonthlyPayment = function (year, month, amountToAdd) {
  if (!this.payments[year]) {
    this.payments[year] = {};
  }

  const yearData = this.payments[year];
  const monthData = yearData[month] || {
    amount: 0,
    isPaid: false,
    carriedFromPrevious: 0,
    balance: this.fixedAmount,
  };

  monthData.amount += amountToAdd;
  yearData[month] = monthData;

  this.payments[year] = yearData;
  this.markModified("payments"); // Notify Mongoose that payments has changed
  this.recalculatePayments(year);
};

export default mongoose.model("Client", clientSchema);
