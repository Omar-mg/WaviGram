import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { User } from '../entity/User.entity';
import { Conversation } from '../entity/Conversation.entity';
import { ConversationMember } from '../entity/ConversationMember.entity';
import { Message } from '../entity/Message.entity';
import { AppDataSource } from '../data-source';

const userRepository: Repository<User> = AppDataSource.getRepository(User);
const conversationRepository: Repository<Conversation> = AppDataSource.getRepository(Conversation);
const conversationMemberRepository: Repository<ConversationMember> = AppDataSource.getRepository(ConversationMember);
const messageRepository: Repository<Message> = AppDataSource.getRepository(Message);

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user ID from request (set by auth middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Get user to verify they exist
    const user = await userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'User not found'
      });
    }

    // Get conversation count for this user
    const conversationCount = await conversationRepository
      .createQueryBuilder('conversation')
      .innerJoin('conversation.conversationMembers', 'member')
      .where('member.userId = :userId', { userId })
      .andWhere('member.isActive = true')
      .getCount();

    // Get message count for this user
    const messageCount = await messageRepository
      .createQueryBuilder('message')
      .where('message.senderId = :userId', { userId })
      .andWhere('message.isDeleted = false')
      .getCount();

    // Get unread message count for this user
    const unreadCount = await conversationMemberRepository
      .createQueryBuilder('member')
      .where('member.userId = :userId', { userId })
      .andWhere('member.unreadCount > 0')
      .getCount();

    // Get recent activity (messages from conversations the user is in)
    const recentMessages = await messageRepository
      .createQueryBuilder('message')
      .innerJoin('message.sender', 'sender')
      .innerJoin('message.conversation', 'conversation')
      .innerJoin('conversation.conversationMembers', 'member', 'member.userId = :userId', { userId })
      .where('message.isDeleted = false')
      .andWhere('member.isActive = true')
      .orderBy('message.createdAt', 'DESC')
      .limit(10)
      .getMany();

    // Format recent messages as activity items
    const activityItems = recentMessages.map((msg, index) => ({
      id: msg.id,
      type: 'message' as const,
      from: `${msg.sender.firstName} ${msg.sender.lastName}`,
      content: msg.content.length > 50 ? `${msg.content.substring(0, 50)}...` : msg.content,
      time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unread: false, // Would need to check read status in a real implementation
      hasMedia: msg.type !== 'text'
    }));

    // Calculate some basic trends (in a real app, you'd compare with previous period)
    const stats = [
      {
        title: 'Messages',
        value: messageCount.toString(),
        trend: '+12%', // Placeholder - would calculate based on time period
        positive: true
      },
      {
        title: 'Conversations',
        value: conversationCount.toString(),
        trend: '+5 this week', // Placeholder
        positive: true
      },
      {
        title: 'Unread',
        value: unreadCount.toString(),
        trend: unreadCount > 0 ? '+2' : '0',
        positive: unreadCount === 0
      },
      {
        title: 'Active Today',
        value: '3', // Placeholder - would calculate based on recent activity
        trend: '+1',
        positive: true
      }
    ];

    res.json({ stats, activity: activityItems });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    next(error);
  }
};