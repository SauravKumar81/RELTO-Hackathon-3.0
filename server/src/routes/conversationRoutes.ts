import { Router } from 'express';
import {
  startConversation,
  getMyConversations,
  getConversationsForItem,
  getConversationById,
  getMessages,
  sendMessage,
  closeConversation,
  withdrawConversation,
  getUnreadCount,
} from '../controllers/conversationController';
import { protect } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { startConversationSchema, sendMessageSchema } from '../schemas/conversationSchema';

const router = Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);

router.get('/', getMyConversations);

router.post('/', validateRequest(startConversationSchema), startConversation);

router.get('/item/:itemId', getConversationsForItem);

router.get('/:id', getConversationById);

router.get('/:id/messages', getMessages);

router.post('/:id/messages', validateRequest(sendMessageSchema), sendMessage);

router.patch('/:id/close', closeConversation);

router.patch('/:id/withdraw', withdrawConversation);

export default router;
