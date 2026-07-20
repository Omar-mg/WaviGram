import { Link, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  User,
  MessageCircle,
  Users,
  Image as ImageIcon,
  Calendar,
  Sparkles,
  ExternalLink,
  MapPin,
  Edit2,
  Truck,
  Settings as SettingsIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { userAPI } from '@/services/userAPI';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alumni, BadgeCheck, Brain, Flame, Heart, Sparkle, Target, Trophy, Users as UsersIcon } from 'lucide-react';

interface ProfileStats {
  posts: number;
  followers: number;
  following: number;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  bio: string;
  website: string | null;
  location: string | null;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  stats: ProfileStats;
}

export const ProfilePage = () => {
  const { id: profileId } = useParams<{ id: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

  useEffect(() => {
    const loadProfile = async () => {
      if (!profileId) return;

      try {
        setLoading(true);
        // Fetch profile data
        const profileResponse = await userAPI.getUserById(profileId);
        const userData = profileResponse.data.user;

        // Fetch followers count
        const followersResponse = await userAPI.getFollowers(profileId);
        const followersCount = followersResponse.data.total || 0;

        // Fetch following count
        const followingResponse = await userAPI.getFollowing(profileId);
        const followingCount = followingResponse.data.total || 0;

        // For now, mock posts count - in real app this would come from posts API
        const postsCount = Math.floor(Math.random() * 100);

        setProfile({
          id: userData.id,
          firstName: userData.firstName,
          lastName: userData.lastName,
          avatarUrl: userData.avatarUrl,
          coverUrl: userData.coverUrl,
          bio: userData.bio || '',
          website: userData.website,
          location: userData.location,
          isVerified: userData.isVerified,
          isActive: userData.isActive,
          createdAt: userData.createdAt,
          stats: {
            posts: postsCount,
            followers: followersCount,
            following: followingCount
          }
        });
      } catch (err: any) {
        console.error('Failed to load profile:', err);
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  const isOwnProfile = currentUser?.id === profileId;
  const isFollowing = profile?.followers?.some((f: any) => f.id === currentUser?.id) || false;

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center py-12">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-600 border-t-transparent"></div>
          <span className="text-gray-500">Loading profile...</span>
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

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-destructive-600">Profile not found</h2>
        <Button onClick={() => window.history.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900">
      {/* Cover Image */}
      {profile.coverUrl && (
        <div className="h-48 w-full bg-cover bg-center" style={{ backgroundImage: `url(${profile.coverUrl})` }} />
      )}

      <div className="mt-[-3rem] flex flex-col items-center">
        {/* Avatar */}
        <div className="relative h-20 w-20">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={`${profile.firstName} ${profile.lastName}'s avatar`}
              className="h-full w-full rounded-full ring-4 ring-white dark:ring-gray-800 object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-primary-600 text-white rounded-full">
              {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
            </div>
          )}
          {isOwnProfile && (
            <button
              onClick={() => {
                // Trigger file upload for avatar
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    // In real app, upload file and update profile
                    alert('Avatar upload would be implemented here');
                  }
                };
                input.click();
              }}
              className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center bg-primary-600 text-white rounded-full shadow hover:bg-primary-700"
              title="Change avatar"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Name and Verification */}
        <div className="mt-4 flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {profile.firstName} {profile.lastName}
          </h1>
          {profile.isVerified && (
            <BadgeCheck className="h-4 w-4 text-primary-500" />
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-xl text-center">
            {profile.bio}
          </p>
        )}

        {/* Location and Website */}
        <div className="mt-2 flex flex-col items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
          {profile.location && (
            <>
              <MapPin className="h-3 w-3 mr-1" />
              <span>{profile.location}</span>
            </>
          )}
          {profile.website && (
            <>
              <ExternalLink className="h-3 w-3 mr-1" />
              <span className="underline">{profile.website}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        {isOwnProfile ? (
          <Button
            onClick={() => {
              // Navigate to edit profile page
              // In a real app, this would navigate to /profile/edit
              alert('Edit profile functionality would go here');
            }}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Edit Profile
          </Button>
        ) : (
          <>
            <Button
              onClick={async () => {
                try {
                  if (isFollowing) {
                    await userAPI.unfollowUser(profileId);
                  } else {
                    await userAPI.followUser(profileId);
                  }
                  // Refetch profile to update follow status
                  // In a real app, we'd update state or refetch
                  alert(isFollowing ? 'Unfollowed user' : 'Followed user');
                } catch (err: any) {
                  alert(err.response?.data?.message || 'Failed to update follow status');
                }
              }}
              className="mt-4 px-6 py-2 border border-primary-600 text-primary-600 hover:bg-primary-50"
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Button>

            <Button
              onClick={() => {
                // In a real app, this would open a message composer
                alert('Message functionality would open here');
              }}
              className="mt-2 px-6 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Message
            </Button>
          </>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 flex items-center space-x-6 px-6">
        <div className="text-center flex-1 border-r border-gray-200 py-3 last:border-r-0">
          <p className="text-sm font-medium text-gray-500">Posts</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.stats.posts}</p>
        </div>
        <div className="text-center flex-1 border-r border-gray-200 py-3 last:border-r-0">
          <p className="text-sm font-medium text-gray-500">Followers</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.stats.followers}</p>
        </div>
        <div className="text-center flex-1 py-3">
          <p className="text-sm font-medium text-gray-500">Following</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{profile.stats.following}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'posts' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}`}
        >
          Posts
        </button>
        <button
          onClick={() => setActiveTab('followers')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'followers' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}`}
        >
          Followers ({profile.stats.followers})
        </button>
        <button
          onClick={() => setActiveTab('following')}
          className={`px-4 py-2 border-b-2 ${activeTab === 'following' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-600'}`}
        >
          Following ({profile.stats.following})
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-4 p-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            <p className="text-center text-gray-500">
              No posts yet. Share something to get started!
            </p>
            <Button
              onClick={() => {
                // Navigate to create post
                alert('Create post functionality would go here');
              }}
              className="w-full"
            >
              Create Post
            </Button>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-4">
            <p className="text-center text-gray-500">
              No followers yet.
            </p>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-4">
            <p className="text-center text-gray-500">
              Not following anyone yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};