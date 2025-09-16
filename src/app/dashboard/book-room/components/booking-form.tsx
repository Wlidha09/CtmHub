
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { addBooking, updateBooking } from "../actions";
import type { Booking, Employee } from "@/lib/types";
import { getDepartment } from "@/lib/firebase/departments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, setHours, setMinutes, setSeconds, setMilliseconds, parseISO } from "date-fns";

const generateTimeSlots = () => {
    const slots = [];
    for (let i = 8; i < 18; i++) { // 8 AM to 5 PM
        slots.push(`${i.toString().padStart(2, '0')}:00`);
        slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
};

const timeSlots = generateTimeSlots();

interface BookingFormProps {
  roomId?: string;
  date?: Date;
  currentUser: Employee | null;
  bookings: Booking[];
  onBookingAction: () => void;
  editingBooking: Booking | null;
  setEditingBooking: (booking: Booking | null) => void;
}

export function BookingForm({ roomId, date, currentUser, bookings, onBookingAction, editingBooking, setEditingBooking }: BookingFormProps) {
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    if (editingBooking) {
      setTitle(editingBooking.title);
      setStartTime(format(parseISO(editingBooking.startTime), 'HH:mm'));
    } else {
      setTitle("");
      setStartTime(undefined);
    }
  }, [editingBooking]);

  const getEndTime = (start: string) => {
      if (!start) return "";
      const [hour, minute] = start.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hour, minute);
      startDate.setMinutes(startDate.getMinutes() + 30); // Default to 30 min slots
      return format(startDate, 'HH:mm');
  }
  
  const getFilteredTimeSlots = () => {
    if (!date) return timeSlots;
    const allBookingsForDay = bookings.filter(b => b.roomId === roomId && format(parseISO(b.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd'));
  
    // If editing, the current booking's slot should be available
    const bookingsToExclude = editingBooking 
        ? allBookingsForDay.filter(b => b.id !== editingBooking.id)
        : allBookingsForDay;

    if (!bookingsToExclude.length) return timeSlots;
    
    return timeSlots.filter(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotTime = setMilliseconds(setSeconds(setMinutes(setHours(date, hour), minute), 0), 0).getTime();
      
      for (const booking of bookingsToExclude) {
        const bookingStart = parseISO(booking.startTime).getTime();
        const bookingEnd = parseISO(booking.endTime).getTime();
        if (slotTime >= bookingStart && slotTime < bookingEnd) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredSlots = getFilteredTimeSlots();

  const handleCancelEdit = () => {
    setEditingBooking(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !date || !currentUser) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a room and date.",
      });
      return;
    }

    const finalStartTime = startTime || filteredSlots[0];
     if (!finalStartTime) {
      toast({
        variant: "destructive",
        title: "No time selected",
        description: "Please select a time slot.",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const [startHour, startMinute] = finalStartTime.split(':').map(Number);
    const bookingStart = setMinutes(setHours(date, startHour), startMinute);
    const bookingEnd = new Date(bookingStart.getTime() + 30 * 60 * 1000); // 30 minute duration

    let result;

    if (editingBooking) {
        result = await updateBooking(editingBooking.id, {
            title: title || "Booked",
            startTime: bookingStart.toISOString(),
            endTime: bookingEnd.toISOString(),
        });
    } else {
        const department = await getDepartment(currentUser.departmentId);
        result = await addBooking({
            roomId,
            userId: currentUser.id,
            employeeName: currentUser.name,
            departmentName: department?.name || "Unknown",
            title: title || "Booked",
            date: format(date, "yyyy-MM-dd"),
            startTime: bookingStart.toISOString(),
            endTime: bookingEnd.toISOString(),
        });
    }

    if (result.success) {
      toast({ title: "Success", description: result.message });
      onBookingAction();
      setEditingBooking(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingBooking ? 'Edit Booking' : 'Book a Slot'}</CardTitle>
        <CardDescription>All meetings are 30 minutes long.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select onValueChange={setStartTime} value={startTime}>
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {filteredSlots.length > 0 ? filteredSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>{slot} - {getEndTime(slot)}</SelectItem>
                )) : <p className="p-4 text-sm text-muted-foreground">No available slots</p>}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {editingBooking && <Button type="button" variant="outline" className="w-full" onClick={handleCancelEdit}>Cancel</Button>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (editingBooking ? "Saving..." : "Booking...") : (editingBooking ? 'Save Changes' : 'Book Room')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
