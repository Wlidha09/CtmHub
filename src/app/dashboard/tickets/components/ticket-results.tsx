"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Ticket } from "@/lib/types";

interface TicketResultsProps {
  ticket: Ticket;
}

const MetricCard = ({ title, value, color }: { title: string; value: number | string; color?: string }) => (
  <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center ${color}`}>
    <p className="text-sm font-medium text-muted-foreground">{title}</p>
    <p className="text-4xl font-bold">{value}</p>
  </div>
);

export function TicketResults({ ticket }: TicketResultsProps) {
  const { employee, month, calculation } = ticket;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Work Ticket</CardTitle>
        <div className="text-sm text-muted-foreground">
          Showing results for <span className="font-semibold text-foreground">{employee.name}</span> for the month of <span className="font-semibold text-foreground">{month}</span>.
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <MetricCard title="Total Days in Month" value={calculation.totalDays} color="bg-blue-100 dark:bg-blue-900/50"/>
            <MetricCard title="Weekend Days" value={calculation.weekendDays} color="bg-gray-100 dark:bg-gray-800/50"/>
            <MetricCard title="Paid Public Holidays" value={calculation.publicHolidays} color="bg-yellow-100 dark:bg-yellow-900/50"/>
            <MetricCard title="Total Workable Days" value={calculation.workableDays} color="bg-green-100 dark:bg-green-900/50"/>
            <MetricCard title="Leave Days Taken" value={calculation.leaveDaysTaken} color="bg-orange-100 dark:bg-orange-900/50"/>
            <MetricCard title="Net Worked Days" value={calculation.netWorkedDays} color="bg-primary/20"/>
        </div>
        {calculation.leaveDetails.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Leave Details:</h4>
            <ul className="space-y-1 text-sm list-disc pl-5">
              {calculation.leaveDetails.map((leave, index) => (
                <li key={index}>
                  <span className="font-medium">{leave.type}:</span> {leave.days} day(s) from {leave.startDate} to {leave.endDate}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
