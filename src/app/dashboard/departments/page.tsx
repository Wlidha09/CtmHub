import { DepartmentList } from "./department-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Department, Employee } from "@/lib/types";
import { departmentData, employees as employeeData } from "@/lib/data";

async function getEmployee(id: string): Promise<Employee | undefined> {
  return employeeData.find(e => e.id === id);
}

export default async function DepartmentsPage() {
  const departments: Department[] = departmentData;
  const employees: Employee[] = employeeData;

  const departmentsWithLeads = await Promise.all(
    departments.map(async (dept: Department) => {
      const lead = await getEmployee(dept.leadId);
      return {
        ...dept,
        lead: lead!,
      };
    })
  );

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
         <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>
      <DepartmentList initialDepartments={departmentsWithLeads} allEmployees={employees} />
    </div>
  );
}
