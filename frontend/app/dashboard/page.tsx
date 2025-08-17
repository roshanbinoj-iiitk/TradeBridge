import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Bell } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full bg-jet text-isabelline hover:bg-taupe">
                <PlusCircle className="mr-2 h-4 w-4" /> List a New Product
              </Button>
              <Button variant="outline" className="w-full">
                Browse Products
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-taupe">
                <Bell className="mr-3 h-5 w-5" />
                <p>You have 2 new rental requests.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="borrowing">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="borrowing">My Borrowing</TabsTrigger>
              <TabsTrigger value="lending">My Lending</TabsTrigger>
            </TabsList>
            <TabsContent value="borrowing">
              <Card>
                <CardHeader>
                  <CardTitle>Borrowing Activity</CardTitle>
                  <CardDescription>Overview of your current and pending rentals.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold text-jet">Active Rentals (1)</h3>
                  <p className="text-taupe">You are currently renting a Canon EOS R5.</p>
                  <h3 className="font-semibold text-jet mt-4">Pending Requests (1)</h3>
                  <p className="text-taupe">Your request for a DJI Mavic Drone is pending approval.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="lending">
              <Card>
                <CardHeader>
                  <CardTitle>Lending Activity</CardTitle>
                  <CardDescription>Overview of your listed items and incoming requests.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <h3 className="font-semibold text-jet">Active Rentals (2)</h3>
                  <p className="text-taupe">Your Projector and Camping Tent are currently rented out.</p>
                  <h3 className="font-semibold text-jet mt-4">Pending Requests (2)</h3>
                  <p className="text-taupe">You have new requests for your Power Drill and Mountain Bike.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
