import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <div className="container mx-auto py-10 px-6 min-h-screen">
      <h1 className="text-4xl font-bold font-serif text-jet mb-8">Browse Products</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Filters */}
        <aside className="lg:col-span-1">
          <h2 className="text-2xl font-semibold text-jet mb-4">Filters</h2>
          <div className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-battleship-gray" />
              <Input placeholder="Search..." className="pl-10" />
            </div>
            {/* Placeholder for more filters */}
            <p className="text-taupe">Category filters, price sliders, and date pickers will go here.</p>
          </div>
        </aside>

        {/* Right Column: Product Grid */}
        <main className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Example Product Card */}
            <Link href="/products/1">
              <Card className="overflow-hidden group">
                <div className="overflow-hidden">
                  <Image 
                    src="https://images.pexels.com/photos/724921/pexels-photo-724921.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
                    alt="DJI Drone" 
                    width={400} 
                    height={250} 
                    className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg text-jet">DJI Mavic Air 2</h3>
                  <p className="text-taupe">$45 / day</p>
                  <p className="text-sm text-green-600 font-medium mt-1">Available</p>
                </CardContent>
              </Card>
            </Link>
            {/* Add more product cards here */}
          </div>
        </main>
      </div>
    </div>
  );
}
