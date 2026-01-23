import { Router } from 'express';
import {
  createReport,
  getMyReports,
  getReport,
} from '../controllers/reportController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/upload.middleware';

const router = Router();

router.post('/', protect, upload.single('evidence'), createReport);
router.get('/my', protect, getMyReports);
router.get('/:id', protect, getReport);

export default router;
