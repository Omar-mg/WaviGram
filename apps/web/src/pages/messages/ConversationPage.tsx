import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  Users,
  Image,
  Video,
  ExternalLink,
  Loader2,
  Edit2,
  Trash2,
  Megaphone,
  Bell,
  Info,
  ChevronDown,
  ChevronUp,
  Send,
  FileText,
  ArrowLeftRight,
  MessageCircleMore,
  Smile,
  Pin,
  EyeOff,
  Copy,
  CheckCircle,
  X as XIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { conversationAPI } from '@/services/conversationAPI';
import { conversationSocket, joinConversation, leaveConversation, onMessageReceived, onTyping, sendMessage, typingStart, typingStop } from '@/services/conversationSocket';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ToastProvider, toast } from 'sonner';
import { Menu, MenuContent, MenuItem, MenuTrigger, MenuSeparator, MenuCheckboxItem, MenuRadioGroup, MenuRadioItem, RadioGroup } from '@/components/ui/menu';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Check } from 'lucide-react';

interface MessageReaction {
  emoji: string;
  count: number;
  me: boolean;
}

interface Message {
  id: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  senderId: string;
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';
  };
  reactions: MessageReaction[];
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
}

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
  messages: Message[];
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

const EMOJIS = ['👍', '👎', '❤️', '😄', '😢', '🎉', '👏', '🙏', '😍', '🤔'];

const MessageBubble = ({
  message,
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onReactToMessage,
  onReplyToMessage,
  onCopyMessage
}: {
  message: Message;
  currentUserId: string;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
  onReplyToMessage: (messageId: string) => void;
  onCopyMessage: (messageId: string) => void;
}) => {
  const isSentByCurrentUser = message.senderId === currentUserId;
  const isImage = message.type === 'image';
  const isVideo = message.type === 'video';
  const isFile = message.type === 'file';
  const [showReactions, setShowReactions] = useState(false);
  const [hoveredEmoji, setHoveredEmoji] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editRef = useRef<HTMLTextAreaElement>(null);

  const handleEdit = async () => {
    if (!editText.trim()) return;
    try {
      await onEditMessage(message.id, editText);
      setEditing(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const handleDelete = async () => {
    try {
      await onDeleteMessage(message.id);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleReact = (emoji: string) => {
    const hasReacted = hasUserReacted(emoji);
    if (hasReacted) {
      // Remove reaction
      conversationAPI.removeReaction(conversationId, message.id, emoji).catch(err => {
        toast.error(err.response?.data?.message || 'Failed to remove reaction');
      });
    } else {
      // Add reaction
      conversationAPI.reactToMessage(conversationId, message.id, emoji).catch(err => {
        toast.error(err.response?.data?.message || 'Failed to react to message');
      });
    }
  };

  const handleReply = () => {
    onReplyToMessage(message.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content).then(() => {
      toast.success('Message copied to clipboard');
    });
  };

  // Get user's reaction count for an emoji
  const getMyReactionCount = (emoji: string): number => {
    const reaction = message.reactions.find(r => r.emoji === emoji);
    return reaction ? (reaction.me ? 1 : 0) : 0;
  };

  // Get total reaction count for an emoji
  const getTotalReactionCount = (emoji: string): number => {
    const reaction = message.reactions.find(r => r.emoji === emoji);
    return reaction ? reaction.count : 0;
  };

  // Check if user has reacted with this emoji
  const hasUserReacted = (emoji: string): boolean => {
    const reaction = message.reactions.find(r => r.emoji === emoji);
    return reaction ? reaction.me : false;
  };

  return (
    <div className={`mb-4 flex ${
      isSentByCurrentUser ? 'justify-end' : 'justify-start'
    }`}>
      {/* Message actions menu (for sender) */}
      {isSentByCurrentUser && !message.isDeleted && (
        <div className="mt-2 space-x-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-xs text-gray-400">
                <DotsHorizontal className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {!message.isEdited && (
                <DropdownMenuItem onClick={() => {
                  setEditing(true);
                  setEditText(message.content);
                  setTimeout(() => editRef.current?.focus(), 100);
                }}>
                  Edit
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <div className={`max-w-[80%] ${
        isSentByCurrentUser ? 'ml-auto' : 'mr-auto'
      }`}>
        {/* Message content */}
        <div className={`relative group
          max-w-[80%]
          rounded-lg px-4 py-2
          ${isSentByCurrentUser
            ? 'bg-primary-600 text-white'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
          }
        `}>
          {/* Reply preview */}
          {message.replyTo && (
            <div className="mb-2 p-2 rounded-lg border-l-2 border-primary-500 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-start space-x-2">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-xs">
                  {message.replyTo.senderName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Replying to {message.replyTo.senderName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 break-all">
                    {message.replyTo.content.length > 50
                      ? message.replyTo.content.substring(0, 50) + '...'
                      : message.replyTo.content}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Message content based on type */}
          {isImage && (
            <img
              src={`https://via.placeholder.com/400x300.png?text=${encodeURIComponent(
                message.content.substring(0, 20)
              )}`}
              alt="Image message"
              className="max-w-full rounded-lg max-h-[300px] object-cover cursor-pointer"
              onClick={() => {
                // In a real app, this would open a lightbox
                alert('Image preview would open here');
              }}
            />
          )}

          {isVideo && (
            <div className="flex items-center space-x-2">
              <Video className="h-5 w-5" />
              <span>Video message</span>
            </div>
          )}

          {isFile && (
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span className="break-all">{message.content}</span>
            </div>
          )}

          {!isImage && !isVideo && !isFile && !message.isDeleted && (
            <p className="whitespace-pre-wrap break-all">{message.content}</p>
          )}

          {message.isDeleted && (
            <p className="text-xs text-gray-400 italic">This message was deleted</p>
          )}

          {/* Message metadata */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-400">
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            {message.isEdited && (
              <span className="text-xs text-gray-500 ml-2">(edited)</span>
            )}
          </div>

          {/* Reaction bar */}
          <div className="flex flex-wrap gap-1 mt-2">
            {EMOJIS.map((emoji) => {
              const totalCount = getTotalReactionCount(emoji);
              const userHasReacted = hasUserReacted(emoji);
              const myCount = getMyReactionCount(emoji);

              return (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReact(emoji);
                  }}
                  onMouseEnter={() => setHoveredEmoji(emoji)}
                  onMouseLeave={() => setHoveredEmoji(null)}
                  className={`flex items-center justify-center p-1 rounded-md
                    ${userHasReacted ? 'bg-primary-100 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}
                    text-xs
                    ${hoveredEmoji === emoji && 'scale-110'}
                    transition-transform
                  `}
                  aria-label={`React with ${emoji}`}
                >
                  {totalCount > 0 && (
                    <span className="-mt-1 flex items-center justify-center w-2 h-2 rounded-full
                      ${userHasReacted ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-600'}"
                    >
                      {totalCount > 9 ? '9+' : totalCount}
                    </span>
                  )}
                  <span className="pointer-events-none">{emoji}</span>
                </button>
              );
            })}
          </div>

          {/* Avatar for incoming messages */}
          {!isSentByCurrentUser && !message.isDeleted && (
            <div className="absolute -left-8 flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              {message.sender.avatarUrl ? (
                <img
                  src={message.sender.avatarUrl}
                  alt={`${message.sender.firstName} ${message.sender.lastName}`}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <div className="h-6 w-6 flex items-center justify-center">
                  {message.sender.firstName.charAt(0)}{message.sender.lastName.charAt(0)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Edit mode */}
        {editing && isSentByCurrentUser && !message.isDeleted && (
          <div className="mt-2 w-full">
            <textarea
              ref={editRef}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEdit();
                }
              }}
              className="w-full min-h-[40px] resize-none p-2 rounded border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="Edit your message..."
            />
          </div>
        )}
      </div>

      {/* Sender avatar (for outgoing messages in group chats) */}
      {isSentByCurrentUser && !message.isDeleted && (
        <div className="absolute right-0 flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
          {message.sender.avatarUrl ? (
            <img
              src={message.sender.avatarUrl}
              alt={`${message.sender.firstName} ${message.sender.lastName}`}
              className="h-6 w-6 rounded-full object-cover"
            />
          ) : (
            <div className="h-6 w-6 flex items-center justify-center">
              {message.sender.firstName.charAt(0)}{message.sender.lastName.charAt(0)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ConversationPage = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isScrolledToBottomRef = useRef(true);

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId) return;

    const loadConversation = async () => {
      try {
        setLoading(true);
        const convResponse = await conversationAPI.getConversation(conversationId);
        setConversation(convResponse.data.conversation);

        // Fetch messages
        const messagesResponse = await conversationAPI.getMessages(conversationId);
        setMessages(messagesResponse.data.messages);
      } catch (err: any) {
        setError(
          err.response?.data?.message ||
            'Failed to load conversation'
        );
      } finally {
        setLoading(false);
      }
    };

    loadConversation();
  }, [conversationId]);

  // Join conversation socket room when component mounts
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    // Join the conversation room for real-time updates
    conversationSocket.joinConversation(conversationId);

    // Set up real-time message listener
    const unsubscribeMessages = conversationSocket.onMessageReceived(
      (message: Message) => {
        // Avoid adding duplicate messages
        if (!messages.some(m => m.id === message.id)) {
          setMessages(prev => [...prev, message].sort((a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          ));

          // Scroll to bottom when new message arrives
          if (isScrolledToBottomRef.current) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    );

    // Set up typing indicator listener
    const unsubscribeTyping = conversationSocket.onTyping((data: {
      userId: number;
      conversationId: string;
      isTiming: boolean
    }) => {
      if (data.conversationId === conversationId) {
        if (data.isTyping) {
          setTypingUsers(prev => new Set(prev).add(data.userId.toString()));
        } else {
          setTypingUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId.toString());
            return newSet;
          });
        }
      }
    });

    // Cleanup on unmount
    return () => {
      conversationSocket.leaveConversation(conversationId);
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [conversationId, user?.id, messages.length]);

  // Handle scroll position to determine if user is scrolled to bottom
  useEffect(() => {
    const handleScroll = () => {
      if (!messagesEndRef.current) return;

      const { scrollTop, scrollHeight, clientHeight } = messagesEndRef.current;
      isScrolledToBottomRef.current = (scrollHeight - scrollTop - clientHeight) < 100;
    };

    const container = document.querySelector('.flex-1.overflow-y-auto');
    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle typing indicator
  useEffect(() => {
    if (!conversationId || !user?.id || inputValue === '') {
      if (isTyping) {
        conversationSocket.typingStop(conversationId);
        setIsTyping(false);
      }
      return;
    }

    if (!isTyping && inputValue.length > 0) {
      conversationSocket.typingStart(conversationId);
      setIsTyping(true);
    }

    // Debounce typing stop
    if (typingTimer) {
      clearTimeout(typingTimer);
    }

    const timer = setTimeout(() => {
      if (inputValue === '') {
        conversationSocket.typingStop(conversationId);
        setIsTyping(false);
      }
    }, 1000);

    setTypingTimer(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, conversationId, user?.id, isTyping, typingTimer]);

  // Scroll to bottom when messages change and user is already at bottom
  useEffect(() => {
    if (isScrolledToBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    try {
      const response = await conversationAPI.sendMessage(
        conversationId,
        inputValue.trim(),
        undefined, // type defaults to text
        replyToMessage?.id // reply to message ID of message we're replying to
      );

      // Clear input and reply state
      setInputValue('');
      setReplyToMessage(null);

      // Scroll to bottom
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          'Failed to send message'
      );
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await conversationAPI.updateMessage(conversationId, messageId, { content: newContent });
      // Optimistic update - the socket will broadcast the actual update
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await conversationAPI.deleteMessage(conversationId, messageId);
      // Optimistic update - the socket will broadcast the actual deletion
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete message');
    }
  };

  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      await conversationAPI.reactToMessage(conversationId, messageId, emoji);
      // Optimistic update - the socket will broadcast the actual reaction
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to react to message');
    }
  };

  const handleReplyToMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      setReplyToMessage(message);
      // Focus the input after setting reply
      setTimeout(() => {
        const textarea = document.querySelector('textarea, input[type="text"]') as HTMLTextAreaElement | HTMLInputElement;
        textarea?.focus();
      }, 100);
    }
  };

  const handleCopyMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      navigator.clipboard.writeText(message.content).then(() => {
        toast.success('Message copied to clipboard');
      });
    }
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const handleAttachmentClick = () => {
    // In a real app, this would open a file picker
    alert('Attachment feature would open file picker here');
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] flex-col">
        <div className="flex h-16 items-center justify-between bg-gray-50 dark:bg-gray-800 px-4 border-b">
          <button onClick={handleBack} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Loading conversation...</h1>
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Typing...</span>
          </div>
        </div>
        <div className="flex-1 flex-col">
          <div className="flex flex-col overflow-y-auto p-4">
            <div className="text-center py-8">
              <Loader2 className="h-6 w-6 mx-auto mb-2 text-gray-400 animate-spin" />
              <p className="text-sm text-gray-500">Loading messages...</p>
            </div>
          </div>
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

  if (!conversation) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive-600">
          Conversation not found
        </h2>
        <Button onClick={handleBack}>
          Go back to conversations
        </Button>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="flex h-[calc(100vh-64px)] flex-col bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-b">
          <button onClick={handleBack} className="text-gray-600 hover:text-gray-800 mr-4">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-4">
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
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {conversation.name || 'Unnamed Chat'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {conversation.participants
                  .filter(p => p.id !== user?.id)
                  .map(p => `${p.firstName} ${p.lastName}`)
                  .join(', ')}
                {typingUsers.size > 0 && (
                  <span className="ml-2 text-xs italic">
                    {Array.from(typingUsers)
                      .map(id =>
                        conversation.participants
                          .find(p => p.id === id)?.firstName || 'Someone'
                      )
                      .join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                  </span>
                )}
              </p>
              <div className="flex items-center space-x-2">
                {/* Video call button */}
                <button
                  title="Video call"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Video className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
                {/* Voice call button */}
                <button
                  title="Voice call"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
                {/* Info button */}
                <button
                  title="Group info"
                  className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Messages container */}
        <div className="flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 space-y-3" ref={messagesEndRef} id="messages-container">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                currentUserId={user?.id || ''}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                onReplyToMessage={handleReplyToMessage}
                onCopyMessage={handleCopyMessage}
              />
            ))}
            <div ref={messagesEndRef} id="messages-end" />
          </div>

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400">
              {Array.from(typingUsers)
                .map(id =>
                  conversation.participants
                    .find(p => p.id === id)?.firstName || 'Someone'
                )
                .join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="flex items-center gap-2 p-4 bg-white dark:bg-gray-800 border-t">
          <button
            onClick={handleAttachmentClick}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Paperclip className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Smile className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>

          {showEmojiPicker && (
            <div className="relative mt-2 w-full">
              <div className="absolute left-0 -top-10 w-full flex flex-wrap gap-1 p-1 bg-white dark:bg-gray-700 rounded-lg shadow-lg z-10">
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiClick(emoji)}
                    className="flex items-center justify-center p-1 rounded-md hover:bg-primary-100 text-primary-600 text-lg"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            }
          )}

          <form onSubmit={handleSendMessage} className="flex-1">
            <div className="relative">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    e.target.form?.requestSubmit?.();
                  }
                }}
                placeholder="Type a message..."
                className="w-full min-h-[40px] resize-none p-4 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm shadow-sm"
                ref={replyToMessage ? undefined : undefined} // Focus ref would go here
              />
              {replyToMessage && (
                <div className="absolute right-3 top-2.5 flex items-center space-x-2 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setReplyToMessage(null)}
                    className="text-gray-500 hover:text-gray-600"
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Replying to {replyToMessage.sender.firstName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {replyToMessage.content.length > 30
                        ? replyToMessage.substring(0, 30) + '...'
                        : replyToMessage.content}
                    </p>
                  </div>
                </div>
              )}
              {isTyping && (
                <div className="absolute right-3 top-2.5 flex space-x-1 pointer-events-none">
                  {[1, 2, 3].map((i, index) => (
                    <div key={index} className={`h-1.5 w-1.5 bg-primary-500 rounded-full animate-bounce ${index * 200}ms`} />
                  ))}
                </div>
              )}
              <button
                type="submit"
                className="absolute right-3 top-2.5 h-8 w-8 rounded-lg bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </ToastProvider>
  );
};

export default ConversationPage;