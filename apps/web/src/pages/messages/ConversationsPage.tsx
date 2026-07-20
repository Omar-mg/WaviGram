import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Users, Plus, Clock, ChevronRight, Bell, Dot } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { conversationAPI } from '@/services/conversationAPI';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { conversationSocket, onMessageReceived } from '@/services/conversationSocket';

interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  avatarUrl: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    isVerified: boolean;
    isAdmin: boolean;
    isMuted: boolean;
    unreadCount: number;
    lastReadAt: string | null;
    joinedAt: string;
  }>;
  lastMessage: {
    id: string;
    content: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
    senderId: string;
    createdAt: string;
    sender: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      isVerified: boolean;
    };
  } | null;
  unreadCount: number;
}

const ConversationItem = ({
  conversation,
  onSelect
}: {
  conversation: Conversation;
  onSelect: (conversationId: string) => void;
}) => {
  const otherParticipants = conversation.participants.filter(
    p => !!conversation.isGroup || p.id !== conversation.participants[0].id
  );

  const otherParticipant = conversation.isGroup
    ? null
    : otherParticipants[0];

  return (
    <Link
      to={`/messages/${conversation.id}`}
      onClick={() => onSelect(conversation.id)}
      className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700"
    >
      <div className="flex-shrink-0">
        {conversation.avatarUrl ? (
          <img
            src={conversation.avatarUrl}
            alt={conversation.name || 'Conversation'}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
            {conversation.name
              ? conversation.name
                  .split(' ')
                  .map(part => part[0])
                  .join('')
                  .substring(0, 2)
              : '??'}
          </div>
        )}
        {conversation.unreadCount > 0 && (
          <div className="-mt-0.5 -mr-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-primary-600" />
        )}
      </div>
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate max-w-[200px]">
            {conversation.name || (
              !conversation.isGroup && otherParticipant
                ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                : 'Group Chat'
            )}
          </h3>
          <p className="text-xs text-gray-400">
            {conversation.lastMessageAt ? (
              new Date(conversation.lastMessageAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })
            ) : ''}
          </p>
        </div>
        {conversation.lastMessage ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
            {conversation.lastMessage.senderId === user?.id
              ? 'You: '
              : ''}
            {conversation.lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No messages yet
          </p>
        )}
        <div className="flex items-center justify-between mt-1">
          {conversation.unreadCount > 0 && (
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
              {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
            </span>
          )}
          {!conversation.isGroup && otherParticipant && (
            <>
              {/* Online status indicator */}
              <div className="h-2 w-2 rounded-full bg-success-500" title="Online" />
              <span className="ml-1 text-xs text-gray-500">Online</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export const ConversationsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const loadConversations = async () => {
      try {
        setLoading(true);
        const response = await conversationAPI.getConversations();
        setConversations(response.data.conversations || []);

        // Calculate total unread count
        const totalUnread = (response.data.conversations || []).reduce(
          (sum, conv) => sum + (conv.unreadCount || 0),
          0
        );
        setUnreadCount(totalUnread);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
          'Failed to load conversations'
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversations();

    // Set up real-time updates for new messages
    const unsubscribeMessages = conversationSocket.onMessageReceived(
      (message: any) => {
        setConversations(prev => {
          // Find the conversation this message belongs to
          const conversationIndex = prev.findIndex(
            c => c.id === message.conversationId
          );

          if (conversationIndex === -1) return prev;

          const updatedConversations = [...prev];
          const conversation = { ...updatedConversations[conversationIndex] };

          // Update last message
          conversation.lastMessage = {
            id: message.id,
            content: message.content,
            type: message.type,
            senderId: message.senderId,
            createdAt: message.createdAt,
            sender: message.sender
          };

          // Update timestamp
          conversation.lastMessageAt = message.createdAt;

          // Increment unread count if message is not from current user
          if (message.senderId !== user?.id) {
            conversation.unreadCount = (conversation.unreadCount || 0) + 1;
          }

          updatedConversations[conversationIndex] = conversation;

          // Sort by most recent message
          return [...updatedConversations].sort((a, b) => {
            const dateA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
            const dateB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
            return dateB - dateA;
          });
        });
      }
    );

    return () => {
      unsubscribeMessages();
    };
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive-600">{error}</h2>
        <Button onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-12">
          <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            No conversations yet
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Start a new conversation to begin chatting
          </p>
          <Button
            asChild
            href="/messages/new"
            variant="outline"
          >
            Start new conversation
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header */}
      <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Messages
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          {unreadCount > 0 && (
            <div className="relative">
              <Bell className="h-5 w-5 text-primary-600" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-xs font-medium text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </div>
          )}
          <Button
            asChild
          href="/messages/new"
            variant="outline"
          >
            New conversation
          </Button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <Input
          placeholder="Search conversations..."
          leftIcon={<Search className="h-4 w-4 text-gray-400" />}
          className="mb-0"
        />
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-hidden">
        <div className="overflow-y-auto p-4 space-y-0">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              onSelect={(conversationId) => {
                navigate(`/messages/${conversationId}`);
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating action button for new chat */}
      <div className="fixed bottom-6 right-6">
        <Button
          asChild
          href="/messages/new"
          variant="solid"
          size="lg"
        >
          <Plus className="h-4 w-4" />
          New chat
        </Button>
      </div>
    </div>
  );
};

export default ConversationsPage;