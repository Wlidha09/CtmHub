
"use client";

import * as React from "react";
import { DepartmentList } from "./department-list";
import type { Department, Employee } from "@/lib/types";
import { getDepartments } from "@/lib/firebase/departments";
import { getEmployees } from "@/lib/firebase/employees";
import { useToast } from "@/hooks/use-toast";
import { useCurrentRole } from "@/hooks/use-current-role";
import { AddDepartmentForm } from "./add-department-form";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

type DepartmentWithLead = Department & { lead: Employee | undefined };

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<DepartmentWithLead[]>([]);
  const [employees, setEmployees] = React.useState<Employee[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const { currentRole } = useCurrentRole();
  const { language } = useLanguage();
  const t = translations[language].departments_page;

  const canManageDepartments = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

  const fetchData = React.useCallback(async () => {
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
        description: t.toast_fetch_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (isLoading) {
    // You can replace this with a proper skeleton loader component
    return <div>{t.loading}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </header>
        {canManageDepartments && (
          <AddDepartmentForm allEmployees={employees} onDepartmentAdded={() => router.refresh()} />
        )}
      </div>
      <DepartmentList initialDepartments={departments} allEmployees={employees} />
    </div>
  );
}
