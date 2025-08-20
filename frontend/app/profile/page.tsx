"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Star } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      // Fetch from your users table using uuid
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("uuid", user.id)
        .single();
      if (error) setError(error.message);
      else setProfile(data);
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const supabase = createClient();
    const { error } = await supabase
      .from("users")
      .update({ name: profile.name, email: profile.email })
      .eq("uuid", profile.uuid);
    setSaving(false);
    if (error) setError(error.message);
    else setSuccess("Profile updated!");
  };

  if (loading) return <div className="text-center mt-16">Loading...</div>;
  if (error)
    return <div className="text-center text-red-500 mt-16">{error}</div>;
  if (!profile) return null;

  return (
    <div className="container mx-auto py-10 px-6 min-h-screen max-w-3xl">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">
        My Profile
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Manage your personal and contact details.
          </CardDescription>
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
            <Input
              id="name"
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile.email || ""}
              onChange={(e) =>
                setProfile({ ...profile, email: e.target.value })
              }
            />
          </div>
          {error && <div className="text-red-500">{error}</div>}
          {success && <div className="text-green-600">{success}</div>}
          <Button
            className="bg-jet text-isabelline hover:bg-taupe"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>
      <Separator className="my-8" />
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your password and account status.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-jet">Change Password</h3>
            <p className="text-sm text-taupe mb-2">
              Set a new password for your account.
            </p>
            <Button variant="outline">Change Password</Button>
          </div>
          <div>
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-taupe mb-2">
              Permanently delete your account and all associated data.
            </p>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
