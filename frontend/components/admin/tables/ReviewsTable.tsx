import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Star, Trash2 } from "lucide-react";
import { ReviewAction } from "@/types/admin";

interface Review {
  review_id: number;
  rating: number;
  comment: string;
  is_featured?: boolean;
  created_at: string;
  reviewer?: {
    name: string;
  };
  reviewee?: {
    name: string;
  };
  product?: {
    name: string;
  };
}

interface ReviewsTableProps {
  reviews: Review[];
  onReviewAction: (reviewId: number, action: ReviewAction) => void;
}

export function ReviewsTable({ reviews, onReviewAction }: ReviewsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reviews.length === 0 && (
            <div className="p-4 border rounded-lg text-taupe">
              No reviews found.
            </div>
          )}

          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold">
                    {review.rating}/5
                  </span>
                  {review.is_featured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                </div>
                <p className="text-sm mb-2">{review.comment}</p>
                <p className="text-xs text-taupe">
                  {review.reviewer?.name} → {review.reviewee?.name}
                  {review.product && ` • ${review.product.name}`}•{" "}
                  {new Date(review.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReviewAction(review.review_id, "view")}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                {!review.is_featured && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onReviewAction(review.review_id, "feature")}
                  >
                    <Star className="w-4 h-4 mr-1" />
                    Feature
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onReviewAction(review.review_id, "delete")}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
