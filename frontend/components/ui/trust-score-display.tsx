"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Shield, 
  Star, 
  Clock, 
  MessageSquare, 
  CheckCircle, 
  TrendingUp,
  Award,
  Users,
  Calendar,
  Info
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface TrustMetrics {
  overall_trust_score: number;
  verification_score: number;
  transaction_score: number;
  communication_score: number;
  reliability_score: number;
  total_transactions: number;
  successful_transactions: number;
  average_rating: number;
  response_time_hours: number;
  member_since: string;
  verified_email: boolean;
  verified_phone: boolean;
  verified_identity: boolean;
  badges: Array<{
    badge_type: string;
    badge_name: string;
    badge_description: string;
    earned_date: string;
  }>;
  recent_activity: Array<{
    activity_type: string;
    activity_date: string;
    description: string;
  }>;
}

interface TrustScoreDisplayProps {
  userId: string;
  compact?: boolean;
  showDetails?: boolean;
  className?: string;
}

export default function TrustScoreDisplay({ 
  userId, 
  compact = false, 
  showDetails = true,
  className 
}: TrustScoreDisplayProps) {
  const [trustMetrics, setTrustMetrics] = useState<TrustMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrustMetrics();
  }, [userId]);

  const fetchTrustMetrics = async () => {
    try {
      const supabase = createClient();
      
      // Fetch trust score data
      const { data: trustData, error: trustError } = await supabase
        .from('user_trust_scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (trustError && trustError.code !== 'PGRST116') {
        throw trustError;
      }

      // Fetch user badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select(`
          badge_type,
          earned_date,
          badge_definitions!inner(badge_name, badge_description)
        `)
        .eq('user_id', userId);

      if (badgesError) throw badgesError;

      // Fetch recent activity
      const { data: activityData, error: activityError } = await supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .order('activity_date', { ascending: false })
        .limit(5);

      if (activityError) throw activityError;

      // Get user basic info
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('created_at, email_verified, phone_verified, identity_verified')
        .eq('uuid', userId)
        .single();

      if (userError) throw userError;

      // Calculate average rating from reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('overall_rating')
        .eq('reviewee_id', userId);

      if (reviewsError) throw reviewsError;

      const averageRating = reviewsData && reviewsData.length > 0
        ? reviewsData.reduce((sum, r) => sum + r.overall_rating, 0) / reviewsData.length
        : 0;

      // Combine all data
      const combinedMetrics: TrustMetrics = {
        overall_trust_score: trustData?.overall_trust_score || 0,
        verification_score: trustData?.verification_score || 0,
        transaction_score: trustData?.transaction_score || 0,
        communication_score: trustData?.communication_score || 0,
        reliability_score: trustData?.reliability_score || 0,
        total_transactions: trustData?.total_transactions || 0,
        successful_transactions: trustData?.successful_transactions || 0,
        average_rating: averageRating,
        response_time_hours: trustData?.response_time_hours || 24,
        member_since: userData?.created_at || '',
        verified_email: userData?.email_verified || false,
        verified_phone: userData?.phone_verified || false,
        verified_identity: userData?.identity_verified || false,
        badges: badgesData?.map(b => ({
          badge_type: b.badge_type,
          badge_name: (b.badge_definitions as any)?.badge_name || b.badge_type,
          badge_description: (b.badge_definitions as any)?.badge_description || '',
          earned_date: b.earned_date
        })) || [],
        recent_activity: activityData || []
      };

      setTrustMetrics(combinedMetrics);
    } catch (error) {
      console.error('Error fetching trust metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrustLevel = (score: number) => {
    if (score >= 90) return { level: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
    if (score >= 80) return { level: 'Very Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
    if (score >= 70) return { level: 'Good', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
    if (score >= 60) return { level: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-700' };
    return { level: 'Needs Improvement', color: 'bg-red-500', textColor: 'text-red-700' };
  };

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!trustMetrics) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="text-center text-gray-500">
            <Shield className="mx-auto h-8 w-8 mb-2" />
            <p className="text-sm">Trust metrics unavailable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trustLevel = getTrustLevel(trustMetrics.overall_trust_score);
  const successRate = trustMetrics.total_transactions > 0 
    ? (trustMetrics.successful_transactions / trustMetrics.total_transactions) * 100 
    : 0;

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-1">
          <Shield className={`h-4 w-4 ${trustLevel.textColor}`} />
          <span className="font-semibold text-sm">{trustMetrics.overall_trust_score}%</span>
        </div>
        <Badge variant="outline" className={trustLevel.textColor}>
          {trustLevel.level}
        </Badge>
        {trustMetrics.average_rating > 0 && (
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-sm">{trustMetrics.average_rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${trustLevel.color.replace('bg-', 'bg-opacity-20 bg-')}`}>
                <Shield className={`h-5 w-5 ${trustLevel.textColor}`} />
              </div>
              <div>
                <h3 className="font-semibold">Trust Score</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{trustMetrics.overall_trust_score}%</span>
                  <Badge variant="outline" className={trustLevel.textColor}>
                    {trustLevel.level}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress 
              value={trustMetrics.overall_trust_score} 
              className="h-2" 
            />
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{trustMetrics.total_transactions}</div>
              <div className="text-sm text-gray-600">Total Rentals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{successRate.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>

          {showDetails && (
            <>
              {/* Detailed Scores */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Score Breakdown</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Verification</span>
                    </div>
                    <span className="text-sm font-medium">{trustMetrics.verification_score}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Transaction History</span>
                    </div>
                    <span className="text-sm font-medium">{trustMetrics.transaction_score}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Communication</span>
                    </div>
                    <span className="text-sm font-medium">{trustMetrics.communication_score}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">Reliability</span>
                    </div>
                    <span className="text-sm font-medium">{trustMetrics.reliability_score}%</span>
                  </div>
                </div>
              </div>

              {/* Verifications */}
              <div className="space-y-3">
                <h4 className="font-medium text-sm text-gray-700">Verifications</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge 
                    variant={trustMetrics.verified_email ? "default" : "outline"}
                    className={trustMetrics.verified_email ? "bg-green-100 text-green-800" : ""}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Email
                  </Badge>
                  <Badge 
                    variant={trustMetrics.verified_phone ? "default" : "outline"}
                    className={trustMetrics.verified_phone ? "bg-green-100 text-green-800" : ""}
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Phone
                  </Badge>
                  <Badge 
                    variant={trustMetrics.verified_identity ? "default" : "outline"}
                    className={trustMetrics.verified_identity ? "bg-green-100 text-green-800" : ""}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    ID Verified
                  </Badge>
                </div>
              </div>

              {/* Badges */}
              {trustMetrics.badges.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-gray-700">Achievements</h4>
                  <div className="flex flex-wrap gap-2">
                    {trustMetrics.badges.map((badge, index) => (
                      <TooltipProvider key={index}>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                              <Award className="h-3 w-3 mr-1" />
                              {badge.badge_name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{badge.badge_description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="space-y-2 text-sm text-gray-600 border-t pt-4">
                <div className="flex items-center justify-between">
                  <span>Member since</span>
                  <span>{formatMemberSince(trustMetrics.member_since)}</span>
                </div>
                {trustMetrics.average_rating > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Average rating</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span>{trustMetrics.average_rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Response time</span>
                  <span>~{trustMetrics.response_time_hours}h</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
