import { employees, getDepartmentName } from "@/lib/data";
import { EmployeeTable } from "./employee-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function EmployeesPage() {
  const formattedEmployees = employees.map((employee) => ({
    ...employee,
    departmentName: getDepartmentName(employee.departmentId),
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
