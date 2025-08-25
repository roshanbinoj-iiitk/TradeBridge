"use client";

import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CalendarDays, Clock, MapPin, Shield } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useAuth } from '@/components/shared/AuthContext';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    'en-US': enUS,
  },
});

interface BookingEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: {
    status: string;
    borrower?: string;
    amount?: number;
  };
}

interface BookingCalendarProps {
  productId: number;
  productName: string;
  dailyPrice: number;
  lenderId: string;
  className?: string;
}

export default function BookingCalendar({ 
  productId, 
  productName, 
  dailyPrice, 
  lenderId, 
  className 
}: BookingCalendarProps) {
  const { user } = useAuth();
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    pickupInstructions: '',
    returnInstructions: '',
  });

  useEffect(() => {
    fetchBookings();
  }, [productId]);

  const fetchBookings = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          borrower:users!bookings_borrower_id_fkey(name)
        `)
        .eq('product_id', productId)
        .in('status', ['confirmed', 'paid', 'active']);

      if (error) throw error;

      const bookingEvents: BookingEvent[] = data?.map((booking: any) => ({
        id: booking.booking_id,
        title: `Booked by ${booking.borrower?.name || 'Unknown'}`,
        start: new Date(booking.start_date),
        end: new Date(booking.end_date),
        resource: {
          status: booking.status,
          borrower: booking.borrower?.name,
          amount: booking.total_amount,
        }
      })) || [];

      setEvents(bookingEvents);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (!user || user.id === lenderId) return; // Can't book own product

    // Check if slot conflicts with existing bookings
    const hasConflict = events.some(event => 
      (start >= event.start && start < event.end) ||
      (end > event.start && end <= event.end) ||
      (start <= event.start && end >= event.end)
    );

    if (hasConflict) {
      alert('This time slot is already booked!');
      return;
    }

    setSelectedSlot({ start, end });
    setBookingDetails({
      startDate: format(start, 'yyyy-MM-dd'),
      endDate: format(end, 'yyyy-MM-dd'),
      pickupLocation: '',
      pickupInstructions: '',
      returnInstructions: '',
    });
  };

  const calculateTotal = () => {
    if (!bookingDetails.startDate || !bookingDetails.endDate) return 0;
    
    const start = new Date(bookingDetails.startDate);
    const end = new Date(bookingDetails.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(1, days) * dailyPrice;
  };

  const handleBooking = async () => {
    if (!user || !selectedSlot) return;

    setLoading(true);
    try {
      const supabase = createClient();
      const totalAmount = calculateTotal();
      
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          product_id: productId,
          borrower_id: user.id,
          lender_id: lenderId,
          start_date: bookingDetails.startDate,
          end_date: bookingDetails.endDate,
          total_amount: totalAmount,
          security_deposit: Math.min(totalAmount * 0.2, 1000), // 20% or max ₹1000
          pickup_location: bookingDetails.pickupLocation,
          pickup_instructions: bookingDetails.pickupInstructions,
          return_instructions: bookingDetails.returnInstructions,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      alert('Booking request sent successfully! The lender will confirm your request.');
      setSelectedSlot(null);
      fetchBookings(); // Refresh calendar
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const eventStyleGetter = (event: BookingEvent) => {
    let backgroundColor = '#3174ad';
    
    switch (event.resource.status) {
      case 'confirmed':
        backgroundColor = '#10b981'; // Green
        break;
      case 'paid':
        backgroundColor = '#3b82f6'; // Blue
        break;
      case 'active':
        backgroundColor = '#f59e0b'; // Orange
        break;
      default:
        backgroundColor = '#6b7280'; // Gray
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  const totalAmount = calculateTotal();
  const securityDeposit = Math.min(totalAmount * 0.2, 1000);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Booking Calendar
        </CardTitle>
        <p className="text-sm text-gray-600">
          Select dates to book this item. Green = Confirmed bookings.
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ height: '500px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectSlot={handleSelectSlot}
            selectable={user && user.id !== lenderId}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
            popup
            tooltipAccessor={(event) => 
              `${event.title} - ₹${event.resource.amount} (${event.resource.status})`
            }
          />
        </div>

        {/* Booking Dialog */}
        <Dialog open={!!selectedSlot} onOpenChange={() => setSelectedSlot(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Book {productName}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={bookingDetails.startDate}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={bookingDetails.endDate}
                    onChange={(e) => setBookingDetails(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pickupLocation">Pickup Location</Label>
                <Input
                  id="pickupLocation"
                  placeholder="Where will you pick up the item?"
                  value={bookingDetails.pickupLocation}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, pickupLocation: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="pickupInstructions">Pickup Instructions</Label>
                <Textarea
                  id="pickupInstructions"
                  placeholder="Any special instructions for pickup..."
                  value={bookingDetails.pickupInstructions}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, pickupInstructions: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="returnInstructions">Return Instructions</Label>
                <Textarea
                  id="returnInstructions"
                  placeholder="Any special instructions for return..."
                  value={bookingDetails.returnInstructions}
                  onChange={(e) => setBookingDetails(prev => ({ ...prev, returnInstructions: e.target.value }))}
                />
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>Daily Rate:</span>
                  <span>₹{dailyPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{Math.max(1, Math.ceil((new Date(bookingDetails.endDate).getTime() - new Date(bookingDetails.startDate).getTime()) / (1000 * 60 * 60 * 24)))} days</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Security Deposit:
                  </span>
                  <span>₹{securityDeposit}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>₹{totalAmount + securityDeposit}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setSelectedSlot(null)} className="flex-1">
                  Cancel
                </Button>
                <Button 
                  onClick={handleBooking} 
                  disabled={loading || !bookingDetails.pickupLocation}
                  className="flex-1"
                >
                  {loading ? 'Booking...' : 'Send Booking Request'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
