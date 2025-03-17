import express from 'express';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

// POST: Add new client under a user
router.post('/:userId', verifyToken, async (req, res) => {
  const { name, phone, fixedAmount } = req.body;
  const { userId } = req.params;

  console.log('req.userId:', req.userId);
  console.log('req.userRole:', req.userRole);
  console.log('Requested userId (from URL):', userId);

  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const newClient = new Client({ name, phone, fixedAmount, user: userId });
    const savedClient = await newClient.save();
    res.status(201).json(savedClient);
  } catch (err) {
    console.error('Error while creating client:', err);
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET: Get all clients of a user
router.get('/user/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;

  if (req.userId !== userId && req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  try {
    const clients = await Client.find({ userId });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// GET: Get single client
router.get('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    res.json(client);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// PUT: Update client info
router.put('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedClient = await Client.findByIdAndUpdate(
      req.params.clientId,
      req.body,
      { new: true }
    );

    res.json(updatedClient);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE: Delete client
router.delete('/:clientId', verifyToken, async (req, res) => {
  try {
    const client = await Client.findById(req.params.clientId);

    if (!client) return res.status(404).json({ message: 'Client not found' });

    if (req.userRole !== 'admin' && client.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await client.deleteOne();
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
