import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, Search, Plus, ChevronRight, ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { userAPI } from '@/services/userAPI';
import { conversationAPI } from '@/services/conversationAPI';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  isVerified: boolean;
}

export const NewConversationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState('');

  // Search for users
  useEffect(() => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.searchUsers(searchQuery);
        setUsers(response.data.users || []);
      } catch (err: any) {
        console.error('Error searching users:', err);
      } finally {
        setLoading(false);
      }
    };

    searchUsers();
  }, [searchQuery]);

  const handleUserSelect = (userId: string) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const handleCreateConversation = async () => {
    if (selectedUsers.length === 0) {
      return;
    }

    try {
      setLoading(true);
      const response = await conversationAPI.createConversation({
        participantIds: selectedUsers,
        name: isGroupChat ? groupName : undefined,
        isGroup: isGroupChat
      });

      // Navigate to the new conversation
      navigate(`/messages/${response.data.conversation.id}`);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        'Failed to create conversation'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/messages');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-b">
        <button onClick={handleCancel} className="text-gray-600 hover:text-gray-800 mr-4">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {isGroupChat ? 'New Group Chat' : 'New Message'}
        </h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsGroupChat(false)}
            className={`px-2 py-1 rounded-sm text-xs font-medium ${
              !isGroupChat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Direct Message
          </button>
          <button
            onClick={() => setIsGroupChat(true)}
            className={`px-2 py-1 rounded-sm text-xs font-medium ${
              isGroupChat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            }`}
          >
            Group Chat
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        <div className="p-6">
          {/* Search for users */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Find people to message
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or username..."
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all"
              />
              {loading && (
                <div className="absolute right-3 top-2.5 h-4 w-4 flex items-center justify-center">
                  <div className="h-2 w-2 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-6">
              <div className="flex flex="flex flex-wrap gap-2">
                {selectedUsers.map((userId) => {
                  const user = users.find(u => u.id === userId);
                  if (!user) return null;
                  return (
                    <div key={user.id} className="flex items-center bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm">
                      <span className="mr-1">
                        {user.avatarUrl ? (
                          <img
                            src={user.avatarUrl}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-6 w-6 flex items-center justify-center">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </div>
                        )}
                      </span>
                      <span>{`${user.firstName} ${user.lastName}`}</span>
                      <button
                        onClick={() => handleUserSelect(user.id)}
                        className="ml-2 text-xs hover:text-primary-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {selectedUsers.length === 1
                  ? '1 person selected'
                  : `${selectedUsers.length} people selected`}
              </p>
            </div>
          )}

          {/* Users list */}
          {!loading && (
            <div className="space-y-1">
              {users.length > 0 ? (
                <div className="space-y-1">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer`}
                      onClick={() => handleUserSelect(user.id)}
                    >
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="h-6 w-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-6 w-6 flex items-center justify-center">
                              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {user.isVerified && (
                            <span className="ml-1 h-2 w-2 rounded-full bg-primary-500" />
                          )}
                          Verified user
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {selectedUsers.includes(user.id) && (
                          <Check className="h-4 w-4 text-primary-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-gray-500">
                  {searchQuery
                    ? 'No users found'
                    : 'Start typing to search for users'}
                </p>
              )}
            </div>
          )}

          {/* Group name input (if group chat) */}
          {isGroupChat && selectedUsers.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Group name (optional)
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter a name for this group..."
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex h-16 items-center justify-between bg-white dark:bg-gray-800 border-t">
        <div className="flex-1 px-6">
          <p className="text-xs text-gray-500">
            {selectedUsers.length === 0
              ? 'Select at least one person to start a conversation'
              : selectedUsers.length === 1
              ? '1 person selected'
              : `${selectedUsers.length} people selected`}
          </p>
        </div>
        <Button
          onClick={handleCreateConversation}
          isLoading={loading}
          disabled={selectedUsers.length === 0 || loading}
        >
          {isGroupChat ? 'Create Group' : 'Start Chat'}
        </Button>
      </div>
    </div>
  );
};

export default NewConversationPage;