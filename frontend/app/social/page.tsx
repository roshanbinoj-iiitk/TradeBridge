import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  MessageCircle,
  Share2,
  UserPlus,
  TrendingUp,
  Star,
  Award,
  Package,
} from "lucide-react";

import PublicUserProfile from "@/components/ui/public-user-profile";
import FollowSystem from "@/components/ui/follow-system";
import CommunityForum from "@/components/ui/community-forum";
import SocialSharing from "@/components/ui/social-sharing";

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 mt-16">
          <h1 className="text-4xl font-bold text-gray-900">
            TradeBridge Community
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with trusted lenders, share experiences, and build lasting
            relationships in our rental community
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">10K+</div>
              <div className="text-sm text-gray-600">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">50K+</div>
              <div className="text-sm text-gray-600">Successful Rentals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">2K+</div>
              <div className="text-sm text-gray-600">Forum Discussions</div>
            </div>
          </div>
        </div>

        {/* Social Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">User Profiles</h3>
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive profiles showing rental history, trust scores, and
                achievements
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">
                  Rental History
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Trust Scores
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Badges
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Follow System</h3>
              <p className="text-sm text-gray-600 mb-4">
                Follow trusted lenders, discover new products, and build your
                network
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">
                  Follow Users
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Suggestions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Activity Feed
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Community Forum</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ask questions, share tips, and connect with the community
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">
                  Q&A
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Discussions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Tips & Reviews
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Social Sharing</h3>
              <p className="text-sm text-gray-600 mb-4">
                Share products, profiles, and forum posts across social media
              </p>
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="outline" className="text-xs">
                  Multi-Platform
                </Badge>
                <Badge variant="outline" className="text-xs">
                  QR Codes
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Analytics
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="community" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="community" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Community
            </TabsTrigger>
            <TabsTrigger value="connect" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connect
            </TabsTrigger>
            <TabsTrigger value="profiles" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Profiles
            </TabsTrigger>
            <TabsTrigger value="sharing" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Sharing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="community" className="mt-6">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <CommunityForum />
            </Suspense>
          </TabsContent>

          <TabsContent value="connect" className="mt-6">
            <Suspense
              fallback={
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="animate-pulse space-y-4">
                      <div className="h-8 bg-gray-200 rounded w-1/4 mx-auto"></div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              }
            >
              <FollowSystem />
            </Suspense>
          </TabsContent>

          <TabsContent value="profiles" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Featured Profiles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Demo profile cards */}
                    {[
                      {
                        name: "Sarah Johnson",
                        type: "Super Lender",
                        rating: 4.9,
                        rentals: 127,
                      },
                      {
                        name: "Mike Chen",
                        type: "Trusted Member",
                        rating: 4.8,
                        rentals: 89,
                      },
                      {
                        name: "Emma Wilson",
                        type: "Community Helper",
                        rating: 4.9,
                        rentals: 156,
                      },
                    ].map((profile, index) => (
                      <Card
                        key={index}
                        className="text-center hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <CardContent className="p-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-xl">
                            {profile.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <h4 className="font-semibold">{profile.name}</h4>
                          <Badge variant="outline" className="mb-2">
                            {profile.type}
                          </Badge>
                          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {profile.rating}
                            </div>
                            <span>{profile.rentals} rentals</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profile Features Demo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">
                    Experience our comprehensive user profiles with trust
                    scores, rental history, and social features.
                  </div>

                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                      <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Trust & Verification</h5>
                        <p className="text-sm text-gray-600">
                          Multi-dimensional trust scores, verification badges,
                          and achievement system
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h5 className="font-medium">Activity Timeline</h5>
                        <p className="text-sm text-gray-600">
                          Track user activities, rental history, and community
                          engagement
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sharing" className="mt-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share2 className="h-5 w-5" />
                    Social Sharing Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Demo sharing components */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-500 rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Professional Camera Kit
                            </h4>
                            <p className="text-sm text-gray-600">
                              High-quality DSLR camera with lenses - $45/day
                            </p>
                          </div>
                        </div>
                        <SocialSharing
                          shareType="product"
                          productId={1}
                          title="Professional Camera Kit"
                          description="High-quality DSLR camera with lenses available for rent"
                          imageUrl="/placeholder-camera.jpg"
                          variant="button"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-500 rounded flex items-center justify-center">
                            <MessageCircle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Tips for First-Time Renters
                            </h4>
                            <p className="text-sm text-gray-600">
                              Community forum post with helpful advice
                            </p>
                          </div>
                        </div>
                        <SocialSharing
                          shareType="post"
                          postId={1}
                          title="Tips for First-Time Renters"
                          description="Essential advice for anyone new to renting items"
                          variant="button"
                        />
                      </div>

                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            SJ
                          </div>
                          <div>
                            <h4 className="font-medium">
                              Sarah Johnson&apos;s Profile
                            </h4>
                            <p className="text-sm text-gray-600">
                              Trusted lender with 4.9★ rating and 127 successful
                              rentals
                            </p>
                          </div>
                        </div>
                        <SocialSharing
                          shareType="profile"
                          profileId="user-123"
                          title="Sarah Johnson - Trusted Lender"
                          description="Connect with Sarah, a super lender with excellent ratings"
                          variant="button"
                        />
                      </div>
                    </div>

                    {/* Sharing analytics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t">
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-blue-600">
                            2.4K
                          </div>
                          <div className="text-sm text-gray-600">
                            Total Shares
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-green-600">
                            18%
                          </div>
                          <div className="text-sm text-gray-600">
                            Click-through Rate
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="text-center">
                        <CardContent className="p-4">
                          <div className="text-2xl font-bold text-purple-600">
                            156
                          </div>
                          <div className="text-sm text-gray-600">New Users</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
