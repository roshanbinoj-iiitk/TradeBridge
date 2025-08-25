"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Star,
  Package,
  Settings,
  Trash2,
  Eye,
  Filter
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';

interface Notification {
  notification_id: number;
  user_id: string;
  notification_type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment_received' | 'payment_due' | 'message_received' | 'review_received' | 'product_returned' | 'system_update';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  related_user?: {
    name: string;
    email: string;
  };
}

interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  booking_requests: boolean;
  booking_confirmations: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  review_notifications: boolean;
  marketing_notifications: boolean;
}

interface NotificationSystemProps {
  userId?: string;
  compact?: boolean;
  className?: string;
}

export default function NotificationSystem({ 
  userId, 
  compact = false,
  className 
}: NotificationSystemProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    booking_requests: true,
    booking_confirmations: true,
    payment_notifications: true,
    message_notifications: true,
    review_notifications: true,
    marketing_notifications: false
  });
  const [showSettings, setShowSettings] = useState(false);

  const currentUserId = userId || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchNotifications();
      fetchSettings();
    }
  }, [currentUserId, filter]);

  const fetchNotifications = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();
      let query = supabase
        .from('notifications')
        .select(`
          *,
          related_user:users!notifications_related_user_id_fkey(name, email)
        `)
        .eq('user_id', currentUserId)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        if (filter === 'unread') {
          query = query.eq('is_read', false);
        } else {
          query = query.eq('notification_type', filter);
        }
      }

      const { data, error } = await query.limit(50);
      if (error) throw error;

      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    if (!currentUserId) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', currentUserId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setSettings(data);
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('notification_id', notificationId);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const supabase = createClient();
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.notification_id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('notification_id', unreadIds);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: number) => {
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('notification_id', notificationId);

      if (error) throw error;
      
      setNotifications(prev =>
        prev.filter(n => n.notification_id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const updateSettings = async (newSettings: Partial<NotificationSettings>) => {
    try {
      const supabase = createClient();
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: currentUserId,
          ...updatedSettings
        });

      if (error) throw error;
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_request':
      case 'booking_confirmed':
      case 'booking_cancelled':
        return <Calendar className="h-4 w-4" />;
      case 'payment_received':
      case 'payment_due':
        return <DollarSign className="h-4 w-4" />;
      case 'message_received':
        return <MessageSquare className="h-4 w-4" />;
      case 'review_received':
        return <Star className="h-4 w-4" />;
      case 'product_returned':
        return <Package className="h-4 w-4" />;
      case 'system_update':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking_confirmed':
      case 'payment_received':
        return 'text-green-600 bg-green-100';
      case 'booking_request':
      case 'message_received':
        return 'text-blue-600 bg-blue-100';
      case 'booking_cancelled':
      case 'payment_due':
        return 'text-red-600 bg-red-100';
      case 'review_received':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (compact) {
    return (
      <div className={`relative ${className}`}>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
            
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Notification Settings</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Delivery Methods</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications">Email Notifications</Label>
                        <Switch
                          id="email-notifications"
                          checked={settings.email_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ email_notifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications">Push Notifications</Label>
                        <Switch
                          id="push-notifications"
                          checked={settings.push_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ push_notifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Notification Types</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="booking-requests">Booking Requests</Label>
                        <Switch
                          id="booking-requests"
                          checked={settings.booking_requests}
                          onCheckedChange={(checked) => 
                            updateSettings({ booking_requests: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="payment-notifications">Payment Notifications</Label>
                        <Switch
                          id="payment-notifications"
                          checked={settings.payment_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ payment_notifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="message-notifications">Messages</Label>
                        <Switch
                          id="message-notifications"
                          checked={settings.message_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ message_notifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="review-notifications">Reviews</Label>
                        <Switch
                          id="review-notifications"
                          checked={settings.review_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ review_notifications: checked })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="marketing-notifications">Marketing & Updates</Label>
                        <Switch
                          id="marketing-notifications"
                          checked={settings.marketing_notifications}
                          onCheckedChange={(checked) => 
                            updateSettings({ marketing_notifications: checked })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={filter} onValueChange={setFilter} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="booking_request">Bookings</TabsTrigger>
            <TabsTrigger value="message_received">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>No notifications found</p>
                <p className="text-sm">
                  {filter === 'unread' 
                    ? "You're all caught up!" 
                    : "Check back later for updates"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((notification) => (
                  <div
                    key={notification.notification_id}
                    className={`flex gap-3 p-3 rounded-lg border transition-colors ${
                      !notification.is_read 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.notification_type)}`}>
                      {getNotificationIcon(notification.notification_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${!notification.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          {notification.related_user && (
                            <div className="flex items-center gap-2 mt-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {notification.related_user.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs text-gray-500">
                                {notification.related_user.name}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.notification_id)}
                                className="h-8 w-8 p-0"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.notification_id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
