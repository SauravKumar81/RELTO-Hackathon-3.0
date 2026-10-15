import express from 'express';
import cors from 'cors';
import connectDB from './config/db';

import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import conversationRoutes from './routes/conversationRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Ensure MongoDB is connected before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error);
    res.status(500).json({ error: 'Database connection failed', details: (error as Error).message });
  }
});

// Health check endpoints
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Relto API', timestamp: new Date().toISOString() });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', service: 'Relto API', timestamp: new Date().toISOString() });
});

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reports', reportRoutes);

export default app;

