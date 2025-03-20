import express from 'express';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';
import { upload } from '../middlewares/uploadmiddleware.js';
import { uploadCSV } from '../controllers/clientcontroller.js';

const router = express.Router();

// Create a new client
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, address, fixedAmount } = req.body;

    const newClient = new Client({
      name,
      email,
      phone,
      address,
      fixedAmount,
      user: req.userId, // Link client to the authenticated user
    });

    const savedClient = await newClient.save();
    res.status(201).json({ client: savedClient });
  } catch (err) {
    res.status(500).json({ message: 'Error creating client', error: err.message });
  }
});

// Get all clients for a logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    // Log the userId to ensure the authentication process is correct
    console.log('Authenticated User ID:', req.userId);

    const clients = await Client.find({ user: req.userId }).sort({ createdAt: -1 });

    // Check if clients exist for the user
    if (!clients || clients.length === 0) {
      return res.status(404).json({ message: 'No clients found for this user.' });
    }

    // Send the clients as a response
    res.status(200).json(clients);
  } catch (err) {
    console.error('Error fetching clients:', err.message);
    res.status(500).json({ message: 'Error fetching clients', error: err.message });
  }
});

// Get a single client
router.get('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Convert Mongoose document to plain JS object
    const clientObj = client.toObject();

    // Convert Map to plain object if payments exist
    if (clientObj.payments instanceof Map) {
      clientObj.payments = Object.fromEntries(clientObj.payments);
    }

    res.status(200).json(clientObj);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching client', error: err.message });
  }
});


// Update a client
router.put('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    const updatedClient = await Client.findByIdAndUpdate(req.params.clientId, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ client: updatedClient });
  } catch (err) {
    res.status(500).json({ message: 'Error updating client', error: err.message });
  }
});

// Delete a client
router.delete('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    await client.deleteOne();
    res.status(200).json({ message: 'Client deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting client', error: err.message });
  }
});

// Save or update payment info
router.post('/:clientId/payments', verifyToken, async (req, res) => {
  try {
    const { clientId } = req.params;
    const paymentUpdates = req.body.payments; // array of { year, month, amount }

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (client.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized access' });
    }

    // Update each payment using method
    for (const payment of paymentUpdates) {
      const { year, month, amount } = payment;

      // Convert short month to full month if needed
      const monthFull = {
        Jan: 'January', Feb: 'February', Mar: 'March',
        Apr: 'April', May: 'May', Jun: 'June',
        Jul: 'July', Aug: 'August', Sep: 'September',
        Oct: 'October', Nov: 'November', Dec: 'December'
      }[month] || month;

      client.updateMonthlyPayment(String(year), monthFull, amount);
    }
    client.markModified('payments');

    await client.save();

    res.status(200).json({ message: 'Payments updated successfully', payments: client.payments });
  } catch (err) {
    console.error("Error updating payments:", err);
    res.status(500).json({ message: 'Error updating payments', error: err.message });
  }
});



// Upload clients via CSV
router.post('/upload', verifyToken, upload.single('file'), uploadCSV);

export default router;
