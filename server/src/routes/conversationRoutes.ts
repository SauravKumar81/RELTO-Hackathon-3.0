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

const router = Router();

router.use(protect);

router.get('/unread-count', getUnreadCount);

router.get('/', getMyConversations);

router.post('/', startConversation);

router.get('/item/:itemId', getConversationsForItem);

router.get('/:id', getConversationById);

router.get('/:id/messages', getMessages);

router.post('/:id/messages', sendMessage);

router.patch('/:id/close', closeConversation);

router.patch('/:id/withdraw', withdrawConversation);

export default router;
