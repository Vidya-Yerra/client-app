import express from 'express';
import User from '../models/user.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Get logged-in user's data with populated clients
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Use ID from verified token (usually attached to req.user)
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('clients');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
