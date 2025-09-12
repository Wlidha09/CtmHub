import { getEmployees } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { EmployeeTable } from "./employee-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Employee, Department } from "@/lib/types";

export default async function EmployeesPage() {
  const employees: Employee[] = await getEmployees();
  const departments: Department[] = await getDepartments();

  const departmentMap = new Map(departments.map(d => [d.id, d.name]));

  const formattedEmployees = employees.map((employee) => ({
    ...employee,
    departmentName: departmentMap.get(employee.departmentId) || "Unknown",
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Employee Directory
          </h1>
          <p className="text-muted-foreground">
            Browse and manage all employees in your organization.
          </p>
        </header>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Employee
        </Button>
      </div>
      <EmployeeTable data={formattedEmployees} />
    </div>
  );
}
