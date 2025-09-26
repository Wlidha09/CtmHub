
"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketForm } from "./components/ticket-form";
import { TicketResults } from "./components/ticket-results";
import { getEmployees, getEmployee } from "@/lib/firebase/employees";
import { generateWorkTicket } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import type { Employee, Ticket } from "@/lib/types";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentRole } from "@/hooks/use-current-role";

const translations = { en, fr };

function TicketsPage() {
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [ticket, setTicket] = React.useState<Ticket | null>(null);
  const { toast } = useToast();
  const { language } = useLanguage();
  const { user: authUser } = useAuth();
  const { currentRole } = useCurrentRole();
  const t = translations[language].tickets_page;

  React.useEffect(() => {
    async function fetchInitialData() {
      setIsLoading(true);
      try {
        const employeeList = await getEmployees();
        setEmployees(employeeList);
        if (authUser?.email) {
          const user = employeeList.find(emp => emp.email === authUser.email) || null;
          setCurrentUser(user);
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
    }
    fetchInitialData();
  }, [toast, t, authUser]);

  const handleGenerateTicket = async (employeeId: string, month: Date) => {
    setIsGenerating(true);
    setTicket(null);
    try {
      const result = await generateWorkTicket(employeeId, month);
      if (result.success && result.data) {
        setTicket(result.data);
        toast({
            title: "Success",
            description: t.toast_generate_success
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || t.toast_generate_error,
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
  
  const {formEmployees, defaultEmployeeId} = React.useMemo(() => {
    const isPrivileged = ['Owner', 'RH', 'Dev'].includes(currentRole);
    if (isPrivileged) {
      return { formEmployees: employees, defaultEmployeeId: undefined };
    }
    if (currentUser) {
      return { formEmployees: [currentUser], defaultEmployeeId: currentUser.id };
    }
    return { formEmployees: [], defaultEmployeeId: undefined };
  }, [employees, currentRole, currentUser]);


  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.description}
        </p>
      </header>
      
      <Card>
        <CardHeader>
          <CardTitle>{t.generate_ticket}</CardTitle>
          <CardDescription>
            {t.generate_ticket_desc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TicketForm
            employees={formEmployees}
            onGenerate={handleGenerateTicket}
            isGenerating={isGenerating}
            defaultEmployeeId={defaultEmployeeId}
          />
        </CardContent>
      </Card>

      {isGenerating && <div>{t.generating}</div>}

      {ticket && (
        <TicketResults ticket={ticket} />
      )}
    </div>
  );
}

export default withPermission(TicketsPage, "Tickets");
