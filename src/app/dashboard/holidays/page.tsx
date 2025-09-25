
"use client";

import *delineate React from "react";
import { HolidayTable } from "./holiday-table";
import { HolidayActions } from "./holiday-actions";
import { getHolidaysByYear, deleteHoliday } from "@/lib/firebase/holidays";
import { useToast } from "@/hooks/use-toast";
import type { Holiday } from "@/lib/types";
import { useCurrentRole } from "@/hooks/use-current-role";
import { updateHoliday } from "@/lib/actions";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };

function HolidaysPage() {
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
  const { language } = useLanguage();
  const t = translations[language].holidays_page;
  const canManage = currentRole === 'Owner' || currentRole === 'RH' || currentRole === 'Dev';
  const currentYear = new Date().getFullYear().toString();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const holidayData = await getHolidaysByYear(currentYear);
      setHolidays(holidayData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_fetch_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, toast, t]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTogglePaid = async (id: string, isPaid: boolean) => {
    const originalHolidays = holidays;
    setHolidays(holidays.map(h => h.id === id ? { ...h, isPaid } : h));

    const result = await updateHoliday(id, { isPaid });
    if (!result.success) {
      setHolidays(originalHolidays);
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_paid_update_error,
      });
    }
  };

  const handleUpdate = async (id: string, name: string, date: string) => {
    const originalHolidays = holidays;
    setHolidays(holidays.map(h => h.id === id ? { ...h, name, date } : h));
    
    const result = await updateHoliday(id, { name, date });
    if (result.success) {
        toast({ title: "Success", description: t.toast_update_success });
        fetchData();
    } else {
      setHolidays(originalHolidays);
      toast({
        variant: "destructive",
        title: "Error",
        description: result.message,
      });
    }
  };

  const handleDelete = async (id: string) => {
    const originalHolidays = holidays;
    setHolidays(holidays.filter(h => h.id !== id));
    
    try {
        await deleteHoliday(id);
        toast({ title: "Success", description: t.toast_delete_success });
    } catch {
        setHolidays(originalHolidays);
        toast({
            variant: "destructive",
            title: "Error",
            description: t.toast_delete_error,
        });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t.title.replace('{year}', currentYear)}
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>
        {canManage && <HolidayActions onDataSynced={fetchData} />}
      </div>
      <HolidayTable
        holidays={holidays}
        isLoading={isLoading}
        canManage={canManage}
        onTogglePaid={handleTogglePaid}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default withPermission(HolidaysPage, "Holidays");
