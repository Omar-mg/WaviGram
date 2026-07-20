import { AppDataSource } from './data-source';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { router as conversationRouter } from './routes/conversation.routes';
import { router as authRouter } from './routes/auth.routes';
import { router as userRouter } from './routes/user.routes';
import { authenticateToken } from './middleware/auth.middleware';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Attach io to request for use in controllers if needed
app.use((req, res, next) => {
  (req as any).io = io;
  next();
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);
app.use('/api/conversations', authenticateToken, conversationRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Socket.IO connection handling
io.on('connection', (socket: any) => {
  // Handle new message (from client)
  socket.on('message:send', async (data: { conversationId: string; content: string; type?: string }) => {
    try {
      if (!socket.data.userId || !data.conversationId || !data.content || data.content.trim() === '') {
        socket.emit('message:error', { message: 'Invalid message data' });
        return;
      }

      const userId = parseInt(socket.data.userId);
      const conversationId = parseInt(data.conversationId);
      const content = data.content.trim();
      const type = data.type || 'text';

      // Get repositories
      const conversationRepository = AppDataSource.getRepository('Conversation');
      const messageRepository = AppDataSource.getRepository('Message');
      const conversationMemberRepository = AppDataSource.getRepository('ConversationMember');
      const userRepository = AppDataSource.getRepository('User');

      // Verify conversation exists
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        socket.emit('message:error', { message: 'Conversation not found' });
        return;
      }

      // Verify user is a participant in the conversation
      const isMember = await conversationMemberRepository.exist({
        where: {
          conversation: { id: conversationId },
          userId: userId,
          isActive: true
        }
      });

      if (!isMember) {
        socket.emit('message:error', { message: 'You are not a participant in this conversation' });
        return;
      }

      // Create and save message
      const message = messageRepository.create({
        conversation: { id: conversationId },
        sender: { id: userId },
        content: content,
        type: type as 'text' | 'image' | 'video' | 'audio' | 'file' | 'system'
      });

      const savedMessage = await messageRepository.save(message);

      // Update conversation's last message time
      conversation.lastMessageAt = new Date();
      await conversationRepository.save(conversation);

      // Get sender info for broadcast
      const sender = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
      });

      // Format the message for broadcast
      const formattedMessage = {
        id: savedMessage.id,
        conversationId: conversationId,
        senderId: userId,
        content: savedMessage.content,
        type: savedMessage.type,
        createdAt: savedMessage.createdAt,
        sender: {
          id: sender?.id || 0,
          firstName: sender?.firstName || '',
          lastName: sender?.lastName || '',
          avatarUrl: sender?.avatarUrl || null,
          isVerified: sender?.isVerified || false
        }
      };

      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('message:receive', formattedMessage);

      // Also send back to sender in case they need to update their local UI optimistically
      // (though they should already have it via optimistic update)
      socket.emit('message:sent', formattedMessage);
    } catch (error) {
      console.error('Error handling message:send:', error);
      socket.emit('message:error', { message: 'Failed to send message' });
      return;
    }
  });

  // Handle message update (edit)
  socket.on('message:update', async (data: { conversationId: string; messageId: string; content: string }) => {
    try {
      if (!socket.data.userId || !data.conversationId || !data.messageId || !data.content || data.content.trim() === '') {
        socket.emit('message:error', { message: 'Invalid message update data' });
        return;
      }

      const userId = parseInt(socket.data.userId);
      const conversationId = parseInt(data.conversationId);
      const messageId = parseInt(data.messageId);
      const content = data.content.trim();

      // Get repositories
      const messageRepository = AppDataSource.getRepository('Message');
      const conversationMemberRepository = AppDataSource.getRepository('ConversationMember');
      const userRepository = AppDataSource.getRepository('User');

      // Verify conversation exists
      const conversation = await AppDataSource.getRepository('Conversation').findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        socket.emit('message:error', { message: 'Conversation not found' });
        return;
      }

      // Verify user is a participant in the conversation
      const isMember = await conversationMemberRepository.exist({
        where: {
          conversation: { id: conversationId },
          userId: userId,
          isActive: true
        }
      });

      if (!isMember) {
        socket.emit('message:error', { message: 'You are not a participant in this conversation' });
        return;
      }

      // Get the message and check if the user is the sender
      const message = await messageRepository.findOne({
        where: { id: messageId, conversation: { id: conversationId } },
        relations: ['sender']
      });

      if (!message) {
        socket.emit('message:error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('message:error', { message: 'You can only edit your own messages' });
        return;
      }

      // Update the message
      message.content = content;
      message.isEdited = true;
      message.editedAt = new Date();

      const updatedMessage = await messageRepository.save(message);

      // Get sender info for broadcast
      const sender = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
      });

      // Format the message for broadcast
      const formattedMessage = {
        id: updatedMessage.id,
        conversationId: conversationId,
        senderId: userId,
        content: updatedMessage.content,
        type: updatedMessage.type,
        createdAt: updatedMessage.createdAt,
        updatedAt: updatedMessage.updatedAt,
        sender: {
          id: sender?.id || 0,
          firstName: sender?.firstName || '',
          lastName: sender?.lastName || '',
          avatarUrl: sender?.avatarUrl || null,
          isVerified: sender?.isVerified || false
        },
        isEdited: updatedMessage.isEdited,
        editedAt: updatedMessage.editedAt
      };

      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('message:updated', formattedMessage);

      // Also send back to sender
      socket.emit('message:updated', formattedMessage);
    } catch (error) {
      console.error('Error handling message:update:', error);
      socket.emit('message:error', { message: 'Failed to update message' });
    }
  });

  // Handle message deletion
  socket.on('message:delete', async (data: { conversationId: string; messageId: string }) => {
    try {
      if (!socket.data.userId || !data.conversationId || !data.messageId) {
        socket.emit('message:error', { message: 'Invalid message delete data' });
        return;
      }

      const userId = parseInt(socket.data.userId);
      const conversationId = parseInt(data.conversationId);
      const messageId = parseInt(data.messageId);

      // Get repositories
      const messageRepository = AppDataSource.getRepository('Message');
      const conversationMemberRepository = AppDataSource.getRepository('ConversationMember');
      const conversationRepository = AppDataSource.getRepository('Conversation');
      const userRepository = AppDataSource.getRepository('User');

      // Verify conversation exists
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        socket.emit('message:error', { message: 'Conversation not found' });
        return;
      }

      // Verify user is a participant in the conversation
      const isMember = await conversationMemberRepository.exist({
        where: {
          conversation: { id: conversationId },
          userId: userId,
          isActive: true
        }
      });

      if (!isMember) {
        socket.emit('message:error', { message: 'You are not a participant in this conversation' });
        return;
      }

      // Get the message and check if the user is the sender
      const message = await messageRepository.findOne({
        where: { id: messageId, conversation: { id: conversationId } },
        relations: ['sender']
      });

      if (!message) {
        socket.emit('message:error', { message: 'Message not found' });
        return;
      }

      if (message.senderId !== userId) {
        socket.emit('message:error', { message: 'You can only delete your own messages' });
        return;
      }

      // Soft delete the message
      message.isDeleted = true;
      const deletedMessage = await messageRepository.save(message);

      // If the deleted message was the last message in the conversation, update the conversation's lastMessageAt
      const conversationMessages = await messageRepository.find({
        where: { conversation: { id: conversationId }, isDeleted: false },
        order: { createdAt: 'DESC' }
      });

      const newLastMessage = conversationMessages[0] || null;
      conversation.lastMessageAt = newLastMessage ? new Date(newLastMessage.createdAt) : null;
      await conversationRepository.save(conversation);

      // Get sender info for broadcast
      const sender = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
      });

      // Format the message for broadcast
      const formattedMessage = {
        id: deletedMessage.id,
        conversationId: conversationId,
        senderId: userId,
        content: deletedMessage.content,
        type: deletedMessage.type,
        createdAt: deletedMessage.createdAt,
        updatedAt: deletedMessage.updatedAt,
        sender: {
          id: sender?.id || 0,
          firstName: sender?.firstName || '',
          lastName: sender?.lastName || '',
          avatarUrl: sender?.avatarUrl || null,
          isVerified: sender?.isVerified || false
        },
        isEdited: deletedMessage.isEdited
      };

      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('message:deleted', formattedMessage);

      // Also send back to sender
      socket.emit('message:deleted', formattedMessage);
    } catch (error) {
      console.error('Error handling message:delete:', error);
      socket.emit('message:error', { message: 'Failed to delete message' });
    }
  });

  // Handle message reaction
  socket.on('message:react', async (data: { conversationId: string; messageId: string; emoji: string }) => {
    try {
      if (!socket.data.userId || !data.conversationId || !data.messageId || !data.emoji || data.emoji.trim() === '') {
        socket.emit('message:error', { message: 'Invalid message reaction data' });
        return;
      }

      const userId = parseInt(socket.data.userId);
      const conversationId = parseInt(data.conversationId);
      const messageId = parseInt(data.messageId);
      const emoji = data.emoji.trim();

      // Get repositories
      const messageRepository = AppDataSource.getRepository('Message');
      const conversationMemberRepository = AppDataSource.getRepository('ConversationMember');
      const userRepository = AppDataSource.getRepository('User');

      // Verify conversation exists
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        socket.emit('message:error', { message: 'Conversation not found' });
        return;
      }

      // Verify user is a participant in the conversation
      const isMember = await conversationMemberRepository.exist({
        where: {
          conversation: { id: conversationId },
          userId: userId,
          isActive: true
        }
      });

      if (!isMember) {
        socket.emit('message:error', { message: 'You are not a participant in this conversation' });
        return;
      }

      // Get the message
      const message = await messageRepository.findOne({
        where: { id: messageId, conversation: { id: conversationId } }
      });

      if (!message) {
        socket.emit('message:error', { message: 'Message not found' });
        return;
      }

      if (message.isDeleted) {
        socket.emit('message:error', { message: 'Cannot react to a deleted message' });
        return;
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

      // Get sender info for broadcast
      const sender = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
      });

      // Format the message for broadcast
      const formattedMessage = {
        id: updatedMessage.id,
        conversationId: conversationId,
        senderId: userId,
        content: updatedMessage.content,
        type: updatedMessage.type,
        createdAt: updatedMessage.createdAt,
        updatedAt: updatedMessage.updatedAt,
        sender: {
          id: sender?.id || 0,
          firstName: sender?.firstName || '',
          lastName: sender?.lastName || '',
          avatarUrl: sender?.avatarUrl || null,
          isVerified: sender?.isVerified || false
        },
        isEdited: updatedMessage.isEdited,
        reactions: updatedMessage.reactions
      };

      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('message:reacted', formattedMessage);

      // Also send back to sender
      socket.emit('message:reacted', formattedMessage);
    } catch (error) {
      console.error('Error handling message:react:', error);
      socket.emit('message:error', { message: 'Failed to react to message' });
    }
  });

  // Handle message reaction removal
  socket.on('message:unreact', async (data: { conversationId: string; messageId: string; emoji: string }) => {
    try {
      if (!socket.data.userId || !data.conversationId || !data.messageId || !data.emoji || data.emoji.trim() === '') {
        socket.emit('message:error', { message: 'Invalid message unreact data' });
        return;
      }

      const userId = parseInt(socket.data.userId);
      const conversationId = parseInt(data.conversationId);
      const messageId = parseInt(data.messageId);
      const emoji = data.emoji.trim();

      // Get repositories
      const messageRepository = AppDataSource.getRepository('Message');
      const conversationMemberRepository = AppDataSource.getRepository('ConversationMember');
      const userRepository = AppDataSource.getRepository('User');

      // Verify conversation exists
      const conversation = await conversationRepository.findOne({
        where: { id: conversationId }
      });

      if (!conversation) {
        socket.emit('message:error', { message: 'Conversation not found' });
        return;
      }

      // Verify user is a participant in the conversation
      const isMember = await conversationMemberRepository.exist({
        where: {
          conversation: { id: conversationId },
          userId: userId,
          isActive: true
        }
      });

      if (!isMember) {
        socket.emit('message:error', { message: 'You are not a participant in this conversation' });
        return;
      }

      // Get the message
      const message = await messageRepository.findOne({
        where: { id: messageId, conversation: { id: conversationId } }
      });

      if (!message) {
        socket.emit('message:error', { message: 'Message not found' });
        return;
      }

      if (message.isDeleted) {
        socket.emit('message:error', { message: 'Cannot react to a deleted message' });
        return;
      }

      // Find the reaction for this emoji
      const reactionIndex = message.reactions.findIndex(r => r.emoji === emoji);
      if (reactionIndex === -1) {
        socket.emit('message:error', { message: 'Reaction not found' });
        return;
      }

      const reaction = message.reactions[reactionIndex];

      // Check if the user has reacted with this emoji
      const userHasReacted = reaction.userIds.includes(userId.toString());
      if (!userHasReacted) {
        socket.emit('message:error', { message: 'You have not reacted with this emoji' });
        return;
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

      // Get sender info for broadcast
      const sender = await userRepository.findOne({
        where: { id: userId },
        select: ['id', 'firstName', 'lastName', 'avatarUrl', 'isVerified']
      });

      // Format the message for broadcast
      const formattedMessage = {
        id: updatedMessage.id,
        conversationId: conversationId,
        senderId: userId,
        content: updatedMessage.content,
        type: updatedMessage.type,
        createdAt: updatedMessage.createdAt,
        updatedAt: updatedMessage.updatedAt,
        sender: {
          id: sender?.id || 0,
          firstName: sender?.firstName || '',
          lastName: sender?.lastName || '',
          avatarUrl: sender?.avatarUrl || null,
          isVerified: sender?.isVerified || false
        },
        isEdited: updatedMessage.isEdited,
        reactions: updatedMessage.reactions
      };

      // Broadcast to conversation room
      io.to(`conversation_${conversationId}`).emit('message:unreacted', formattedMessage);

      // Also send back to sender
      socket.emit('message:unreacted', formattedMessage);
    } catch (error) {
      console.error('Error handling message:unreact:', error);
      socket.emit('message:error', { message: 'Failed to remove reaction from message' });
    }
  });

  // Handle typing start
  socket.on('typing_start', (data: { conversationId: string }) => {
    if (!socket.data.userId || !data.conversationId) return;

    const userId = parseInt(socket.data.userId);
    const conversationId = data.conversationId;

    // Broadcast to others in the conversation
    socket.to(`conversation_${conversationId}`).emit('typing_start', { userId });
  });

  // Handle typing stop
  socket.on('typing_stop', (data: { conversationId: string }) => {
    if (!socket.data.userId || !data.conversationId) return;

    const userId = parseInt(socket.data.userId);
    const conversationId = data.conversationId;

    // Broadcast to others in the conversation
    socket.to(`conversation_${conversationId}`).emit('typing_stop', { userId });
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await AppDataSource.destroy();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});