import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;

//Import Routes
import authRoute from './src/route/authRoute.js';

//Use Routes
app.use('/api/auth', authRoute);

//MongoDB connection
mongoose
    .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log(`Connected to MongoDB`);
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));