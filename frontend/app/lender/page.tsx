import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import Image from "next/image";

export default function LenderPage() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold font-serif text-jet">My Products</h1>
        <Button className="bg-jet text-isabelline hover:bg-taupe">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>
      
      <section>
        <h2 className="text-2xl font-semibold text-jet mb-4">Rental Requests (2)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Example Request Card */}
          <Card>
            <CardHeader>
              <CardTitle>Request for Power Drill</CardTitle>
              <CardDescription>From: Alex Johnson</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-taupe">Dates: Aug 1, 2025 - Aug 3, 2025</p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button className="w-full bg-green-600 hover:bg-green-700 text-white">Approve</Button>
              <Button variant="outline" className="w-full">Deny</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">My Listed Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Product Card */}
          <Card className="overflow-hidden">
            <Image src="https://images.pexels.com/photos/1249610/pexels-photo-1249610.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Power Drill" width={400} height={250} className="w-full h-48 object-cover" />
            <CardHeader>
              <CardTitle>Power Drill</CardTitle>
              <CardDescription>$15 / day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-green-600">Available</p>
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button variant="outline" className="w-full">Edit</Button>
              <Button variant="destructive" className="w-full">Delist</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
