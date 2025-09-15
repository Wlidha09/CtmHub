
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import type { MeetingRoom, Booking, Employee, Department } from "@/lib/types";
import { getRooms } from "@/lib/firebase/rooms";
import { getEmployees, getEmployee } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { getBookingsForRoomByDate } from "@/lib/firebase/bookings";
import { BookingForm } from "./components/booking-form";
import { BookingTimeline } from "./components/booking-timeline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// In a real app, this would come from the authenticated user
const FAKE_CURRENT_USER_ID = "e2";

export default function BookRoomPage() {
  const [rooms, setRooms] = React.useState<MeetingRoom[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | undefined>();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchInitialData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [roomList, employeeList, departmentList, user] = await Promise.all([
        getRooms(),
        getEmployees(),
        getDepartments(),
        getEmployee(FAKE_CURRENT_USER_ID)
      ]);
      setRooms(roomList);
      setEmployees(employeeList);
      setDepartments(departmentList);
      setCurrentUser(user);

      if (roomList.length > 0) {
        setSelectedRoomId(roomList[0].id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load initial data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchBookings = React.useCallback(async () => {
    if (!selectedRoomId || !selectedDate) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const roomBookings = await getBookingsForRoomByDate(selectedRoomId, dateStr);
      
      const employeeMap = new Map(employees.map(e => [e.id, e]));
      const departmentMap = new Map(departments.map(d => [d.id, d.name]));

      const populatedBookings = roomBookings.map(b => {
          const employee = employeeMap.get(b.userId);
          return {
              ...b,
              employeeName: employee?.name || 'Unknown User',
              departmentName: departmentMap.get(employee?.departmentId || '') || 'Unknown Dept.'
          }
      })
      setBookings(populatedBookings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bookings for the selected room and date.",
      });
    }
  }, [selectedRoomId, selectedDate, employees, departments, toast]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);
  
  if (isLoading) {
      return <div>Loading booking system...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Book a Meeting Room
        </h1>
        <p className="text-muted-foreground">
          Check availability and book a room for your meetings.
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Room and Date</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Meeting Room</label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms.map(room => (
                      <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 flex justify-center">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                    />
              </div>
            </CardContent>
          </Card>

          <BookingTimeline bookings={bookings} onBookingDeleted={fetchBookings}/>
        </div>
        
        <div className="lg:col-span-1">
          <BookingForm 
            roomId={selectedRoomId}
            date={selectedDate}
            currentUser={currentUser}
            bookings={bookings}
            onBookingCreated={fetchBookings}
          />
        </div>
      </div>
    </div>
  );
}
