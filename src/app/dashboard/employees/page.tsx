
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
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

type FormattedEmployee = Employee & { departmentName: string };

export default function EmployeesPage() {
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].employees_page;

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
        leaveBalance: employee.leaveBalance ?? 0,
      }));
      setEmployees(formatted);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t.toast_fetch_error,
        description: t.toast_fetch_error_desc,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

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
      const isEditing = !!editingEmployee;
      const employeeId = isEditing ? editingEmployee.id : null;

      // Automatically set role to 'Dev' if isDev is true
      if (employeeData.isDev) {
        employeeData.role = 'Dev';
      }
  
      // Uniqueness check for email
      if (employeeData.email) {
        const emailExists = employees.some(
          (emp) => emp.email === employeeData.email && emp.id !== employeeId
        );
        if (emailExists) {
          toast({
            variant: "destructive",
            title: t.toast_email_exists,
            description: t.toast_email_exists_desc,
          });
          return;
        }
      }
  
      // Uniqueness check for phone number
      if (employeeData.phoneNumber && employeeData.phoneNumber !== '+216') {
        const phoneExists = employees.some(
          (emp) => emp.phoneNumber === employeeData.phoneNumber && emp.id !== employeeId
        );
        if (phoneExists) {
          toast({
            variant: "destructive",
            title: t.toast_phone_exists,
            description: t.toast_phone_exists_desc,
          });
          return;
        }
      }

      // Check for one manager per department
      if (employeeData.role === 'Manager' && employeeData.departmentId) {
        const departmentHasManager = employees.some(emp => 
          emp.departmentId === employeeData.departmentId &&
          emp.role === 'Manager' &&
          emp.id !== employeeId
        );

        if (departmentHasManager) {
          toast({
            variant: "destructive",
            title: "Manager Already Assigned",
            description: "This department already has a manager. Please assign a different role or department.",
          });
          return;
        }
      }


      if (isEditing) {
        // Update existing employee
        await updateEmployee(employeeId!, employeeData);
        toast({ title: "Success", description: t.toast_update_success });
      } else {
        // Add new employee
        const newEmployeeData: Omit<Employee, 'id'> = {
            name: employeeData.name || '',
            email: employeeData.email || '',
            phoneNumber: employeeData.phoneNumber || '',
            avatarUrl: employeeData.avatarUrl || 'https://picsum.photos/seed/new-employee/100/100',
            role: employeeData.role || 'Employee',
            departmentId: employeeData.departmentId || '',
            status: employeeData.status || 'active',
            startDate: employeeData.startDate || new Date().toISOString(),
            birthDate: employeeData.birthDate || new Date().toISOString(),
            leaveBalance: employeeData.leaveBalance ?? 0,
            userSettings: employeeData.userSettings || { language: 'en' },
            isDev: employeeData.isDev || false,
        };
        await addEmployee(newEmployeeData);
        toast({ title: "Success", description: t.toast_add_success });
      }
      await fetchData();
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_save_error,
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
        title: t.toast_status_updated,
        description: t.toast_status_updated_desc.replace('{employeeName}', employee.name).replace('{newStatus}', newStatus),
      });
      await fetchData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_status_update_error,
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
            title: t.toast_bulk_update_success,
            description: t.toast_bulk_update_success_desc.replace('{count}', employeeIds.length.toString()).replace('{status}', status),
        });
        await fetchData();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Bulk Update Failed",
            description: t.toast_bulk_update_error,
        });
    }
  };
  
  if (isLoading) {
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
            {canManageEmployees && (
                <Button onClick={handleAddEmployee}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    {t.add_employee}
                </Button>
            )}
        </div>
        <div>{t.loading}</div>
      </div>
    )
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
        {canManageEmployees && (
          <Button onClick={handleAddEmployee}>
            <PlusCircle className="w-4 h-4 mr-2" />
            {t.add_employee}
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
