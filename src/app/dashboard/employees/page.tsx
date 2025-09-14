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
import { writeBatch, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

type FormattedEmployee = Employee & { departmentName: string };

export default function EmployeesPage() {
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';
  const { toast } = useToast();
  const router = useRouter();

  const [employees, setEmployees] = React.useState<FormattedEmployee[]>([]);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [editingEmployee, setEditingEmployee] = React.useState<FormattedEmployee | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
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
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);
  
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
            birthDate: new Date().toISOString(),
        }
        await addEmployee(newEmployeeData as Omit<Employee, 'id'>);
        toast({ title: "Success", description: "Employee added successfully." });
      }
      await fetchData();
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

  const handleToggleStatus = async (employee: FormattedEmployee) => {
    const newStatus = (employee.status || 'active') === 'active' ? 'inactive' : 'active';
    try {
      await updateEmployee(employee.id, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `${employee.name}'s status has been updated to ${newStatus}.`,
      });
      await fetchData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update employee status.",
      });
    }
  };

  const handleBulkToggleStatus = async (employeeIds: string[], status: 'active' | 'inactive') => {
    if (employeeIds.length === 0) return;
    try {
        const batch = writeBatch(db);
        employeeIds.forEach(id => {
            const employeeRef = doc(db, 'employees', id);
            batch.update(employeeRef, { status });
        });
        await batch.commit();
        toast({
            title: 'Bulk Update Successful',
            description: `${employeeIds.length} employee(s) have been set to ${status}.`
        });
        await fetchData();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Bulk Update Failed",
            description: "An error occurred while updating employee statuses.",
        });
    }
  };
  
  if (isLoading) {
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
        <div>Loading...</div>
      </div>
    )
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
        onToggleStatus={handleToggleStatus}
        onBulkToggleStatus={handleBulkToggleStatus}
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
