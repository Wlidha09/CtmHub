
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
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };

// In a real app, this would come from the authenticated user
const FAKE_CURRENT_USER_ID = "e2";

function BookRoomPage() {
  const [rooms, setRooms] = React.useState<MeetingRoom[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | undefined>();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].book_room_page;

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

      if (roomList.length > 0 && !selectedRoomId) {
        setSelectedRoomId(roomList[0].id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_load_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, selectedRoomId, t]);

  React.useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const fetchBookings = React.useCallback(async () => {
    if (!selectedRoomId || !selectedDate) return;
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const roomBookings = await getBookingsForRoomByDate(selectedRoomId, dateStr);
      setBookings(roomBookings);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_fetch_bookings_error,
      });
    }
  }, [selectedRoomId, selectedDate, toast, t]);

  React.useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
  };
  
  if (isLoading) {
      return <div>{t.loading}</div>;
  }

  const timelineBookings = selectedRoomId && selectedDate 
    ? bookings.filter(b => b.roomId === selectedRoomId && b.date === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t.select_room_date}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">{t.meeting_room}</label>
                <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.select_a_room} />
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

          <BookingTimeline 
            bookings={timelineBookings} 
            onBookingDeleted={fetchBookings}
            onEditBooking={handleEditBooking}
          />
        </div>
        
        <div className="lg:col-span-1">
          <BookingForm 
            roomId={selectedRoomId}
            date={selectedDate}
            currentUser={currentUser}
            bookings={bookings}
            onBookingAction={fetchBookings}
            editingBooking={editingBooking}
            setEditingBooking={setEditingBooking}
          />
        </div>
      </div>
    </div>
  );
}

export default withPermission(BookRoomPage, "Book a Room");
