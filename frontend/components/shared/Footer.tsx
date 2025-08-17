import React from 'react';
import Link from 'next/link';
import { Handshake } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-isabelline border-t border-platinum">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Column 1: Logo and Mission */}
          <div className="flex flex-col items-start">
            <Link href="/" className="flex items-center space-x-2 text-2xl font-bold text-jet font-serif">
              <Handshake className="h-7 w-7 text-jet" />
              <span>TradeBridge</span>
            </Link>
            <p className="mt-4 max-w-sm text-taupe">
              Connecting communities by making products accessible to everyone, reducing waste and fostering a culture of sharing.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-jet">Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/" className="text-battleship-gray hover:text-jet transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-battleship-gray hover:text-jet transition-colors">Browse Products</Link></li>
              <li><Link href="/contact" className="text-battleship-gray hover:text-jet transition-colors">Contact</Link></li>
              <li><Link href="/faq" className="text-battleship-gray hover:text-jet transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Column 3: Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-jet">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link href="/terms" className="text-battleship-gray hover:text-jet transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-battleship-gray hover:text-jet transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-platinum pt-8 text-center">
          <p className="text-sm text-battleship-gray">
            © {new Date().getFullYear()} TradeBridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
