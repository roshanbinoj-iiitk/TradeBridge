import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen max-w-3xl">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">My Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your personal and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center">
            <span className="font-semibold mr-2">Average Rating:</span>
            <div className="flex items-center text-amber-500">
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 fill-current" />
              <Star className="h-5 w-5 text-gray-300 fill-current" />
              <span className="ml-2 text-taupe">(4.2)</span>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john.doe@example.com" />
          </div>
          <Button className="bg-jet text-isabelline hover:bg-taupe">Save Changes</Button>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your password and account status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-jet">Change Password</h3>
            <p className="text-sm text-taupe mb-2">Set a new password for your account.</p>
            <Button variant="outline">Change Password</Button>
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-taupe mb-2">Permanently delete your account and all associated data.</p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
