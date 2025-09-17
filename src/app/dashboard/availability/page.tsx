
"use client";

import * as React from "react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { SubmitAvailability } from "./components/submit-availability";
import { AvailabilityOverview } from "./components/availability-overview";
import type { Availability, Employee, WeeklySchedule } from "@/lib/types";
import { getUserAvailabilityForWeek, getWeeklySchedule } from "@/lib/firebase/availability";
import { useToast } from "@/hooks/use-toast";
import { startOfWeek, format } from "date-fns";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

// In a real app, this would come from the authenticated user
const FAKE_CURRENT_USER_ID = "e2";

export default function AvailabilityPage() {
  const { currentRole } = useCurrentRole();
  const [userAvailability, setUserAvailability] = React.useState<Availability | null>(null);
  const [weeklySchedule, setWeeklySchedule] = React.useState<WeeklySchedule[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].availability_page;

  const isManagerView = currentRole === 'Manager' || currentRole === 'RH' || currentRole === 'Owner' || currentRole === 'Dev';
  
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const weekStartDate = format(weekStart, 'yyyy-MM-dd');

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      if (isManagerView) {
        const schedule = await getWeeklySchedule();
        setWeeklySchedule(schedule);
      } else {
        const availability = await getUserAvailabilityForWeek(FAKE_CURRENT_USER_ID, weekStartDate);
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
  }, [isManagerView, weekStartDate, toast, t]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  const hasSubmitted = !!userAvailability;

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

      {isManagerView || hasSubmitted ? (
        <AvailabilityOverview initialSchedule={weeklySchedule} />
      ) : (
        <SubmitAvailability 
          userId={FAKE_CURRENT_USER_ID}
          weekStartDate={weekStartDate}
          onScheduleSubmit={fetchData} 
        />
      )}
    </div>
  );
}
