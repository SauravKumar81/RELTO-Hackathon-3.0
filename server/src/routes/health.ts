import express from 'express';
import mongoose from 'mongoose';
import { redis } from '../config/redis';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    let redisStatus = 'disconnected';
    try {
      const pingResponse = await redis.ping();
      if (pingResponse === 'PONG') {
        redisStatus = 'connected';
      }
    } catch (e) {
      // Redis is disconnected
    }

    const isHealthy = mongoStatus === 'connected' && redisStatus === 'connected';

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        mongodb: mongoStatus,
        redis: redisStatus,
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
