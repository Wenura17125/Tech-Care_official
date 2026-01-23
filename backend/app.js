import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // adjust path if needed

dotenv.config();

const app = express();   // <-- this line creates the app

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});