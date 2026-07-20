import { useEffect, useState } from 'react';
import {
  Search,
  Bell,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Calendar,
  Plus,
  Video,
  Circle,
  UserPlus,
  Settings as SettingsIcon,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/Input';
import { conversationAPI } from '@/services/api';

type ActivityType = 'message' | 'friend' | 'post' | 'event' | 'story';

interface ActivityItemData {
  id: string;
  type: ActivityType;
  from: string;
  content: string;
  time: string;
  unread?: boolean;
  hasMedia?: boolean;
}

const STATS_PLACEHOLDER: ReadonlyArray<{
  title: string;
  value: string;
  icon: ReactNode;
  trend: string;
  positive: boolean;
}> = [
  {
    title: 'Messages',
    value: '0',
    icon: <MessageCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    trend: '0%',
    positive: true
  },
  {
    title: 'Friends',
    value: '0',
    icon: <Users className="h-4 w-4 text-success-600 dark:text-success-400" />,
    trend: '0',
    positive: true
  },
  {
    title: 'Stories',
    value: '0',
    icon: <ImageIcon className="h-4 w-4 text-accent-600 dark:text-accent-400" />,
    trend: '0',
    positive: false
  },
  {
    title: 'Events',
    value: '0',
    icon: <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    trend: '0',
    positive: true
  }
];

const QUICK_ACTIONS: ReadonlyArray<{
  title: string;
  description: string;
  icon: ReactNode;
  href: string;
}> = [
  {
    title: 'New Message',
    description: 'Start a conversation',
    icon: <MessageCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    href: '/messages/compose'
  },
  {
    title: 'Create Post',
    description: "Share what's on your mind",
    icon: <Plus className="h-4 w-4 text-success-600 dark:text-success-400" />,
    href: '/posts/create'
  },
  {
    title: 'Add Friend',
    description: 'Find and connect with people',
    icon: <UserPlus className="h-4 w-4 text-accent-600 dark:text-accent-400" />,
    href: '/friends/add'
  },
  {
    title: 'Go Live',
    description: 'Start a video stream',
    icon: <Video className="h-4 w-4 text-destructive-600 dark:text-destructive-400" />,
    href: '/live'
  },
  {
    title: 'Create Story',
    description: 'Share a moment',
    icon: <Circle className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
    href: '/stories/create'
  },
  {
    title: 'Settings',
    description: 'Manage your account',
    icon: <SettingsIcon className="h-4 w-4 text-gray-600 dark:text-gray-300" />,
    href: '/settings'
  }
];

const activityIcon = (type: ActivityType): ReactNode => {
  switch (type) {
    case 'message':
      return <MessageCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
    case 'friend':
      return <UserPlus className="h-4 w-4 text-success-600 dark:text-success-400" />;
    case 'post':
      return <ImageIcon className="h-4 w-4 text-accent-600 dark:text-accent-400" />;
    case 'event':
      return <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />;
    case 'story':
      return <Circle className="h-4 w-4 text-accent-600 dark:text-accent-400" />;
    default:
      return <Circle className="h-4 w-4 text-gray-400" />;
  }
};

export const DashboardPage = () => {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState(STATS_PLACEHOLDER);
  const [activity, setActivity] = useState<ActivityItemData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since we don't have stats endpoints yet
      // In a real implementation, we'd call an API like: const response = await dashboardAPI.getStats();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock stats based on user data - in reality this would come from API
      const userStats = [
        {
          title: 'Messages',
          value: '124',
          icon: <MessageCircle className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
          trend: '+12%',
          positive: true
        },
        {
          title: 'Friends',
          value: '89',
          icon: <Users className="h-4 w-4 text-success-600 dark:text-success-400" />,
          trend: '+5 this week',
          positive: true
        },
        {
          title: 'Stories',
          value: '12',
          icon: <ImageIcon className="h-4 w-4 text-accent-600 dark:text-accent-400" />,
          trend: '-2',
          positive: false
        },
        {
          title: 'Events',
          value: '3',
          icon: <Calendar className="h-4 w-4 text-primary-600 dark:text-primary-400" />,
          trend: '+1',
          positive: true
        }
      ];

      setStats(userStats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Keep placeholder data on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent activity
  const fetchRecentActivity = async () => {
    try {
      // For now, we'll use mock activity since we don't have activity endpoints yet
      // In a real implementation, we'd call an API like: const response = await activityAPI.getRecent();

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      // Mock activity data - in reality this would come from API
      const mockActivity: ActivityItemData[] = [
        {
          id: 'a1',
          type: 'message',
          from: 'Sarah Johnson',
          content: "Hey! Did you get my message about the party tonight?",
          time: '2m ago',
          unread: true
        },
        {
          id: 'a2',
          type: 'friend',
          from: 'Michael Chen',
          content: 'accepted your friend request',
          time: '15m ago'
        },
        {
          id: 'a3',
          type: 'post',
          from: 'Alex Morgan',
          content: 'just posted a new photo',
          time: '1h ago',
          hasMedia: true
        },
        {
          id: 'a4',
          type: 'event',
          from: 'Team',
          content: 'Reminder: Team meeting in 30 minutes',
          time: '2h ago'
        }
      ];

      setActivity(mockActivity);
    } catch (error) {
      console.error('Failed to fetch recent activity:', error);
      setActivity([]);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Demo only — a real app would dispatch a query to the backend here.
    setTimeout(() => {
      setIsSearching(false);
    }, 800);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Here&apos;s what&apos;s happening in your world today.
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full max-w-xs lg:w-80">
            <Input
              type="search"
              placeholder="Search people, messages, or content…"
              leftIcon={<Search className="h-4 w-4" />}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              name="search"
            />
          </form>
        </div>

        <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS_PLACEHOLDER.map((stat) => (
            <article
              key={stat.title}
              className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {stat.icon}
                  <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {stat.title}
                  </h2>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    stat.positive
                      ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300'
                      : 'bg-destructive-100 text-destructive-700 dark:bg-destructive-900/40 dark:text-destructive-300'
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
            </article>
          ))}
        </section>

        <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action) => (
            <a
              key={action.title}
              href={action.href}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                {action.icon}
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">{action.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </a>
          ))}
        </section>

        <section
          aria-label="Recent activity"
          className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
        >
          <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent-500" aria-hidden="true" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Recent activity
              </h2>
            </div>
            <a
              href="/activity"
              className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
            >
              See all
            </a>
          </header>

          <div className="flex items-center justify-center gap-3 p-12 text-sm text-gray-500 dark:text-gray-400">
            <Search className="h-4 w-4 animate-pulse" aria-hidden="true" />
            <span>Searching for &ldquo;{searchQuery}&rdquo;…</span>
          </div>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {[
              {
                id: 'a1',
                type: 'message',
                from: 'Sarah Johnson',
                content: "Hey! Did you get my message about the party tonight?",
                time: '2m ago',
                unread: true
              },
              {
                id: 'a2',
                type: 'friend',
                from: 'Michael Chen',
                content: 'accepted your friend request',
                time: '15m ago'
              },
              {
                id: 'a3',
                type: 'post',
                from: 'Alex Morgan',
                content: 'just posted a new photo',
                time: '1h ago',
                hasMedia: true
              },
              {
                id: 'a4',
                type: 'event',
                from: 'Team',
                content: 'Reminder: Team meeting in 30 minutes',
                time: '2h ago'
              }
            ].map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div className="mt-0.5 flex-shrink-0">{activityIcon(item.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {item.from}
                    </p>
                    <p className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {item.time}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.content}
                  </p>
                  {item.hasMedia && (
                    <div className="mt-2 h-16 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                {item.unread && (
                  <span
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-600"
                    aria-label="Unread"
                  />
                )}
              </li>
            ))}
          </ul>
        </section>

        <aside className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span>Notifications will appear here once the API is wired up.</span>
          </div>
          <a
            href="/settings"
            className="font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            Manage
          </a>
        </aside>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Here&apos;s what&apos;s happening in your world today.
          </p>
        </div>

        <form onSubmit={handleSearch} className="w-full max-w-xs lg:w-80">
          <Input
            type="search"
            placeholder="Search people, messages, or content…"
            leftIcon={<Search className="h-4 w-4" />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            name="search"
          />
        </form>
      </div>

      <section aria-label="Stats" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.title}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {stat.icon}
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h2>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  stat.positive
                    ? 'bg-success-100 text-success-700 dark:bg-success-900/40 dark:text-success-300'
                    : 'bg-destructive-100 text-destructive-700 dark:bg-destructive-900/40 dark:text-destructive-300'
                }`}
              >
                {stat.trend}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
          </article>
        ))}
      </section>

      <section aria-label="Quick actions" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map((action) => (
          <a
            key={action.title}
            href={action.href}
            className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="flex items-center gap-3">
              {action.icon}
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">{action.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
          </a>
        ))}
      </section>

      <section
        aria-label="Recent activity"
        className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800"
      >
        <header className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent activity
            </h2>
          </div>
          <a
            href="/activity"
            className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-400"
          >
            See all
          </a>
        </header>

        {isSearching ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-gray-500 dark:text-gray-400">
            <Search className="h-4 w-4 animate-pulse" aria-hidden="true" />
            <span>Searching for &ldquo;{searchQuery}&rdquo;…</span>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {activity.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-3 p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/40"
              >
                <div className="mt-0.5 flex-shrink-0">{activityIcon(item.type)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium text-gray-900 dark:text-gray-100">
                      {item.from}
                    </p>
                    <p className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
                      {item.time}
                    </p>
                  </div>
                  <p className="line-clamp-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.content}
                  </p>
                  {item.hasMedia && (
                    <div className="mt-2 h-16 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  )}
                </div>
                {item.unread && (
                  <span
                    className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-primary-600"
                    aria-label="Unread"
                  />
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <aside className="flex items-center justify-between rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" aria-hidden="true" />
          <span>Notifications will appear here once the API is wired up.</span>
        </div>
        <a
          href="/settings"
          className="font-medium text-primary-600 hover:underline dark:text-primary-400"
        >
          Manage
        </a>
      </aside>
    </div>
  );
};