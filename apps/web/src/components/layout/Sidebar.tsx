import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

interface NavEntry {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

const PRIMARY_NAV: ReadonlyArray<NavEntry> = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/messages', label: 'Messages', icon: MessageSquare },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/stories', label: 'Stories', icon: ImageIcon },
  { to: '/events', label: 'Events', icon: Calendar }
];

const linkClass = ({ isActive }: { isActive: boolean }): string =>
  cn(
    'flex items-center gap-3 rounded-md px-4 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
  );

export const Sidebar = () => {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-4 dark:border-gray-800">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 text-white">
          <Zap className="h-4 w-4" />
        </span>
        <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">WaviGram</span>
      </div>

      <nav className="mt-4 flex-1 space-y-1 px-2" aria-label="Sidebar">
        {PRIMARY_NAV.map((entry) => {
          const Icon = entry.icon;
          return (
            <NavLink key={entry.to} to={entry.to} end={entry.end} className={linkClass}>
              <Icon className="h-4 w-4" />
              {entry.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-gray-200 p-2 dark:border-gray-800">
        <button
          type="button"
          onClick={() => {
            logout();
          }}
          className="flex w-full items-center gap-3 rounded-md px-4 py-2 text-sm font-medium text-destructive-700 hover:bg-destructive-50 dark:text-destructive-300 dark:hover:bg-destructive-900/30"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
};
