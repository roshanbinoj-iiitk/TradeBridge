import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import Image from "next/image";

export default function BorrowerPage() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">My Rentals</h1>
      
      <section>
        <h2 className="text-2xl font-semibold text-jet mb-4">Current Rentals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Card */}
          <Card className="overflow-hidden">
            <Image src="https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Canon Camera" width={400} height={250} className="w-full h-48 object-cover" />
            <CardHeader>
              <CardTitle>Canon EOS R5</CardTitle>
              <CardDescription>Rented from: Jane Smith</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-taupe">Start: July 20, 2025</p>
              <p className="text-sm text-taupe">End: July 27, 2025</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-jet text-isabelline hover:bg-taupe">Contact Lender</Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">Pending Requests</h2>
        {/* Placeholder for pending requests list */}
        <p className="text-taupe">You have no pending rental requests.</p>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold text-jet mb-4">Rental History</h2>
        {/* Placeholder for rental history table */}
        <p className="text-taupe">Your rental history is empty.</p>
      </section>
    </div>
  );
}
