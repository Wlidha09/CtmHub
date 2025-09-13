"use client";

import * as React from "react";
import { EmployeeTable } from "./employee-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Employee, Department } from "@/lib/types";
import { employees as employeeData, departmentData } from "@/lib/data";
import { useCurrentRole } from "@/hooks/use-current-role";
import { EmployeeForm } from "./employee-form";

type FormattedEmployee = Employee & { departmentName: string };

export default function EmployeesPage() {
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Owner' || currentRole === 'RH';

  const [employees, setEmployees] = React.useState<FormattedEmployee[]>([]);
  const [departments] = React.useState<Department[]>(departmentData);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<FormattedEmployee | null>(null);

  React.useEffect(() => {
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));
    const formatted = employeeData.map((employee) => ({
      ...employee,
      departmentName: departmentMap.get(employee.departmentId) || "Unknown",
    }));
    setEmployees(formatted);
  }, [departments]);
  
  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsFormOpen(true);
  };

  const handleEditEmployee = (employee: FormattedEmployee) => {
    setEditingEmployee(employee);
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingEmployee(null);
  };
  
  const handleSave = (employee: Employee) => {
    // In a real app, you'd save to a database.
    // For now, we update the local state.
    const departmentMap = new Map(departments.map(d => [d.id, d.name]));
    const formattedEmployee = {
      ...employee,
      departmentName: departmentMap.get(employee.departmentId) || "Unknown",
    }

    if (editingEmployee) {
      setEmployees(employees.map(e => e.id === employee.id ? formattedEmployee : e));
    } else {
      setEmployees([...employees, { ...formattedEmployee, id: `e${employees.length + 1}` }]);
    }
    handleFormClose();
  }


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
        {canManageEmployees && (
          <Button onClick={handleAddEmployee}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>
      <EmployeeTable data={employees} onEditEmployee={handleEditEmployee} />

      <EmployeeForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleSave}
        employee={editingEmployee}
        departments={departments}
      />
    </div>
  );
}
