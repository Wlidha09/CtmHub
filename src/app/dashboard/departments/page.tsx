"use client";

import * as React from "react";
import { DepartmentList } from "./department-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Department, Employee } from "@/lib/types";
import { getDepartments } from "@/lib/firebase/departments";
import { getEmployees } from "@/lib/firebase/employees";
import { useToast } from "@/hooks/use-toast";
import { useCurrentRole } from "@/hooks/use-current-role";

type DepartmentWithLead = Department & { lead: Employee | undefined };

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<DepartmentWithLead[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
  const canManageDepartments = currentRole === 'Owner' || currentRole === 'RH';

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [departmentList, employeeList] = await Promise.all([
          getDepartments(),
          getEmployees(),
        ]);
        
        setEmployees(employeeList);
        const employeeMap = new Map(employeeList.map((e) => [e.id, e]));

        const departmentsWithLeads = departmentList.map((dept) => ({
          ...dept,
          lead: employeeMap.get(dept.leadId),
        }));

        setDepartments(departmentsWithLeads);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load departments.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);

  if (isLoading) {
    // You can replace this with a proper skeleton loader component
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Departments
          </h1>
          <p className="text-muted-foreground">
            View and manage departments and their team leads.
          </p>
        </header>
        {canManageDepartments && (
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Department
          </Button>
        )}
      </div>
      <DepartmentList initialDepartments={departments} allEmployees={employees} />
    </div>
  );
}
