
"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Check } from "lucide-react";
import type { WeeklySchedule } from "@/lib/types";
import { startOfWeek, endOfWeek, format, eachDayOfInterval } from 'date-fns';
import { getWeeklySchedule } from "@/lib/firebase/availability";
import { useToast } from "@/hooks/use-toast";

interface AvailabilityOverviewProps {
    initialSchedule: WeeklySchedule[];
}

export function AvailabilityOverview({ initialSchedule }: AvailabilityOverviewProps) {
  const [schedule, setSchedule] = React.useState(initialSchedule);
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();

  React.useEffect(() => {
    // Initial data is already there, but we can fetch fresh data on mount
    // in case it's stale. This is optional.
    const fetchFreshData = async () => {
        setIsLoading(true);
        try {
            const freshSchedule = await getWeeklySchedule();
            setSchedule(freshSchedule);
        } catch {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not refresh schedule data.'
            })
        } finally {
            setIsLoading(false);
        }
    }
    fetchFreshData();
  }, [toast])


  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Availability</CardTitle>
        <CardDescription>
          Showing who is scheduled to be in the office from {format(weekStart, 'MMM d')} to {format(weekEnd, 'MMM d, yyyy')}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[200px]">Employee</TableHead>
                {weekDays.map((day) => (
                    <TableHead key={format(day, 'E')} className="text-center">
                        {format(day, 'E')}
                        <br/>
                        <span className="text-xs font-normal text-muted-foreground">
                            {format(day, 'd')}
                        </span>
                    </TableHead>
                ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">Loading schedule...</TableCell>
                    </TableRow>
                ) : schedule.length > 0 ? (
                    schedule.map((entry) => (
                        <TableRow key={entry.employeeId}>
                            <TableCell className="font-medium">{entry.employeeName}</TableCell>
                            {weekDays.map(day => {
                                const dayName = format(day, 'EEEE');
                                return (
                                    <TableCell key={dayName} className="text-center">
                                        {entry.schedule[dayName] && <Check className="w-5 h-5 text-green-500 mx-auto" />}
                                    </TableCell>
                                )
                            })}
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">No availability data submitted for this week yet.</TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </CardContent>
    </Card>
  );
}
