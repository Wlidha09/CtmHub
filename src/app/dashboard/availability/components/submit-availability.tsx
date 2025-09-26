
"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  startOfWeek,
  eachDayOfInterval,
  endOfWeek,
  format,
  isWeekend,
  getDay,
  addDays,
} from "date-fns";
import { saveWeeklyAvailability } from "@/lib/actions";
import { CheckCircle } from "lucide-react";

interface SubmitAvailabilityProps {
  userId: string;
  weekStartDate: string;
  onScheduleSubmit: () => void;
}

export function SubmitAvailability({ userId, weekStartDate, onScheduleSubmit }: SubmitAvailabilityProps) {
  const [selectedDays, setSelectedDays] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const today = new Date();
  const currentDay = getDay(today); // Sunday is 0, Monday is 1, ..., Saturday is 6
  // If it's Thursday (4) or later, show next week.
  const targetDate = (currentDay >= 4 || currentDay === 0) ? addDays(today, 7) : today;
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
  
  const allWeekDays = eachDayOfInterval({
    start: weekStart,
    end: endOfWeek(weekStart, { weekStartsOn: 1 }),
  });
  const weekDays = allWeekDays.filter(day => !isWeekend(day));

  const weekDescription = (currentDay >= 4 || currentDay === 0) ? "next week" : "this week";

  const handleDayClick = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays((prev) => prev.filter((d) => d !== day));
    } else {
      if (selectedDays.length < 3) {
        setSelectedDays((prev) => [...prev, day]);
      } else {
        toast({
          variant: "destructive",
          title: "Limit Reached",
          description: "You can only select up to 3 days.",
        });
      }
    }
  };

  const handleSubmit = async () => {
    if (selectedDays.length === 0) {
      toast({
        variant: "destructive",
        title: "No Days Selected",
        description: "Please select at least one day before submitting.",
      });
      return;
    }
    setIsSubmitting(true);
    const result = await saveWeeklyAvailability(userId, weekStartDate, selectedDays);
    if (result.success) {
      toast({
        title: "Schedule Submitted",
        description: "Your availability for the week has been saved.",
      });
      onScheduleSubmit();
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
    setIsSubmitting(false);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Your In-Office Days</CardTitle>
        <CardDescription>
          Choose up to 3 days you plan to work from the office {weekDescription} (
          {format(weekDays[0], "MMM d")} - {format(weekDays[weekDays.length - 1], "MMM d, yyyy")}).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {weekDays.map((day) => {
            const dayName = format(day, "EEEE");
            const isSelected = selectedDays.includes(dayName);
            return (
              <button
                key={dayName}
                onClick={() => handleDayClick(dayName)}
                className={cn(
                  "p-4 rounded-lg border-2 text-center transition-all relative",
                  isSelected
                    ? "bg-primary/10 border-primary"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                {isSelected && (
                  <CheckCircle className="w-5 h-5 text-primary absolute top-2 right-2" />
                )}
                <p className="font-semibold text-lg">{dayName}</p>
                <p className="text-muted-foreground">{format(day, "MMM d")}</p>
              </button>
            );
          })}
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} disabled={isSubmitting || selectedDays.length === 0}>
          {isSubmitting ? "Submitting..." : "Submit Schedule"}
        </Button>
      </CardFooter>
    </Card>
  );
}
