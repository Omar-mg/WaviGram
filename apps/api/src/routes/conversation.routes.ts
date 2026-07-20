import { Router } from 'express';
import { getConversations, createConversation, getConversation, sendMessage, updateMessage, deleteMessage, reactToMessage, removeReaction } from '../controllers/conversation.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/', authenticateToken, getConversations);
router.post('/', authenticateToken, createConversation);
router.get('/:conversationId', authenticateToken, getConversation);
router.post('/:conversationId/messages', authenticateToken, sendMessage);
router.patch('/:conversationId/messages/:messageId', authenticateToken, updateMessage);
router.delete('/:conversationId/messages/:messageId', authenticateToken, deleteMessage);
router.post('/:conversationId/messages/:messageId/reactions', authenticateToken, reactToMessage);
router.delete('/:conversationId/messages/:messageId/reactions/:emoji', authenticateToken, removeReaction);

export default router;