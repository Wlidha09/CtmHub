
"use client";

import * as React from "react";
import { HolidayTable } from "./holiday-table";
import { HolidayActions } from "./holiday-actions";
import { getHolidaysByYear, deleteHoliday } from "@/lib/firebase/holidays";
import { useToast } from "@/hooks/use-toast";
import type { Holiday } from "@/lib/types";
import { useCurrentRole } from "@/hooks/use-current-role";
import { updateHoliday } from "@/lib/actions";

export default function HolidaysPage() {
  const [holidays, setHolidays] = React.useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
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
        description: "Failed to fetch holidays.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, toast]);

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
        description: "Failed to update paid status.",
      });
    }
  };

  const handleUpdate = async (id: string, name: string, date: string) => {
    const originalHolidays = holidays;
    setHolidays(holidays.map(h => h.id === id ? { ...h, name, date } : h));
    
    const result = await updateHoliday(id, { name, date });
    if (result.success) {
        toast({ title: "Success", description: "Holiday updated." });
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
        toast({ title: "Success", description: "Holiday deleted." });
    } catch {
        setHolidays(originalHolidays);
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to delete holiday.",
        });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Public Holidays {currentYear}
          </h1>
          <p className="text-muted-foreground">
            Manage your company's official holidays for the year.
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
