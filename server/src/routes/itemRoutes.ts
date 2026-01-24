import { Router } from 'express';
import {
  createItem,
  getAllItems,
  getNearbyItems,
  getItemById,
  resolveItem,
  claimItem,
  deleteItem,
  getHistory,
  getHistoryItem,
} from '../controllers/itemController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/upload.middleware';


const router = Router();

router.get('/history', getHistory);
router.get('/history/:id', getHistoryItem);

router.get('/', getAllItems);
router.post('/', protect, upload.single('image'), createItem);
router.get('/nearby', getNearbyItems);
router.get('/:id', getItemById);
router.patch('/:id/claim', protect, claimItem);
router.patch('/:id/resolve', protect, resolveItem);
router.delete('/:id', protect, deleteItem);

export default router;
