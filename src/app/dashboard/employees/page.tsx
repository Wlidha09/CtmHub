"use client";

import * as React from "react";
import { EmployeeTable } from "./employee-table";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import type { Employee, Department } from "@/lib/types";
import { useCurrentRole } from "@/hooks/use-current-role";
import { EmployeeForm } from "./employee-form";
import { getEmployees, addEmployee, updateEmployee } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

type FormattedEmployee = Employee & { departmentName: string };

export default function EmployeesPage() {
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Owner' || currentRole === 'RH';
  const { toast } = useToast();
  const router = useRouter();

  const [employees, setEmployees] = React.useState<FormattedEmployee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<FormattedEmployee | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [employeeList, departmentList] = await Promise.all([
          getEmployees(),
          getDepartments(),
        ]);

        setDepartments(departmentList);
        const departmentMap = new Map(departmentList.map(d => [d.id, d.name]));
        
        const formatted = employeeList.map((employee) => ({
          ...employee,
          departmentName: departmentMap.get(employee.departmentId) || "Unknown",
        }));
        setEmployees(formatted);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "Could not load employees and departments.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
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
  
  const handleSave = async (employeeData: Partial<Employee>) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        await updateEmployee(editingEmployee.id, employeeData);
        toast({ title: "Success", description: "Employee updated successfully." });
      } else {
        // Add new employee
        const newEmployeeData = {
            ...employeeData,
            status: 'active',
            startDate: new Date().toISOString(),
        }
        await addEmployee(newEmployeeData as Omit<Employee, 'id'>);
        toast({ title: "Success", description: "Employee added successfully." });
      }
      router.refresh();
      const updatedEmployees = await getEmployees();
      const departmentMap = new Map(departments.map(d => [d.id, d.name]));
      const formatted = updatedEmployees.map((employee) => ({
        ...employee,
        departmentName: departmentMap.get(employee.departmentId) || "Unknown",
      }));
      setEmployees(formatted);

    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save employee information.",
      });
    } finally {
      handleFormClose();
    }
  }
  
  if (isLoading) {
    return <div>Loading...</div>;
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
      <EmployeeTable 
        data={employees} 
        onEditEmployee={handleEditEmployee} 
      />

      {isFormOpen && (
        <EmployeeForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleSave}
          employee={editingEmployee}
          departments={departments}
        />
      )}
    </div>
  );
}
