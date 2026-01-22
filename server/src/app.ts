import express from 'express';
import cors from 'cors';

import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import conversationRoutes from './routes/conversationRoutes';
import reportRoutes from './routes/reportRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reports', reportRoutes);

export default app;
