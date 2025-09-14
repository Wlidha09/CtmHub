"use client";

import * as React from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarDays } from "lucide-react";
import type { Employee } from "@/lib/types";

interface TicketFormProps {
  employees: Employee[];
  onGenerate: (employeeId: string, month: Date) => void;
  isGenerating: boolean;
}

export function TicketForm({
  employees,
  onGenerate,
  isGenerating,
}: TicketFormProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<
    string | undefined
  >();
  const [selectedMonth, setSelectedMonth] = React.useState<Date | undefined>(
    new Date()
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmployeeId && selectedMonth) {
      onGenerate(selectedEmployeeId, selectedMonth);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="employee">Employee</Label>
          <Select
            onValueChange={setSelectedEmployeeId}
            value={selectedEmployeeId}
            required
          >
            <SelectTrigger id="employee">
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="month">Month</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                {selectedMonth ? (
                  format(selectedMonth, "MMMM yyyy")
                ) : (
                  <span>Pick a month</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedMonth}
                onSelect={setSelectedMonth}
                initialFocus
                captionLayout="dropdown-buttons"
                fromYear={2020}
                toYear={new Date().getFullYear() + 2}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isGenerating || !selectedEmployeeId || !selectedMonth}
        className="w-full"
      >
        {isGenerating ? "Generating..." : "Generate Ticket"}
      </Button>
    </form>
  );
}
