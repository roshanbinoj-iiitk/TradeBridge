"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Camera,
  Shield,
  Award,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/components/shared/AuthContext";

interface Review {
  review_id: number;
  overall_rating: number;
  product_condition_rating?: number;
  communication_rating?: number;
  timeliness_rating?: number;
  review_title?: string;
  review_text?: string;
  review_photos?: string[];
  review_type: "lender_to_borrower" | "borrower_to_lender";
  is_verified: boolean;
  is_featured: boolean;
  helpful_count: number;
  created_at: string;
  reviewer: {
    uuid: string;
    name: string;
    email: string;
  };
  responses?: Array<{
    response_id: number;
    response_text: string;
    created_at: string;
    responder: {
      name: string;
    };
  }>;
}

interface ReviewSystemProps {
  productId?: number;
  userId?: string;
  reviewType?: "product" | "user";
  className?: string;
}

export default function ReviewSystem({
  productId,
  userId,
  reviewType = "product",
  className,
}: ReviewSystemProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({
    overall_rating: 5,
    product_condition_rating: 5,
    communication_rating: 5,
    timeliness_rating: 5,
    review_title: "",
    review_text: "",
    review_photos: [] as string[],
  });

  useEffect(() => {
    fetchReviews();
  }, [productId, userId]);

  const fetchReviews = async () => {
    try {
      const supabase = createClient();
      let query = supabase
        .from("reviews")
        .select(
          `
          *,
          reviewer:users!reviews_reviewer_id_fkey(uuid, name, email),
          responses:review_responses(
            *,
            responder:users!review_responses_responder_id_fkey(name)
          )
        `
        )
        .order("created_at", { ascending: false });

      if (reviewType === "product" && productId) {
        query = query.eq("product_id", Number(productId));
      } else if (reviewType === "user" && userId) {
        query = query.eq("reviewee_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!user || !productId) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("reviews").insert({
        product_id: Number(productId),
        reviewer_id: user.id,
        reviewee_id: userId, // This would be the lender's ID
        ...newReview,
        review_type: "borrower_to_lender",
        is_verified: true, // You'd check if they actually completed a rental
      });

      if (error) throw error;

      setShowWriteReview(false);
      setNewReview({
        overall_rating: 5,
        product_condition_rating: 5,
        communication_rating: 5,
        timeliness_rating: 5,
        review_title: "",
        review_text: "",
        review_photos: [],
      });
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
    }
  };

  const handleHelpfulClick = async (reviewId: number) => {
    if (!user) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("review_helpfulness").upsert({
        review_id: reviewId,
        user_id: user.id,
        is_helpful: true,
      });

      if (error) throw error;
      fetchReviews();
    } catch (error) {
      console.error("Error marking review as helpful:", error);
    }
  };

  const StarRating = ({
    rating,
    editable = false,
    onChange,
    label,
  }: {
    rating: number;
    editable?: boolean;
    onChange?: (rating: number) => void;
    label?: string;
  }) => (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm font-medium min-w-[120px]">{label}:</span>
      )}
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } ${editable ? "cursor-pointer" : ""}`}
            onClick={() => editable && onChange?.(star)}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 ml-1">({rating}/5)</span>
    </div>
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.overall_rating, 0) /
        reviews.length
      : 0;

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              Reviews & Ratings
              <Badge variant="secondary">{reviews.length}</Badge>
            </CardTitle>
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= Math.round(averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-medium">{averageRating.toFixed(1)}</span>
                <span className="text-gray-600">
                  ({reviews.length} reviews)
                </span>
              </div>
            )}
          </div>

          {user && (
            <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
              <DialogTrigger asChild>
                <Button size="sm">Write Review</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Write a Review</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <StarRating
                      rating={newReview.overall_rating}
                      editable
                      onChange={(rating) =>
                        setNewReview((prev) => ({
                          ...prev,
                          overall_rating: rating,
                        }))
                      }
                      label="Overall Rating"
                    />
                    <StarRating
                      rating={newReview.product_condition_rating}
                      editable
                      onChange={(rating) =>
                        setNewReview((prev) => ({
                          ...prev,
                          product_condition_rating: rating,
                        }))
                      }
                      label="Product Condition"
                    />
                    <StarRating
                      rating={newReview.communication_rating}
                      editable
                      onChange={(rating) =>
                        setNewReview((prev) => ({
                          ...prev,
                          communication_rating: rating,
                        }))
                      }
                      label="Communication"
                    />
                    <StarRating
                      rating={newReview.timeliness_rating}
                      editable
                      onChange={(rating) =>
                        setNewReview((prev) => ({
                          ...prev,
                          timeliness_rating: rating,
                        }))
                      }
                      label="Timeliness"
                    />
                  </div>

                  <div>
                    <Label htmlFor="reviewTitle">Review Title</Label>
                    <Input
                      id="reviewTitle"
                      placeholder="Sum up your experience in a few words"
                      value={newReview.review_title}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          review_title: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="reviewText">Your Review</Label>
                    <Textarea
                      id="reviewText"
                      placeholder="Tell others about your experience..."
                      rows={4}
                      value={newReview.review_text}
                      onChange={(e) =>
                        setNewReview((prev) => ({
                          ...prev,
                          review_text: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowWriteReview(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitReview} className="flex-1">
                      Submit Review
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Star className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to leave a review!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div
                key={review.review_id}
                className="border-b pb-6 last:border-b-0"
              >
                <div className="flex gap-4">
                  <Avatar>
                    <AvatarFallback>
                      {review.reviewer.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">
                            {review.reviewer.name}
                          </h4>
                          {review.is_verified && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              <Shield className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          {review.is_featured && (
                            <Badge className="bg-purple-600">
                              <Award className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3 w-3 ${
                                  star <= review.overall_rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            {formatDate(review.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {review.review_title && (
                      <h5 className="font-medium mb-2">
                        {review.review_title}
                      </h5>
                    )}

                    {review.review_text && (
                      <p className="text-gray-700 mb-4">{review.review_text}</p>
                    )}

                    {/* Detailed Ratings */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <StarRating
                        rating={review.product_condition_rating || 0}
                        label="Condition"
                      />
                      <StarRating
                        rating={review.communication_rating || 0}
                        label="Communication"
                      />
                      <StarRating
                        rating={review.timeliness_rating || 0}
                        label="Timeliness"
                      />
                    </div>

                    {/* Review Photos */}
                    {review.review_photos &&
                      review.review_photos.length > 0 && (
                        <div className="flex gap-2 mb-4">
                          {review.review_photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Review photo ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}

                    <div className="flex gap-4 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpfulClick(review.review_id)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Helpful ({review.helpful_count})
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        Reply
                      </Button>
                    </div>

                    {/* Review Responses */}
                    {review.responses && review.responses.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        {review.responses.map((response) => (
                          <div
                            key={response.response_id}
                            className="mb-2 last:mb-0"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {response.responder.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(response.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700">
                              {response.response_text}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
