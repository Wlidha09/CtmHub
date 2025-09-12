import { departmentData, employees, getEmployeeById } from "@/lib/data";
import { DepartmentList } from "./department-list";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function DepartmentsPage() {
  const departmentsWithLeads = departmentData.map(dept => {
    const lead = getEmployeeById(dept.leadId);
    return {
      ...dept,
      lead: lead!, 
    };
  });

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
