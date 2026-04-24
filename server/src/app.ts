import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
// @ts-ignore
import xss from 'xss-clean';

import userRoutes from './routes/userRoutes';
import itemRoutes from './routes/itemRoutes';
import conversationRoutes from './routes/conversationRoutes';
import reportRoutes from './routes/reportRoutes';
import { globalErrorHandler } from './middlewares/errorHandler';

const app = express();

// Set security HTTP headers
app.use(helmet());

// Restrict CORS to specified origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Auth routes rate limiting
const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: 'Too many attempts, please try again after a minute'
});

app.use(express.json({ limit: '5mb' })); // Limit body size

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/users', userRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

export default app;
