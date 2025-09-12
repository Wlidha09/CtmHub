"use client";

import { useFormState, useFormStatus } from "react-dom";
import { getEstimatedTimeOff } from "@/lib/actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const initialState = {
  message: "",
  errors: null,
  data: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Calculating..." : "Calculate"}
    </Button>
  );
}

export function TimeOffForm() {
  const [state, formAction] = useFormState(getEstimatedTimeOff, initialState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message === "Calculation successful.") {
      toast({
        title: "Success!",
        description: `Estimated time off calculated.`,
      });
    } else if (state.errors) {
       toast({
        variant: "destructive",
        title: "Invalid Input",
        description: state.errors.monthsWorked?.[0] ?? "Please check your input.",
      });
    } else if (state.message && state.data === null && !state.errors) {
        toast({
            variant: "destructive",
            title: "Error",
            description: state.message,
        });
    }
  }, [state, toast]);

  const handleFormSubmit = (formData: FormData) => {
    formAction(formData);
  };
  
  return (
    <form ref={formRef} action={handleFormSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="monthsWorked">Months Worked</Label>
        <Input
          id="monthsWorked"
          name="monthsWorked"
          type="number"
          placeholder="e.g., 12"
          required
        />
        {state.errors?.monthsWorked && (
          <p className="text-sm font-medium text-destructive">
            {state.errors.monthsWorked[0]}
          </p>
        )}
      </div>
      <SubmitButton />

      {state.data !== null && (
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Estimated Time Off</AlertTitle>
          <AlertDescription>
            <p>
              The employee has an estimated{" "}
              <span className="font-bold text-lg text-primary">{state.data} days</span> of
              paid time off.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}
