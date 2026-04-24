import { Router } from 'express';
import {
  createReport,
  getMyReports,
  getReport,
} from '../controllers/reportController';
import { protect } from '../middlewares/authMiddleware';
import upload from '../middlewares/upload.middleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createReportSchema } from '../schemas/reportSchema';

const router = Router();

router.post('/', protect, upload.single('evidence'), validateRequest(createReportSchema), createReport);
router.get('/my', protect, getMyReports);
router.get('/:id', protect, getReport);

export default router;
