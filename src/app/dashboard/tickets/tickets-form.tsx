"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { getWorkedDays } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Ticket } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const initialState = {
  message: "",
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Calculating..." : "Calculate Worked Days"}
    </Button>
  );
}

export function TicketsForm() {
  const [state, formAction] = useActionState(getWorkedDays, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === "Calculation successful.") {
      toast({
        title: "Success!",
        description: `Worked days calculated.`,
      });
    } else if (state.errors) {
       toast({
        variant: "destructive",
        title: "Invalid Input",
        description: Object.values(state.errors).flat()[0] ?? "Please check your input.",
      });
    } else if (state.message && state.data === null && !state.errors) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.message,
        });
    }
  }, [state, toast]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" },
  ];

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Select name="month" required>
                <SelectTrigger id="month">
                    <SelectValue placeholder="Select a month" />
                </SelectTrigger>
                <SelectContent>
                    {months.map(m => <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
         <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
             <Select name="year" required>
                <SelectTrigger id="year">
                    <SelectValue placeholder="Select a year" />
                </SelectTrigger>
                <SelectContent>
                    {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
      </div>
       <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="holidays">Holidays</Label>
          <Input id="holidays" name="holidays" type="number" placeholder="e.g., 2" defaultValue="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="vacationDays">Vacation Days</Label>
          <Input id="vacationDays" name="vacationDays" type="number" placeholder="e.g., 5" defaultValue="0" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sickDays">Sick Days</Label>
          <Input id="sickDays" name="sickDays" type="number" placeholder="e.g., 1" defaultValue="0" />
        </div>
       </div>

      <SubmitButton />

      {state.data !== null && (
        <Alert>
          <Ticket className="h-4 w-4" />
          <AlertTitle>Result</AlertTitle>
          <AlertDescription>
            <p>
              The total number of days worked is{" "}
              <span className="font-bold text-lg text-primary">{state.data} days</span>.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
