import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';
import { AppDataSource } from '../data-source';
import { Follow } from '../entity/Follow.entity';

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const followRepository: Repository<Follow> = AppDataSource.getRepository(Follow);

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'firstName', 'lastName', 'avatarUrl', 'bio', 'website', 'location', 'isVerified', 'isActive', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're an admin
    // For now, we'll allow users to view any public profile
    const user = await userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'firstName', 'lastName', 'avatarUrl', 'bio', 'website', 'location', 'isVerified', 'isActive', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { firstName, lastName, bio, avatarUrl, website, location, coverUrl } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;
    if (website !== undefined) user.website = website;
    if (location !== undefined) user.location = location;
    if (coverUrl !== undefined) user.coverUrl = coverUrl;

    const updatedUser = await userRepository.save(user);

    // Return updated user without sensitive information
    const { password, ...userWithoutPassword } = updatedUser;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Get followers with pagination
    const [followers, total] = await followRepository.findAndCount({
      where: { followingId: userId },
      relations: ['follower'],
      select: {
        follower: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isVerified: true
        }
      },
      order: { createdAt: 'DESC' }
    });

    res.json({
      followers: followers.map(f => f.follower),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    // Get following with pagination
    const [following, total] = await followRepository.findAndCount({
      where: { followerId: userId },
      relations: ['following'],
      select: {
        following: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          isVerified: true
        }
      },
      order: { createdAt: 'DESC' }
    });

    res.json({
      following: following.map(f => f.following),
      total
    });
  } catch (error) {
    next(error);
  }
};

export const followUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user?.id;
    const { followingId } = req.params;

    if (!followerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if trying to follow oneself
    if (followerId === followingId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot follow yourself'
      });
    }

    // Check if the target user exists
    const targetUser = await userRepository.findOne({
      where: { id: followingId }
    });

    if (!targetUser) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Check if already following
    const existingFollow = await followRepository.findOne({
      where: { followerId, followingId }
    });

    if (existingFollow) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Already following this user'
      });
    }

    // Create new follow relationship
    const follow = followRepository.create({
      followerId,
      followingId
    });

    await followRepository.save(follow);

    res.status(201).json({ message: 'Successfully followed user' });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const followerId = req.user?.id;
    const { followingId } = req.params;

    if (!followerId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if following relationship exists
    const follow = await followRepository.findOne({
      where: { followerId, followingId }
    });

    if (!follow) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Not following this user'
      });
    }

    // Remove the follow relationship
    await followRepository.remove(follow);

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    next(error);
  }
};