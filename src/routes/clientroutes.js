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
    const clients = await Client.find({ user: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (err) {
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

    res.status(200).json(client);
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

// 📁 Upload clients via CSV
router.post('/upload', verifyToken, upload.single('file'), uploadCSV);

export default router;
