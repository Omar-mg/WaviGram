import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User.entity';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is required'
    });
  }

  try {
    const decoded = verify(
      token,
      process.env.JWT_ACCESS_SECRET || 'your_access_token_secret'
    ) as { userId: string };

    // Get user from database
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.userId },
      select: ['id', 'email', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid token'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      // Add other fields as needed
    };

    next();
  } catch (error) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid or expired token'
    });
  }
};