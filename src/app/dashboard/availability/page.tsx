
"use client";

import * as React from "react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { SubmitAvailability } from "./components/submit-availability";
import { AvailabilityOverview } from "./components/availability-overview";
import type { Availability, Employee, WeeklySchedule } from "@/lib/types";
import { getUserAvailabilityForWeek, getWeeklySchedule } from "@/lib/firebase/availability";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, format, addDays, getDay } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";
import { useAuth } from "@/hooks/use-auth";
import { getEmployee, getEmployees } from "@/lib/firebase/employees";

const translations = { en, fr };

function AvailabilityPage() {
  const { currentRole } = useCurrentRole();
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [userAvailability, setUserAvailability] = React.useState<Availability | null>(null);
  const [weeklySchedule, setWeeklySchedule] = React.useState<WeeklySchedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].availability_page;

  const isManagerView = currentRole === 'Manager' || currentRole === 'RH' || currentRole === 'Owner' || currentRole === 'Dev';
  
  const today = new Date();
  const currentDay = getDay(today); // Sunday is 0, Monday is 1, ..., Saturday is 6
  // If it's Thursday (4), Friday (5), Saturday (6), or Sunday (0), show next week's calendar.
  const targetDate = (currentDay >= 4 || currentDay === 0) ? addDays(today, 7) : today;
  const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }); // Monday
  const weekStartDate = format(weekStart, 'yyyy-MM-dd');

  const fetchData = React.useCallback(async () => {
    if (!authUser?.uid) return;
    setIsLoading(true);
    try {
      const user = await getEmployee(authUser.uid);
      setCurrentUser(user);
      
      const schedule = await getWeeklySchedule();
      setWeeklySchedule(schedule);

      if (user) {
        const availability = await getUserAvailabilityForWeek(user.id, weekStartDate);
        setUserAvailability(availability);
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
  }, [weekStartDate, toast, t, authUser]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading || !currentUser) {
    return <div>{t.loading}</div>;
  }

  const hasSubmitted = !!userAvailability;
  const isPrivilegedUser = currentRole === 'Owner' || currentRole === 'Dev';

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {isManagerView 
            ? t.manager_description
            : t.employee_description
          }
        </p>
      </header>

      {isManagerView ? (
        // Manager, RH, Owner, Dev view
        <div className="space-y-6">
          {!isPrivilegedUser && (
             <SubmitAvailability 
                userId={currentUser.id}
                weekStartDate={weekStartDate}
                onScheduleSubmit={fetchData} 
              />
          )}
          <AvailabilityOverview initialSchedule={weeklySchedule} />
        </div>
      ) : (
        // Employee view
        hasSubmitted ? (
          <AvailabilityOverview initialSchedule={weeklySchedule} />
        ) : (
          <SubmitAvailability 
            userId={currentUser.id}
            weekStartDate={weekStartDate}
            onScheduleSubmit={fetchData} 
          />
        )
      )}
    </div>
  );
}

export default withPermission(AvailabilityPage, "Availability");
