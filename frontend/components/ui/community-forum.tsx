"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageCircle, 
  Plus, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  Pin,
  Lock,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  ShoppingBag,
  MapPin,
  Star,
  TrendingUp,
  Clock,
  User,
  Flag,
  MoreHorizontal
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';

interface ForumCategory {
  category_id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
  post_count?: number;
  latest_post?: {
    title: string;
    author_name: string;
    created_at: string;
  };
}

interface ForumPost {
  post_id: number;
  category_id: number;
  title: string;
  content: string;
  post_type: 'discussion' | 'question' | 'announcement' | 'review';
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  last_activity: string;
  author: {
    uuid: string;
    name: string;
    profile_image_url?: string;
  };
  category: {
    name: string;
    color: string;
  };
  is_liked?: boolean;
}

interface ForumReply {
  reply_id: number;
  content: string;
  like_count: number;
  is_best_answer: boolean;
  created_at: string;
  author: {
    uuid: string;
    name: string;
    profile_image_url?: string;
  };
}

interface CommunityForumProps {
  className?: string;
}

export default function CommunityForum({ className }: CommunityForumProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [postType, setPostType] = useState<string>('all');

  const [newPost, setNewPost] = useState({
    category_id: 0,
    title: '',
    content: '',
    post_type: 'discussion' as const,
    tags: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [selectedCategory, searchQuery, sortBy, postType]);

  const fetchCategories = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;

      // Get post counts for each category
      const categoriesWithCounts = await Promise.all(
        (data || []).map(async (category) => {
          const { count } = await supabase
            .from('forum_posts')
            .select('post_id', { count: 'exact' })
            .eq('category_id', category.category_id)
            .eq('is_approved', true);

          const { data: latestPost } = await supabase
            .from('forum_posts')
            .select(`
              title,
              created_at,
              author:users!forum_posts_author_id_fkey(name)
            `)
            .eq('category_id', category.category_id)
            .eq('is_approved', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...category,
            post_count: count || 0,
            latest_post: latestPost ? {
              title: latestPost.title,
              author_name: (latestPost.author as any)?.name || '',
              created_at: latestPost.created_at
            } : null
          };
        })
      );

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from('forum_posts')
        .select(`
          *,
          author:users!forum_posts_author_id_fkey(uuid, name),
          category:forum_categories!forum_posts_category_id_fkey(name, color)
        `)
        .eq('is_approved', true);

      if (selectedCategory) {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      if (postType !== 'all') {
        query = query.eq('post_type', postType);
      }

      // Apply sorting
      switch (sortBy) {
        case 'latest':
          query = query.order('last_activity', { ascending: false });
          break;
        case 'popular':
          query = query.order('like_count', { ascending: false });
          break;
        case 'most_replies':
          query = query.order('reply_count', { ascending: false });
          break;
        case 'oldest':
          query = query.order('created_at', { ascending: true });
          break;
      }

      // Pinned posts first
      query = query.order('is_pinned', { ascending: false });

      const { data, error } = await query.limit(50);
      if (error) throw error;

      // Check which posts the user has liked
      let postsWithLikes = data || [];
      if (user) {
        const postIds = postsWithLikes.map(p => p.post_id);
        const { data: likes } = await supabase
          .from('forum_likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds);

        const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
        postsWithLikes = postsWithLikes.map(post => ({
          ...post,
          is_liked: likedPostIds.has(post.post_id)
        }));
      }

      setPosts(postsWithLikes);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || !newPost.title.trim() || !newPost.content.trim()) return;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('forum_posts')
        .insert({
          ...newPost,
          author_id: user.id,
          tags: newPost.tags.filter(tag => tag.trim())
        });

      if (error) throw error;

      setShowCreatePost(false);
      setNewPost({
        category_id: 0,
        title: '',
        content: '',
        post_type: 'discussion',
        tags: []
      });
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: number, isLiked: boolean) => {
    if (!user) return;

    try {
      const supabase = createClient();
      
      if (isLiked) {
        await supabase
          .from('forum_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
      } else {
        await supabase
          .from('forum_likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });
      }

      // Update local state
      setPosts(prev =>
        prev.map(post =>
          post.post_id === postId
            ? {
                ...post,
                is_liked: !isLiked,
                like_count: isLiked ? post.like_count - 1 : post.like_count + 1
              }
            : post
        )
      );
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'announcement': return <Pin className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getCategoryIcon = (icon: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      MessageCircle: <MessageCircle className="h-5 w-5" />,
      HelpCircle: <HelpCircle className="h-5 w-5" />,
      Star: <Star className="h-5 w-5" />,
      Lightbulb: <Lightbulb className="h-5 w-5" />,
      ShoppingBag: <ShoppingBag className="h-5 w-5" />,
      MapPin: <MapPin className="h-5 w-5" />
    };
    return iconMap[icon] || <MessageCircle className="h-5 w-5" />;
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Community Forum</h1>
          <p className="text-gray-600">Connect, share, and learn from the TradeBridge community</p>
        </div>
        
        {user && (
          <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select 
                      value={newPost.category_id.toString()} 
                      onValueChange={(value) => setNewPost(prev => ({ ...prev, category_id: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.category_id} value={category.category_id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Post Type</Label>
                    <Select 
                      value={newPost.post_type} 
                      onValueChange={(value: any) => setNewPost(prev => ({ ...prev, post_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discussion">Discussion</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label>Title</Label>
                  <Input 
                    placeholder="What's your post about?"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Content</Label>
                  <Textarea 
                    placeholder="Share your thoughts, ask questions, or provide help..."
                    rows={6}
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label>Tags (optional)</Label>
                  <Input 
                    placeholder="Enter tags separated by commas"
                    onChange={(e) => setNewPost(prev => ({ 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()) 
                    }))}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowCreatePost(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePost} className="flex-1">
                    Create Post
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="categories">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="posts">All Posts</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Card 
                key={category.category_id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedCategory(category.category_id);
                  // Switch to posts tab
                  document.querySelector('[value="posts"]')?.dispatchEvent(new MouseEvent('click'));
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full bg-${category.color}-100`}>
                      {getCategoryIcon(category.icon)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                      <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                        <span>{category.post_count} posts</span>
                        {category.latest_post && (
                          <span>Latest: {formatTimeAgo(category.latest_post.created_at)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          {/* Filters and Search */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={postType} onValueChange={setPostType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Post type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="discussion">Discussion</SelectItem>
                <SelectItem value="question">Questions</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="review">Reviews</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest</SelectItem>
                <SelectItem value="popular">Most Liked</SelectItem>
                <SelectItem value="most_replies">Most Replies</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
              </SelectContent>
            </Select>
            
            {selectedCategory && (
              <Button 
                variant="outline" 
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                Clear Filter
              </Button>
            )}
          </div>

          {/* Posts List */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500">No posts found</p>
              <p className="text-sm text-gray-400">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.post_id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar>
                        <AvatarImage src={post.author.profile_image_url} />
                        <AvatarFallback>
                          {post.author.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {post.is_pinned && <Pin className="h-4 w-4 text-green-600" />}
                          {post.is_locked && <Lock className="h-4 w-4 text-red-600" />}
                          {post.is_solved && <CheckCircle className="h-4 w-4 text-green-600" />}
                          
                          <Badge variant="outline" className={`bg-${post.category.color}-50`}>
                            {getPostTypeIcon(post.post_type)}
                            <span className="ml-1">{post.post_type}</span>
                          </Badge>
                          
                          <Badge variant="secondary">{post.category.name}</Badge>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-2 cursor-pointer hover:text-blue-600">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {post.content.substring(0, 200)}...
                        </p>
                        
                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{post.author.name}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(post.created_at)}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.view_count}
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {post.reply_count}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePost(post.post_id, post.is_liked || false)}
                              className={`flex items-center gap-1 ${
                                post.is_liked ? 'text-red-600' : 'text-gray-500'
                              }`}
                            >
                              <ThumbsUp className="h-3 w-3" />
                              {post.like_count}
                            </Button>
                            
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trending This Week</h3>
            {/* Show most liked and most replied posts from this week */}
            <div className="space-y-4">
              {posts
                .filter(post => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return new Date(post.created_at) >= weekAgo;
                })
                .sort((a, b) => (b.like_count + b.reply_count * 2) - (a.like_count + a.reply_count * 2))
                .slice(0, 10)
                .map((post) => (
                  <Card key={post.post_id} className="p-4">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5 text-orange-500" />
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <span>{post.author.name}</span>
                          <span>•</span>
                          <span>{post.like_count} likes</span>
                          <span>•</span>
                          <span>{post.reply_count} replies</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
