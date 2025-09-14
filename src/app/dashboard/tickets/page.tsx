import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketsForm } from "./tickets-form";

export default function TicketsPage() {
  return (
    <div className="flex flex-col gap-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Tickets
        </h1>
        <p className="text-muted-foreground">
          Calculate the number of days worked per month, considering holidays and leave.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Work Day Calculator</CardTitle>
            <CardDescription>Enter the details below to calculate the total days worked in a month.</CardDescription>
          </CardHeader>
          <CardContent>
            <TicketsForm />
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
           <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This tool uses a generative AI model to calculate the number of days an employee has worked in a specific month.
            </p>
            <p>
              The calculation is based on the total number of days in the month, minus weekends, public holidays, vacation days, and sick days.
            </p>
             <p>
              Enter the month, year, and any days off to get an accurate count of worked days.
            </p>
             <p>
              Please note that this is an estimate. Ensure the number of holidays and leave days is accurate for the selected month.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
