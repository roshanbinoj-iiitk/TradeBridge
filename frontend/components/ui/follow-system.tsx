"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Search, 
  Star, 
  MapPin,
  TrendingUp,
  Shield,
  MessageSquare
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';

interface UserSummary {
  user_id: string;
  display_name: string;
  profile_image_url: string;
  location: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
  total_rentals_as_lender: number;
  total_rentals_as_borrower: number;
  user: {
    name: string;
  };
  trust_score?: {
    overall_trust_score: number;
    lender_rating: number;
    borrower_rating: number;
  };
  is_following?: boolean;
}

interface FollowSystemProps {
  userId?: string;
  className?: string;
}

export default function FollowSystem({ userId, className }: FollowSystemProps) {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<UserSummary[]>([]);
  const [following, setFollowing] = useState<UserSummary[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('suggested');

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchFollowData();
    }
  }, [currentUserId]);

  const fetchFollowData = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();
      
      // Fetch followers
      const { data: followersData, error: followersError } = await supabase
        .from('user_follows')
        .select(`
          follower_id,
          user_profiles!user_follows_follower_id_fkey(
            user_id,
            display_name,
            profile_image_url,
            location,
            is_verified,
            follower_count,
            following_count,
            total_rentals_as_lender,
            total_rentals_as_borrower,
            user:users!user_profiles_user_id_fkey(name)
          )
        `)
        .eq('following_id', currentUserId);

      if (followersError) throw followersError;

      // Fetch following
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select(`
          following_id,
          user_profiles!user_follows_following_id_fkey(
            user_id,
            display_name,
            profile_image_url,
            location,
            is_verified,
            follower_count,
            following_count,
            total_rentals_as_lender,
            total_rentals_as_borrower,
            user:users!user_profiles_user_id_fkey(name)
          )
        `)
        .eq('follower_id', currentUserId);

      if (followingError) throw followingError;

      // Get suggested users (users with high trust scores, active lenders, etc.)
      const { data: suggestedData, error: suggestedError } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          profile_image_url,
          location,
          is_verified,
          follower_count,
          following_count,
          total_rentals_as_lender,
          total_rentals_as_borrower,
          user:users!user_profiles_user_id_fkey(name),
          user_trust_scores(overall_trust_score, lender_rating, borrower_rating)
        `)
        .neq('user_id', currentUserId)
        .eq('is_public', true)
        .gte('total_rentals_as_lender', 1)
        .order('follower_count', { ascending: false })
        .limit(20);

      if (suggestedError) throw suggestedError;

      // Check which suggested users are already being followed
      const followingIds = followingData?.map(f => (f.user_profiles as any).user_id) || [];
      
      const processedSuggested = suggestedData?.map(user => ({
        user_id: user.user_id,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url,
        location: user.location,
        is_verified: user.is_verified,
        follower_count: user.follower_count,
        following_count: user.following_count,
        total_rentals_as_lender: user.total_rentals_as_lender,
        total_rentals_as_borrower: user.total_rentals_as_borrower,
        user: {
          name: (user.user as any)?.name || ''
        },
        trust_score: user.user_trust_scores?.[0] || null,
        is_following: followingIds.includes(user.user_id)
      })) || [];

      setFollowers(followersData?.map(f => (f.user_profiles as any)) || []);
      setFollowing(followingData?.map(f => (f.user_profiles as any)) || []);
      setSuggestedUsers(processedSuggested);
    } catch (error) {
      console.error('Error fetching follow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });

        if (error) throw error;

        // Create notification for the followed user
        await supabase
          .from('notifications')
          .insert({
            user_id: targetUserId,
            notification_type: 'new_follower',
            title: 'New Follower',
            message: `${user.user_metadata?.name || 'Someone'} started following you`,
            related_user_id: user.id
          });
      }

      // Update local state
      setSuggestedUsers(prev =>
        prev.map(u =>
          u.user_id === targetUserId
            ? { 
                ...u, 
                is_following: !isFollowing,
                follower_count: isFollowing 
                  ? Math.max(u.follower_count - 1, 0)
                  : u.follower_count + 1
              }
            : u
        )
      );

      setFollowing(prev => {
        if (isFollowing) {
          return prev.filter(u => u.user_id !== targetUserId);
        } else {
          const newFollowing = suggestedUsers.find(u => u.user_id === targetUserId);
          return newFollowing ? [...prev, newFollowing] : prev;
        }
      });
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      fetchFollowData();
      return;
    }

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          user_id,
          display_name,
          profile_image_url,
          location,
          is_verified,
          follower_count,
          following_count,
          total_rentals_as_lender,
          total_rentals_as_borrower,
          user:users!user_profiles_user_id_fkey(name),
          user_trust_scores(overall_trust_score, lender_rating, borrower_rating)
        `)
        .neq('user_id', currentUserId)
        .eq('is_public', true)
        .or(`display_name.ilike.%${query}%,user.name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;

      // Check follow status for search results
      const followingIds = following.map(f => f.user_id);
      
      const searchResults = data?.map(user => ({
        user_id: user.user_id,
        display_name: user.display_name,
        profile_image_url: user.profile_image_url,
        location: user.location,
        is_verified: user.is_verified,
        follower_count: user.follower_count,
        following_count: user.following_count,
        total_rentals_as_lender: user.total_rentals_as_lender,
        total_rentals_as_borrower: user.total_rentals_as_borrower,
        user: {
          name: (user.user as any)?.name || ''
        },
        trust_score: user.user_trust_scores?.[0] || null,
        is_following: followingIds.includes(user.user_id)
      })) || [];

      setSuggestedUsers(searchResults);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const UserCard = ({ userSummary }: { userSummary: UserSummary }) => (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userSummary.profile_image_url} />
          <AvatarFallback>
            {(userSummary.display_name || userSummary.user.name).substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">
              {userSummary.display_name || userSummary.user.name}
            </h4>
            {userSummary.is_verified && (
              <Shield className="h-4 w-4 text-blue-500" />
            )}
          </div>
          
          {userSummary.location && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <MapPin className="h-3 w-3" />
              {userSummary.location}
            </div>
          )}
          
          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
            <span>{userSummary.follower_count} followers</span>
            {userSummary.total_rentals_as_lender > 0 && (
              <span>{userSummary.total_rentals_as_lender} items lent</span>
            )}
            {userSummary.trust_score && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{userSummary.trust_score.lender_rating.toFixed(1)}</span>
              </div>
            )}
          </div>
        </div>
        
        {user && user.id !== userSummary.user_id && (
          <Button
            size="sm"
            variant={userSummary.is_following ? "outline" : "default"}
            onClick={() => handleFollow(userSummary.user_id, userSummary.is_following || false)}
            className="flex items-center gap-1"
          >
            {userSummary.is_following ? (
              <>
                <UserCheck className="h-3 w-3" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="h-3 w-3" />
                Follow
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-4 bg-gray-100 rounded">
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Connect with Others
          </CardTitle>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="suggested">
                Suggested
                <Badge variant="secondary" className="ml-2">
                  {suggestedUsers.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="following">
                Following
                <Badge variant="secondary" className="ml-2">
                  {following.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="followers">
                Followers
                <Badge variant="secondary" className="ml-2">
                  {followers.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="suggested" className="space-y-4 mt-4">
              {searchQuery ? (
                <div className="text-sm text-gray-600 mb-4">
                  Search results for "{searchQuery}"
                </div>
              ) : (
                <div className="text-sm text-gray-600 mb-4">
                  Discover trusted lenders and active community members
                </div>
              )}
              
              {suggestedUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>{searchQuery ? 'No users found' : 'No suggestions available'}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {suggestedUsers.map((userSummary) => (
                    <UserCard key={userSummary.user_id} userSummary={userSummary} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="following" className="space-y-4 mt-4">
              {following.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>You're not following anyone yet</p>
                  <p className="text-sm">Discover trusted lenders to follow</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {following.map((userSummary) => (
                    <UserCard key={userSummary.user_id} userSummary={{...userSummary, is_following: true}} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="followers" className="space-y-4 mt-4">
              {followers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>No followers yet</p>
                  <p className="text-sm">Share great products to attract followers</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {followers.map((userSummary) => (
                    <UserCard key={userSummary.user_id} userSummary={userSummary} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{following.length}</div>
            <div className="text-sm text-gray-600">Following</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{followers.length}</div>
            <div className="text-sm text-gray-600">Followers</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {suggestedUsers.filter(u => !u.is_following).length}
            </div>
            <div className="text-sm text-gray-600">Suggested</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
