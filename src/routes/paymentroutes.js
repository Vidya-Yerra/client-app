import express from 'express';
import Payment from '../models/payment.js';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

const monthOrder = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Recalculate payments map for client
const recalculateClientPayments = async (clientId) => {
  const client = await Client.findById(clientId);
  const payments = await Payment.find({ client: clientId });

  const fixedAmount = client.fixedAmount;
  const paymentMap = {};

  payments.sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month);
  });

  for (const p of payments) {
    if (!paymentMap[p.year]) paymentMap[p.year] = {};
    if (!paymentMap[p.year][p.month]) {
      paymentMap[p.year][p.month] = { amount: 0, isPaid: false, carriedFromPrevious: 0 };
    }

    const current = paymentMap[p.year][p.month];
    const total = current.amount + p.enteredAmount;

    if (total >= fixedAmount) {
      paymentMap[p.year][p.month] = {
        amount: fixedAmount,
        isPaid: true,
        carriedFromPrevious: total - fixedAmount
      };
    } else {
      paymentMap[p.year][p.month] = {
        amount: total,
        isPaid: false,
        carriedFromPrevious: 0
      };
    }
  }

  client.payments = paymentMap;
  await client.save();
  return client;
};

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

    const updatedClient = await recalculateClientPayments(clientId);

    res.status(201).json({ message: 'Payment recorded', payment, updatedClient });
  } catch (err) {
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

    const updatedPayment = await Payment.findByIdAndUpdate(req.params.paymentId, req.body, { new: true });

    const updatedClient = await recalculateClientPayments(client._id);

    res.status(200).json({ message: 'Payment updated', updatedPayment, updatedClient });
  } catch (err) {
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
    const updatedClient = await recalculateClientPayments(client._id);

    res.status(200).json({ message: 'Payment deleted', updatedClient });
  } catch (err) {
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
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
});

export default router;
