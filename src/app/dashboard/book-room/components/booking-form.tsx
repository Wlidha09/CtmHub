
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { addBooking } from "../actions";
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
import { format, setHours, setMinutes, setSeconds, setMilliseconds } from "date-fns";

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
  onBookingCreated: () => void;
}

export function BookingForm({ roomId, date, currentUser, bookings, onBookingCreated }: BookingFormProps) {
  const [title, setTitle] = React.useState("");
  const [startTime, setStartTime] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const getEndTime = (start: string) => {
      const [hour, minute] = start.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(hour, minute);
      startDate.setMinutes(startDate.getMinutes() + 30); // Default to 30 min slots
      return format(startDate, 'HH:mm');
  }
  
  const getFilteredTimeSlots = () => {
    if (!bookings.length) return timeSlots;
    return timeSlots.filter(slot => {
      const [hour, minute] = slot.split(':').map(Number);
      const slotTime = setMilliseconds(setSeconds(setMinutes(setHours(date!, hour), minute), 0), 0).getTime();
      
      for (const booking of bookings) {
        const bookingStart = new Date(booking.startTime).getTime();
        const bookingEnd = new Date(booking.endTime).getTime();
        // Check if the slot is within an existing booking
        if (slotTime >= bookingStart && slotTime < bookingEnd) {
          return false;
        }
      }
      return true;
    });
  };

  const filteredSlots = getFilteredTimeSlots();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !date || !currentUser || !title || !startTime) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please select a room, date, time, and enter a title.",
      });
      return;
    }
    
    setIsSubmitting(true);

    const department = await getDepartment(currentUser.departmentId);
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const bookingStart = setMinutes(setHours(date, startHour), startMinute);
    const bookingEnd = new Date(bookingStart.getTime() + 30 * 60 * 1000); // 30 minute duration

    const result = await addBooking({
      roomId,
      userId: currentUser.id,
      employeeName: currentUser.name,
      departmentName: department?.name || "Unknown",
      title,
      date: format(date, "yyyy-MM-dd"),
      startTime: bookingStart.toISOString(),
      endTime: bookingEnd.toISOString(),
    });

    if (result.success) {
      toast({ title: "Success", description: "Room booked successfully." });
      onBookingCreated();
      setTitle("");
      setStartTime(undefined);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }

    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book a Slot</CardTitle>
        <CardDescription>All meetings are 30 minutes long.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select onValueChange={setStartTime} value={startTime}>
              <SelectTrigger id="start-time">
                <SelectValue placeholder="Select a time slot" />
              </SelectTrigger>
              <SelectContent>
                {filteredSlots.map(slot => (
                  <SelectItem key={slot} value={slot}>{slot} - {getEndTime(slot)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Booking..." : "Book Room"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
