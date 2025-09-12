import { TimeOffForm } from "./time-off-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TimeOffCalculatorPage() {
  return (
    <div className="flex flex-col gap-6">
       <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Time-Off Calculator
        </h1>
        <p className="text-muted-foreground">
          Estimate accumulated paid time off for an employee.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Calculator</CardTitle>
            <CardDescription>Enter the number of months worked to estimate paid time off.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeOffForm />
          </CardContent>
        </Card>
        <Card className="bg-muted/50">
           <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              This tool uses a generative AI model to calculate the estimated paid time off.
            </p>
            <p>
              The calculation is based on a standard accrual rate of <span className="font-semibold text-foreground">1.75 days</span> per month worked.
            </p>
             <p>
              Enter the total number of months an employee has been with the company to see their estimated accumulated PTO.
            </p>
             <p>
              Please note that this is an estimate. Actual time off may vary based on company policy, unpaid leave, and other factors.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
