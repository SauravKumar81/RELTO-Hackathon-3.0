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
import { validateRequest } from '../middlewares/validateRequest';
import { createItemSchema } from '../schemas/itemSchema';


const router = Router();

router.get('/history', getHistory);
router.get('/history/:id', getHistoryItem);

router.get('/', getAllItems);
router.post('/', protect, upload.single('image'), validateRequest(createItemSchema), createItem);
router.get('/nearby', getNearbyItems);
router.get('/:id', getItemById);
router.patch('/:id/claim', protect, claimItem);
router.patch('/:id/resolve', protect, resolveItem);
router.delete('/:id', protect, deleteItem);

export default router;
