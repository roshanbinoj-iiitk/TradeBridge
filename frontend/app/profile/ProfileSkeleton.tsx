import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen max-w-3xl mt-16">
      <Skeleton className="h-10 w-40 mb-8" /> {/* My Profile title */}
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-2" /> {/* Title */}
          <Skeleton className="h-4 w-64" /> {/* Description */}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Average Rating */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-4 w-10" />
          </div>

          {/* Full Name Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Save Button */}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
      <Separator className="my-8" />
      {/* Account Settings */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-44 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Change Password */}
          <div>
            <Skeleton className="h-5 w-32 mb-2" />
            <Skeleton className="h-4 w-52 mb-3" />
            <Skeleton className="h-9 w-40" />
          </div>

          {/* Delete Account */}
          <div>
            <Skeleton className="h-5 w-36 mb-2" />
            <Skeleton className="h-4 w-60 mb-3" />
            <Skeleton className="h-9 w-44" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
