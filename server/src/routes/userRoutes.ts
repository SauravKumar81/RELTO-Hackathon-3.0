import { Router } from 'express';
import {
  registerUser,
  loginUser,
  getMe,
} from '../controllers/userController';
import { protect } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../schemas/userSchema';

const router = Router();

router.post('/register', validateRequest(registerSchema), registerUser);
router.post('/login', validateRequest(loginSchema), loginUser);
router.get('/me', protect, getMe);

export default router;
