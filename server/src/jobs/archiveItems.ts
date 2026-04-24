import cron from 'node-cron';
import Item from '../models/Item';
import { invalidate } from '../utils/cache';
import logger from '../config/logger';

// Run every day at midnight (0 0 * * *)
cron.schedule('0 0 * * *', async () => {
  try {
    logger.info('Running daily archive job...');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // Delete items older than 30 days
    const result = await Item.deleteMany({
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    if (result.deletedCount > 0) {
      logger.info(`Archived (deleted) ${result.deletedCount} old items.`);
      await invalidate('items:*');
    } else {
      logger.info('No items to archive.');
    }
  } catch (error) {
    logger.error('Error in archive job:', error);
  }
});
