import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authroutes from './src/routes/authroutes.js';
import userroutes from './src/routes/userroutes.js';
import clientroutes from './src/routes/clientroutes.js';
import paymentroutes from './src/routes/paymentroutes.js';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config();

const app = express();
app.use(cookieParser());

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // frontend origin
  credentials: true,              // allow cookies to be sent
}));
app.use(express.json());

// Routes
app.use('/auth', authroutes);
app.use('/users', userroutes);
app.use('/clients', clientroutes);
app.use('/payments', paymentroutes);

// Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

if (!process.env.MONGO_URI) {
  console.error("MongoDB URI is not defined in the .env file");
  process.exit(1); // Exit if MONGO_URI is not available
}

// MongoDB connection and server start
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    app.listen(process.env.PORT || 10000, () => {
      console.log(`Server running on port ${process.env.PORT || 10000}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Atlas connection error:', err);
    process.exit(1); // Exit process if connection fails
  });
