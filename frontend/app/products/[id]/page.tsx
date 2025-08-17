import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import Image from "next/image";
import Link from "next/link";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Image Gallery */}
        <div>
          <Image 
            src="https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
            alt="DJI Drone" 
            width={800} 
            height={600} 
            className="w-full rounded-lg shadow-lg object-cover aspect-video"
          />
          {/* Placeholder for thumbnails */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            <div className="border-2 border-jet rounded-md p-1">
              <Image src="https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" alt="Thumbnail 1" width={150} height={100} className="rounded-sm object-cover" />
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Rental Box */}
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold font-serif text-jet">DJI Mavic Air 2</h1>
          <div className="mt-4">
            <Link href="/profile/lender" className="text-battleship-gray hover:text-jet">
              Lender: DroneMaster123 (4.8 ★)
            </Link>
          </div>
          <p className="mt-6 text-taupe leading-relaxed">
            Capture stunning 4K video and breathtaking photos with the DJI Mavic Air 2. This drone is perfect for both beginners and experienced pilots, offering a blend of power, portability, and advanced features.
          </p>
          
          <div className="mt-6 space-y-2 text-sm">
            <p><span className="font-semibold text-jet">Category:</span> Electronics</p>
            <p><span className="font-semibold text-jet">Condition:</span> Like New</p>
            <p><span className="font-semibold text-jet">Value:</span> $800</p>
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-3xl">$45 / day</CardTitle>
              <CardDescription>Select your rental dates.</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="range"
                className="rounded-md border"
              />
              <div className="mt-6">
                <p className="text-lg font-semibold text-jet">Total Price: $135</p>
                <p className="text-sm text-taupe">(for 3 days)</p>
              </div>
              <Button size="lg" className="w-full mt-4 h-12 text-base bg-jet text-isabelline hover:bg-taupe">
                Request to Rent
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
