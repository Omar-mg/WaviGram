import { Router } from 'express';
import { getMe, getUserById, updateUser, getFollowers, getFollowing, followUser, unfollowUser } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/me', authenticateToken, getMe);
router.get('/:id', authenticateToken, getUserById);
router.patch('/me', authenticateToken, updateUser);

// Social graph routes
router.get('/:id/followers', authenticateToken, getFollowers);
router.get('/:id/following', authenticateToken, getFollowing);
router.post('/:id/follow', authenticateToken, followUser);
router.delete('/:id/follow', authenticateToken, unfollowUser);

export default router;