import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authroutes from './src/routes/authroutes.js';
import userroutes from './src/routes/userroutes.js';
import clientroutes from './src/routes/clientroutes.js';
import paymentroutes from './src/routes/paymentroutes.js';


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authroutes);
app.use('/users',userroutes);
app.use('/clients',clientroutes);
app.use('/payments',paymentroutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    );
  })
  .catch(err => console.log(err));
