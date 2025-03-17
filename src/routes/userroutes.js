import express from 'express';
import User from '../models/user.js';
import Client from '../models/client.js';
import { verifyToken } from '../middlewares/authmiddleware.js';

const router = express.Router();

// Utility: Check if the requester is admin or the same user
const isAuthorized = (req, userId) => {
  return req.userRole === 'admin' || req.userId === userId;
};

// Get all users with client counts
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all users except passwords
    const users = await User.find().select('-password');
    console.log('Users:', users);  // Debugging step: log users to see if they're fetched correctly

    // Add client count to each user
    const usersWithClientCounts = await Promise.all(
      users.map(async (user) => {
        // Fetch clients for the user
        const clientsForUser = await Client.find({ user: user._id });
        console.log(`Clients for User ${user.name}:`, clientsForUser);  // Debugging step

        const clientCount = clientsForUser.length;  // Get the correct client count
        console.log(`User: ${user.name}, Client Count: ${clientCount}`);

        return {
          ...user.toObject(),
          clientCount,
          clients: clientsForUser,  // Attach clients to the user
        };
      })
    );

    res.json(usersWithClientCounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get a specific user with populated clients
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!isAuthorized(req, req.params.id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Fetch the user with populated clients
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('clients');  // Populate clients field

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);  // Return the user with populated clients
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
