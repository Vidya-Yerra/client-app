import express from 'express';
import Payment from '../models/payment.js';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

// POST: Add a payment for a client
router.post('/:clientId', verifyToken, async (req, res) => {
  const { clientId } = req.params;
  const { enteredAmount, month, year } = req.body;

  try {
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    // Only allow user to add payment for their client OR if admin
    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Check if payment already exists for the same month/year
    const existingPayment = await Payment.findOne({ client: clientId, month, year });
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment for this month and year already exists' });
    }

    const payment = new Payment({
      client: clientId,
      enteredAmount,
      month,
      year,
    });
    
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: 'Error adding payment', error: err.message });
  }
});

// GET: Fetch all payments for a specific client
router.get('/client/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const payments = await Payment.find({ client: client._id }).sort({ year: -1, month: -1 });
    res.status(200).json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching payments', error: err.message });
  }
});

// PUT: Update a payment
router.put('/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const client = await Client.findById(payment.client);
    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const updatedPayment = await Payment.findByIdAndUpdate(
      req.params.paymentId,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedPayment);
  } catch (err) {
    res.status(500).json({ message: 'Error updating payment', error: err.message });
  }
});

// DELETE: Delete a payment
router.delete('/:paymentId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    const client = await Client.findById(payment.client);
    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await Payment.findByIdAndDelete(req.params.paymentId);
    res.status(200).json({ message: 'Payment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting payment', error: err.message });
  }
});

export default router;
