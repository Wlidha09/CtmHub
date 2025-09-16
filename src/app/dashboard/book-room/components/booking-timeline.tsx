
"use client";

import * as React from "react";
import type { Booking } from "@/lib/types";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast";
import { deleteBooking } from "../actions";
import { useCurrentRole } from "@/hooks/use-current-role";

interface BookingTimelineProps {
  bookings: Booking[];
  onBookingDeleted: () => void;
  onEditBooking: (booking: Booking) => void;
}

export function BookingTimeline({ bookings, onBookingDeleted, onEditBooking }: BookingTimelineProps) {
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();

  // In a real app, you would get this from auth state
  const FAKE_CURRENT_USER_ID = "e2";

  const handleDelete = async (id: string) => {
    const result = await deleteBooking(id);
    if (result.success) {
      toast({ title: "Success", description: "Booking cancelled." });
      onBookingDeleted();
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
        <CardDescription>
          Booked slots for {bookings.length > 0 ? format(new Date(bookings[0].date), "MMMM d, yyyy") : format(new Date(), "MMMM d, yyyy")}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bookings.length > 0 ? (
          <ul className="space-y-4">
            {bookings.map((booking) => {
              const canManage = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH' || booking.userId === FAKE_CURRENT_USER_ID;
              return (
              <li key={booking.id} className="p-4 rounded-lg bg-muted/50 flex items-center justify-between gap-4">
                <div>
                    <p className="font-semibold text-lg">
                        {format(new Date(booking.startTime), "h:mm a")} - {format(new Date(booking.endTime), "h:mm a")}
                    </p>
                    <p className="text-muted-foreground font-medium">{booking.title}</p>
                </div>
                {canManage && (
                    <div className="flex items-center">
                        <Button variant="ghost" size="icon" onClick={() => onEditBooking(booking)}>
                            <Edit className="w-5 h-5"/>
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive">
                                    <Trash2 className="w-5 h-5"/>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently cancel this booking.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(booking.id)}>Delete Booking</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
              </li>
            )})}
          </ul>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground">
            No bookings for this day.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
