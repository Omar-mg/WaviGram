import { Request, Response, NextFunction } from 'express';
import { Repository } from 'typeorm';
import { Conversation } from '../entity/Conversation.entity';
import { Message } from '../entity/Message.entity';
import { ConversationMember } from '../entity/ConversationMember.entity';
import { User } from '../entity/User.entity';
import { AppDataSource } from '../data-source';

const conversationRepository: Repository<Conversation> = AppDataSource.getRepository(Conversation);
const messageRepository: Repository<Message> = AppDataSource.getRepository(Message);
const conversationMemberRepository: Repository<ConversationMember> = AppDataSource.getRepository(ConversationMember);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const getConversations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Get conversations for the user with last message and other participant info
    const conversations = await conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.conversationMembers', 'member')
      .leftJoin('member.user', 'memberUser')
      .leftJoinAndSelect('conversation.conversationMembers', 'otherMembers')
      .leftJoinAndSelect('otherMembers.user', 'otherUser')
      .leftJoinAndSelect('conversation.messages', 'message')
      .leftJoinAndSelect('message.sender', 'messageSender')
      .where('member.userId = :userId', { userId })
      .andWhere('member.isActive = true')
      .orderBy('message.createdAt', 'DESC')
      .addOrderBy('conversation.updatedAt', 'DESC')
      .getMany();

    // Process conversations to get the latest message and participant info
    const processedConversations = conversations.map(conversation => {
      // Get the other participant (not the current user)
      const otherMember = conversation.conversationMembers.find(
        member => member.userId !== parseInt(userId)
      );

      const otherUser = otherMember ? otherMember.user : null;

      // Get the latest message
      const latestMessage = conversation.messages
        .filter(msg => !msg.isDeleted)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null;

      return {
        id: conversation.id,
        name: conversation.name || null,
        isGroup: conversation.isGroup,
        avatarUrl: conversation.avatarUrl || null,
        lastMessageAt: conversation.lastMessageAt || null,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
        otherParticipant: otherUser ? {
          id: otherUser.id,
          firstName: otherUser.firstName,
          lastName: otherUser.lastName,
          avatarUrl: otherUser.avatarUrl,
          isVerified: otherUser.isVerified
        } : null,
        lastMessage: latestMessage ? {
          id: latestMessage.id,
          content: latestMessage.content,
          type: latestMessage.type,
          createdAt: latestMessage.createdAt,
          senderId: latestMessage.senderId
        } : null,
        unreadCount: otherMember ? otherMember.unreadCount : 0
      };
    });

    res.json({ conversations: processedConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    next(error);
  }
};

export const createConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { participantIds, name, isGroup = false } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Validate participants
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'At least one participant is required'
      });
    }

    // Include the current user in participants
    const allParticipantIds = [...new Set([...participantIds, parseInt(userId)])];

    // For direct messages, limit to 2 participants
    if (!isGroup && allParticipantIds.length !== 2) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Direct messages must have exactly 2 participants'
      });
    }

    // Validate that all participants exist
    const participants = await userRepository.findBy({
      id: allParticipantIds
    });

    if (participants.length !== allParticipantIds.length) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'One or more participants not found'
      });
    }

    // Check if a direct message conversation already exists between these users
    if (!isGroup && allParticipantIds.length === 2) {
      const existingConversation = await conversationRepository
        .createQueryBuilder('conversation')
        .innerJoin('conversation.conversationMembers', 'cm1', 'cm1.userId = :userId1', { userId1: allParticipantIds[0] })
        .innerJoin('conversation.conversationMembers', 'cm2', 'cm2.userId = :userId2', { userId2: allParticipantIds[1] })
        .where('conversation.isGroup = :isGroup', { isGroup: false })
        .getOne();

      if (existingConversation) {
        return res.json({ conversation: existingConversation });
      }
    }

    // Create conversation
    const conversation = conversationRepository.create({
      name: name || null,
      isGroup: !!isGroup
    });

    const savedConversation = await conversationRepository.save(conversation);

    // Create conversation members
    const memberEntities = allParticipantIds.map(participantId =>
      conversationMemberRepository.create({
        conversation: savedConversation,
        userId: participantId,
        isAdmin: participantId === parseInt(userId) // Current user is admin by default
      })
    );

    await conversationMemberRepository.save(memberEntities);

    res.status(201).json({ conversation: savedConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    next(error);
  }
};

export const getConversation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get conversation with messages and participants
    const conversation = await conversationRepository.findOne({
      where: { id: parseInt(conversationId) },
      relations: {
        conversationMembers: {
          user: true
        },
        messages: {
          sender: true
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }

    // Filter out deleted messages and sort by timestamp
    const activeMessages = conversation.messages
      .filter(message => !message.isDeleted)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Format response
    const formattedConversation = {
      id: conversation.id,
      name: conversation.name,
      isGroup: conversation.isGroup,
      avatarUrl: conversation.avatarUrl,
      lastMessageAt: conversation.lastMessageAt,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      participants: conversation.conversationMembers
        .filter(member => member.isActive)
        .map(member => ({
          id: member.user.id,
          firstName: member.user.firstName,
          lastName: member.user.lastName,
          avatarUrl: member.user.avatarUrl,
          isVerified: member.user.isVerified,
          isAdmin: member.isAdmin,
          isMuted: member.isMuted,
          unreadCount: member.unreadCount,
          lastReadAt: member.lastReadAt,
          joinedAt: member.joinedAt
        })),
      messages: activeMessages.map(message => ({
        id: message.id,
        content: message.content,
        type: message.type,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        sender: {
          id: message.sender.id,
          firstName: message.sender.firstName,
          lastName: message.sender.lastName,
          avatarUrl: message.sender.avatarUrl,
          isVerified: message.sender.isVerified
        },
        isEdited: message.isEdited,
        editedAt: message.editedAt
      }))
    };

    res.json({ conversation: formattedConversation });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    next(error);
  }
};

export const sendMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { content, type = 'text' } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message content is required'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get conversation to update lastMessageAt
    const conversation = await conversationRepository.findOne({
      where: { id: parseInt(conversationId) }
    });

    if (!conversation) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Conversation not found'
      });
    }

    // Create message
    const message = messageRepository.create({
      conversation: conversation,
      senderId: parseInt(userId),
      content: content.trim(),
      type: type as 'text' | 'image' | 'video' | 'audio' | 'file' | 'system'
    });

    const savedMessage = await messageRepository.save(message);

    // Update conversation's lastMessageAt
    conversation.lastMessageAt = new Date();
    await conversationRepository.save(conversation);

    // TODO: Update unread counts for other members
    // TODO: Send real-time notification via Socket.IO

    // Format response
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    const formattedMessage = {
      id: savedMessage.id,
      content: savedMessage.content,
      type: savedMessage.type,
      createdAt: savedMessage.createdAt,
      updatedAt: updatedAt,
      sender: {
        id: user?.id || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || null,
        isVerified: user?.isVerified || false
      },
      isEdited: false
    };

    res.status(201).json({ message: formattedMessage });
  } catch (error) {
    console.error('Error sending message:', error);
    next(error);
  }
};

export const updateMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId, messageId } = req.params;
    const { content } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Message content is required'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get the message and check if the user is the sender
    const message = await messageRepository.findOne({
      where: { id: parseInt(messageId), conversation: { id: parseInt(conversationId) } },
      relations: ['sender']
    });

    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    if (message.senderId !== parseInt(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only edit your own messages'
      });
    }

    // Update the message
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    const updatedMessage = await messageRepository.save(message);

    // TODO: Update conversation's lastMessageAt if needed? Editing a message doesn't change the last message time unless it's the last message and the content change affects ordering? We'll not update lastMessageAt on edit.

    // Format response
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    const formattedMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      type: updatedMessage.type,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      sender: {
        id: user?.id || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || null,
        isVerified: user?.isVerified || false
      },
      isEdited: updatedMessage.isEdited,
      editedAt: updatedMessage.editedAt
    };

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error updating message:', error);
    next(error);
  }
};

export const deleteMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId, messageId } = req.params;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get the message and check if the user is the sender
    const message = await messageRepository.findOne({
      where: { id: parseInt(messageId), conversation: { id: parseInt(conversationId) } },
      relations: ['sender']
    });

    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    if (message.senderId !== parseInt(userId)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own messages'
      });
    }

    // Soft delete the message
    message.isDeleted = true;
    const deletedMessage = await messageRepository.save(message);

    // If the deleted message was the last message in the conversation, update the conversation's lastMessageAt
    const conversation = await conversationRepository.findOne({
      where: { id: parseInt(conversationId) },
      relations: ['messages']
    });

    if (conversation) {
      const activeMessages = conversation.messages
        .filter(m => !m.isDeleted)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const newLastMessage = activeMessages[0] || null;
      conversation.lastMessageAt = newLastMessage ? new Date(newLastMessage.createdAt) : null;
      await conversationRepository.save(conversation);
    }

    // Format response
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    const formattedMessage = {
      id: deletedMessage.id,
      content: deletedMessage.content,
      type: deletedMessage.type,
      createdAt: deletedMessage.createdAt,
      updatedAt: deletedMessage.updatedAt,
      sender: {
        id: user?.id || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || null,
        isVerified: user?.isVerified || false
      },
      isEdited: deletedMessage.isEdited
    };

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error deleting message:', error);
    next(error);
  }
};

export const reactToMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId, messageId } = req.params;
    const { emoji } = req.body;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!emoji || typeof emoji !== 'string' || emoji.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Emoji is required'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get the message
    const message = await messageRepository.findOne({
      where: { id: parseInt(messageId), conversation: { id: parseInt(conversationId) } }
    });

    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot react to a deleted message'
      });
    }

    // Initialize reactions if null
    if (!message.reactions) {
      message.reactions = [];
    }

    // Find the reaction for this emoji
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    const reaction = reactionIndex !== -1 ? message.reactions[reactionIndex] : null;

    if (reaction) {
      // Check if the user has already reacted with this emoji
      const userHasReacted = reaction.userIds.includes(userId.toString());
      if (userHasReacted) {
        // Remove the reaction (unreact)
        reaction.userIds = reaction.userIds.filter(id => id !== userId.toString());
        reaction.count--;

        // If count becomes zero, remove the reaction entry
        if (reaction.count === 0) {
          message.reactions.splice(reactionIndex, 1);
        }
      } else {
        // Add the reaction
        reaction.userIds.push(userId.toString());
        reaction.count++;
      }
    } else {
      // Create new reaction entry
      message.reactions.push({
        emoji: emoji,
        count: 1,
        userIds: [userId.toString()]
      });
    }

    // Save the message
    const updatedMessage = await messageRepository.save(message);

    // Format response
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    const formattedMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      type: updatedMessage.type,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      sender: {
        id: user?.id || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || null,
        isVerified: user?.isVerified || false
      },
      isEdited: updatedMessage.isEdited,
      reactions: updatedMessage.reactions
    };

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error reacting to message:', error);
    next(error);
  }
};

export const removeReaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { conversationId, messageId } = req.params;
    const { emoji } = req.params; // Note: we'll get emoji from URL param

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'User not authenticated'
      });
    }

    if (!emoji || typeof emoji !== 'string' || emoji.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Emoji is required'
      });
    }

    // Check if user is a member of this conversation
    const isMember = await conversationMemberRepository.exist({
      where: {
        conversation: { id: parseInt(conversationId) },
        userId: parseInt(userId),
        isActive: true
      }
    });

    if (!isMember) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You are not a member of this conversation'
      });
    }

    // Get the message
    const message = await messageRepository.findOne({
      where: { id: parseInt(messageId), conversation: { id: parseInt(conversationId) } }
    });

    if (!message) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Message not found'
      });
    }

    if (message.isDeleted) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Cannot react to a deleted message'
      });
    }

    // Find the reaction for this emoji
    const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
    if (reactionIndex === -1) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Reaction not found'
      });
    }

    const reaction = message.reactions[reactionIndex];

    // Check if the user has reacted with this emoji
    const userHasReacted = reaction.userIds.includes(userId.toString());
    if (!userHasReacted) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You have not reacted with this emoji'
      });
    }

    // Remove the user's reaction
    reaction.userIds = reaction.userIds.filter(id => id !== userId.toString());
    reaction.count--;

    // If count becomes zero, remove the reaction entry
    if (reaction.count === 0) {
      message.reactions.splice(reactionIndex, 1);
    }

    // Save the message
    const updatedMessage = await messageRepository.save(message);

    // Format response
    const user = await userRepository.findOne({
      where: { id: parseInt(userId) },
      select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
    });

    const formattedMessage = {
      id: updatedMessage.id,
      content: updatedMessage.content,
      type: updatedMessage.type,
      createdAt: updatedMessage.createdAt,
      updatedAt: updatedMessage.updatedAt,
      sender: {
        id: user?.id || 0,
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        avatarUrl: user?.avatarUrl || null,
        isVerified: user?.isVerified || false
      },
      isEdited: updatedMessage.isEdited,
      reactions: updatedMessage.reactions
    };

    res.json({ message: formattedMessage });
  } catch (error) {
    console.error('Error removing reaction:', error);
    next(error);
  }
};