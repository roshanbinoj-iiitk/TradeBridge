"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  User, 
  MapPin, 
  Globe, 
  Calendar, 
  Star, 
  Package, 
  Users, 
  MessageSquare,
  Share2,
  UserPlus,
  UserCheck,
  Shield,
  Award,
  TrendingUp,
  Heart,
  Eye
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';
import TrustScoreDisplay from './trust-score-display';
import ReviewSystem from './review-system';

interface UserProfile {
  user_id: string;
  display_name: string;
  bio: string;
  profile_image_url: string;
  cover_image_url: string;
  location: string;
  website_url: string;
  follower_count: number;
  following_count: number;
  total_rentals_as_lender: number;
  total_rentals_as_borrower: number;
  is_public: boolean;
  show_rental_history: boolean;
  show_reviews: boolean;
  is_verified: boolean;
  verification_type: string;
  last_active: string;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  badges: Array<{
    badge_name: string;
    badge_description: string;
    badge_icon: string;
    badge_color: string;
    earned_date: string;
  }>;
  recent_products: Array<{
    product_id: number;
    name: string;
    price_per_day: number;
    image_url: string;
    category: string;
  }>;
  activities: Array<{
    activity_id: number;
    activity_type: string;
    title: string;
    description: string;
    created_at: string;
  }>;
}

interface PublicUserProfileProps {
  userId: string;
  className?: string;
}

export default function PublicUserProfile({ userId, className }: PublicUserProfileProps) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    fetchProfile();
    if (user && !isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId, user]);

  const fetchProfile = async () => {
    try {
      const supabase = createClient();
      
      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user:users!user_profiles_user_id_fkey(name, email)
        `)
        .eq('user_id', userId)
        .single();

      if (profileError) throw profileError;

      // Fetch user badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          earned_date,
          badge_definitions!inner(badge_name, badge_description, badge_icon, badge_color)
        `)
        .eq('user_id', userId)
        .order('earned_date', { ascending: false });

      if (badgesError) throw badgesError;

      // Fetch recent products (if lender)
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          product_id,
          name,
          price_per_day,
          category,
          product_images!inner(image_url)
        `)
        .eq('lender_id', userId)
        .eq('available_status', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (productsError) throw productsError;

      // Fetch recent activities (if public)
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (activitiesError) throw activitiesError;

      const combinedProfile: UserProfile = {
        ...profileData,
        badges: badgesData?.map(b => ({
          badge_name: (b.badge_definitions as any).badge_name,
          badge_description: (b.badge_definitions as any).badge_description,
          badge_icon: (b.badge_definitions as any).badge_icon,
          badge_color: (b.badge_definitions as any).badge_color,
          earned_date: b.earned_date
        })) || [],
        recent_products: productsData?.map(p => ({
          product_id: p.product_id,
          name: p.name,
          price_per_day: p.price_per_day,
          category: p.category,
          image_url: p.product_images?.[0]?.image_url || ''
        })) || [],
        activities: activitiesData || []
      };

      setProfile(combinedProfile);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    if (!user) return;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('user_follows')
        .select('follow_id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollow = async () => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;
        setIsFollowing(false);
        
        // Update local follower count
        setProfile(prev => prev ? {
          ...prev,
          follower_count: Math.max(prev.follower_count - 1, 0)
        } : null);
      } else {
        // Follow
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: userId
          });

        if (error) throw error;
        setIsFollowing(true);
        
        // Update local follower count
        setProfile(prev => prev ? {
          ...prev,
          follower_count: prev.follower_count + 1
        } : null);

        // Create notification
        await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            notification_type: 'new_follower',
            title: 'New Follower',
            message: `${user.user_metadata?.name || 'Someone'} started following you`,
            related_user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
    }
  };

  const handleShare = async (platform: string) => {
    const profileUrl = `${window.location.origin}/profile/${userId}`;
    const text = `Check out ${profile?.display_name || profile?.user?.name}'s profile on TradeBridge`;
    
    try {
      const supabase = createClient();
      
      // Track the share
      await supabase
        .from('social_shares')
        .insert({
          user_id: user?.id,
          platform,
          share_url: profileUrl
        });

      // Handle different platforms
      switch (platform) {
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(profileUrl)}`);
          break;
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`);
          break;
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${profileUrl}`)}`);
          break;
        case 'copy_link':
          navigator.clipboard.writeText(profileUrl);
          break;
      }
      
      setShowShareDialog(false);
    } catch (error) {
      console.error('Error sharing profile:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'product_listed': return <Package className="h-4 w-4" />;
      case 'product_rented': return <TrendingUp className="h-4 w-4" />;
      case 'review_given':
      case 'review_received': return <Star className="h-4 w-4" />;
      case 'forum_post_created': return <MessageSquare className="h-4 w-4" />;
      case 'user_followed': return <Users className="h-4 w-4" />;
      case 'achievement_earned': return <Award className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
    return `${Math.floor(diffInDays / 365)} years ago`;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-t-lg"></div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <User className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <p className="text-gray-500">Profile not found or private</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Cover Image and Profile Header */}
      <Card className="overflow-hidden">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative">
          {profile.cover_image_url && (
            <img 
              src={profile.cover_image_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Profile Info */}
        <CardContent className="relative pt-0 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-16 md:-mt-12">
            <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4 md:mb-0">
              {/* Profile Picture */}
              <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                <AvatarImage src={profile.profile_image_url} />
                <AvatarFallback className="text-2xl">
                  {profile.display_name?.substring(0, 2) || profile.user.name.substring(0, 2)}
                </AvatarFallback>
              </Avatar>
              
              {/* Basic Info */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold">
                    {profile.display_name || profile.user.name}
                  </h1>
                  {profile.is_verified && (
                    <Badge className="bg-blue-100 text-blue-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(profile.created_at)}
                  </div>
                  {profile.website_url && (
                    <a 
                      href={profile.website_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-blue-600"
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              {!isOwnProfile && user && (
                <Button
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                  className="flex items-center gap-2"
                >
                  {isFollowing ? <UserCheck className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
              )}
              
              <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Share Profile</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" onClick={() => handleShare('twitter')}>Twitter</Button>
                    <Button variant="outline" onClick={() => handleShare('facebook')}>Facebook</Button>
                    <Button variant="outline" onClick={() => handleShare('linkedin')}>LinkedIn</Button>
                    <Button variant="outline" onClick={() => handleShare('whatsapp')}>WhatsApp</Button>
                    <Button variant="outline" onClick={() => handleShare('copy_link')} className="col-span-2">
                      Copy Link
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-700 mt-4 max-w-2xl">{profile.bio}</p>
          )}
          
          {/* Stats */}
          <div className="flex flex-wrap gap-6 mt-4">
            <div className="text-center">
              <div className="font-bold text-lg">{profile.follower_count}</div>
              <div className="text-sm text-gray-600">Followers</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{profile.following_count}</div>
              <div className="text-sm text-gray-600">Following</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{profile.total_rentals_as_lender}</div>
              <div className="text-sm text-gray-600">Items Lent</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-lg">{profile.total_rentals_as_borrower}</div>
              <div className="text-sm text-gray-600">Items Borrowed</div>
            </div>
          </div>
          
          {/* Badges */}
          {profile.badges.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Achievements</h3>
              <div className="flex flex-wrap gap-2">
                {profile.badges.slice(0, 6).map((badge, index) => (
                  <Badge 
                    key={index} 
                    variant="outline"
                    className="bg-yellow-50 text-yellow-800 border-yellow-200"
                  >
                    <Award className="h-3 w-3 mr-1" />
                    {badge.badge_name}
                  </Badge>
                ))}
                {profile.badges.length > 6 && (
                  <Badge variant="outline">+{profile.badges.length - 6} more</Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trust Score */}
            <TrustScoreDisplay userId={userId} showDetails />
            
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Activity</h3>
              </CardHeader>
              <CardContent>
                {profile.activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {profile.activities.slice(0, 5).map((activity) => (
                      <div key={activity.activity_id} className="flex gap-3">
                        <div className="p-2 bg-gray-100 rounded-full">
                          {getActivityIcon(activity.activity_type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <p className="text-xs text-gray-500">{formatTimeAgo(activity.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Available Products</h3>
            </CardHeader>
            <CardContent>
              {profile.recent_products.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products available</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {profile.recent_products.map((product) => (
                    <Card key={product.product_id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <div className="aspect-video bg-gray-200 rounded-t">
                        {product.image_url && (
                          <img 
                            src={product.image_url} 
                            alt={product.name}
                            className="w-full h-full object-cover rounded-t"
                          />
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h4 className="font-medium">{product.name}</h4>
                        <div className="flex justify-between items-center mt-2">
                          <Badge variant="outline">{product.category}</Badge>
                          <span className="font-bold">${product.price_per_day}/day</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          {profile.show_reviews ? (
            <ReviewSystem userId={userId} reviewType="user" />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Eye className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">Reviews are private</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Activity Timeline</h3>
            </CardHeader>
            <CardContent>
              {profile.activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No public activities</p>
              ) : (
                <div className="space-y-4">
                  {profile.activities.map((activity) => (
                    <div key={activity.activity_id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-white rounded-full">
                        {getActivityIcon(activity.activity_type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{formatDate(activity.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
