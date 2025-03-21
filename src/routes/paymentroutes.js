import express from 'express';
import Payment from '../models/payment.js';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

function recalculatePayments(client, year) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (!client.payments[year]) return;

  let totalExpected = 0;
  let totalPaid = 0;

  months.forEach(month => {
    if (!client.payments[year][month]) {
      client.payments[year][month] = {
        amount: 0,
        carriedFromPrevious: 0,
        isPaid: false,
        balance: 0
      };
    }

    const monthData = client.payments[year][month];

    const amount = typeof monthData.amount === 'number' ? monthData.amount : 0;

    const carried = monthData.carriedFromPrevious || 0;

    totalExpected += client.fixedAmount;
    totalPaid += amount;

    const balance = totalExpected - totalPaid;

    // Preserve the actual amount entered — do not override
    client.payments[year][month] = {
      ...monthData,
      amount,
      isPaid: totalPaid >= totalExpected,
      carriedFromPrevious: carried,
      balance: balance > 0 ? balance : 0
    };
  });
}

// POST: Add payment
router.post('/:clientId', verifyToken, async (req, res) => {
  const { clientId } = req.params;
  const { enteredAmount, month, year } = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.userId)
      return res.status(403).json({ message: 'Unauthorized access' });

    const payment = new Payment({ client: clientId, enteredAmount, month, year });
    await payment.save();

    if (!client.payments[year]) client.payments[year] = {};
    client.payments[year][month] = {
      amount: enteredAmount,
      isPaid: false,
      carriedFromPrevious: 0,
      balance: 0,
    };

    recalculatePayments(client, year);
    await client.save();

    res.status(201).json({ message: 'Payment recorded', payment });
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: 'Error adding payment', error: err.message });
  }
});

// PUT: Update payment
router.put('/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const client = await Client.findById(payment.client);
    if (client.user.toString() !== req.userId)
      return res.status(403).json({ message: 'Unauthorized access' });

    const { enteredAmount } = req.body;
    payment.enteredAmount = enteredAmount;
    await payment.save();

    if (!client.payments[payment.year]) client.payments[payment.year] = {};
    if (!client.payments[payment.year][payment.month]) {
      client.payments[payment.year][payment.month] = {
        amount: 0,
        isPaid: false,
        carriedFromPrevious: 0,
        balance: 0,
      };
    }

    client.payments[payment.year][payment.month].amount = enteredAmount;

    recalculatePayments(client, payment.year);
    await client.save();

    res.status(200).json({ message: 'Payment updated', updatedPayment: payment });
  } catch (err) {
    console.error("Update payment error:", err);
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
});

// DELETE: Remove payment
router.delete('/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const client = await Client.findById(payment.client);
    if (client.user.toString() !== req.userId)
      return res.status(403).json({ message: 'Unauthorized access' });

    await Payment.findByIdAndDelete(req.params.paymentId);

    // Remove from client.payments
    if (client.payments[payment.year]?.[payment.month]) {
      delete client.payments[payment.year][payment.month];
    }

    recalculatePayments(client, payment.year);
    await client.save();

    res.status(200).json({ message: 'Payment deleted' });
  } catch (err) {
    console.error("Delete payment error:", err);
    res.status(500).json({ message: 'Error deleting payment', error: err.message });
  }
});

// GET: All payments for client
router.get('/client/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.userId)
      return res.status(403).json({ message: 'Unauthorized access' });

    const payments = await Payment.find({ client: client._id }).sort({ year: -1, month: -1 });
    res.status(200).json(payments);
  } catch (err) {
    console.error("Get payments error:", err);
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
});

// POST: Bulk save payments for a client (replaces existing for same year)
router.post('/:clientId/payments', verifyToken, async (req, res) => {
  const { clientId } = req.params;
  const { payments } = req.body;
  console.log("payments:",payments);

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });
    if (client.user.toString() !== req.userId)
      return res.status(403).json({ message: 'Unauthorized access' });

    const yearsToDelete = [...new Set(payments.map(p => p.year))];

    await Payment.deleteMany({ client: clientId, year: { $in: yearsToDelete } });

    const newPayments = payments.map(p => ({
      client: clientId,
      enteredAmount: p.enteredAmount,
      month: p.month,
      year: p.year,
    }));

    await Payment.insertMany(newPayments);

    // Rebuild client.payments from scratch for those years
    for (let year of yearsToDelete) {
      client.payments[year] = {};
      const yearPayments = newPayments.filter(p => p.year === year);
      for (let p of yearPayments) {

        client.payments[year][p.month] = {
          amount: p.enteredAmount,
          isPaid: false,
          carriedFromPrevious: 0,
          balance: 0,
        };
      }
      recalculatePayments(client, year);
    }
    client.markModified('payments');
    console.log("Recalculated payments ",client.payments);
    await client.save();
    const client_1 = await Client.findById(clientId);
    console.log("New payments: ",newPayments);
    console.log("Client Id: ",clientId);
    console.log("Recalculated client after saving client ",client_1, client_1.payments);
    res.status(201).json({ message: 'Payments saved successfully' });
  } catch (err) {
    console.error("Bulk save payments error:", err);
    res.status(500).json({ message: 'Error saving payments', error: err.message });
  }
});

export default router;