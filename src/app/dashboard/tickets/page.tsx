"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketForm } from "./components/ticket-form";
import { TicketResults } from "./components/ticket-results";
import { getEmployees } from "@/lib/firebase/employees";
import { generateWorkTicket } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Ticket } from "@/lib/types";

export default function TicketsPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchInitialData() {
      try {
        const employeeList = await getEmployees();
        setEmployees(employeeList);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load employees.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  const handleGenerateTicket = async (employeeId: string, month: Date) => {
    setIsGenerating(true);
    setTicket(null);
    try {
      const result = await generateWorkTicket(employeeId, month);
      if (result.success && result.data) {
        setTicket(result.data);
        toast({
            title: "Success",
            description: "Work ticket generated successfully."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to generate ticket.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Work Ticket Generator
        </h1>
        <p className="text-muted-foreground">
          Calculate an employee's worked days for a specific month.
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Ticket</CardTitle>
          <CardDescription>
            Select an employee and a month to generate their work ticket.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm
            employees={employees}
            onGenerate={handleGenerateTicket}
            isGenerating={isGenerating}
          />
        </CardContent>
      </Card>

      {isGenerating && <div>Generating ticket...</div>}

      {ticket && (
        <TicketResults ticket={ticket} />
      )}
    </div>
  );
}
