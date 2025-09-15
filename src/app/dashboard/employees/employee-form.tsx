
"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Employee, Department } from "@/lib/types";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void;
  employee: Employee | null;
  departments: Department[];
}

export function EmployeeForm({ isOpen, onClose, onSave, employee, departments }: EmployeeFormProps) {
  const [formData, setFormData] = React.useState<Partial<Employee>>({});

  React.useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
        birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
        leaveBalance: employee.leaveBalance ?? 0,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phoneNumber: '+216',
        avatarUrl: 'https://picsum.photos/seed/new-employee/100/100',
        role: 'Employee',
        departmentId: '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        birthDate: new Date().toISOString().split('T')[0],
        leaveBalance: 0,
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.departmentId) {
      alert("Please fill out all fields.");
      return;
    }
    
    // Convert date strings back to ISO strings before saving
    const dataToSave = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        birthDate: formData.birthDate ? new Date(formData.birthDate).toISOString() : undefined,
        leaveBalance: typeof formData.leaveBalance === 'number' ? formData.leaveBalance : 0,
    };
    onSave(dataToSave);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="e.g., John Doe"
            required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="e.g., john.doe@example.com"
                required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                value={formData.phoneNumber || ""}
                onChange={handleChange}
                placeholder="e.g., +216 12 345 678"
                />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                name="role"
                value={formData.role || ""}
                onValueChange={(value) => handleSelectChange("role", value)}
                >
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Owner">Owner</SelectItem>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Employee">Employee</SelectItem>
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                name="departmentId"
                value={formData.departmentId || ""}
                onValueChange={(value) => handleSelectChange("departmentId", value)}
                >
                <SelectTrigger id="departmentId">
                    <SelectValue placeholder="Select a department" />
                </SelectTrigger>
                <SelectContent>
                    {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                    name="status"
                    value={formData.status || ""}
                    onValueChange={(value) => handleSelectChange("status", value as 'active' | 'inactive')}
                >
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                    id="start-date"
                    name="startDate"
                    type="date"
                    value={formData.startDate || ''}
                    onChange={handleChange}
                />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                    <Label htmlFor="birth-date">Birth Date</Label>
                    <Input
                        id="birth-date"
                        name="birthDate"
                        type="date"
                        value={formData.birthDate || ''}
                        onChange={handleChange}
                    />
            </div>
            <div className="space-y-2">
                <Label htmlFor="leaveBalance">Leave Balance</Label>
                <Input
                    id="leaveBalance"
                    name="leaveBalance"
                    type="number"
                    value={formData.leaveBalance ?? ''}
                    onChange={handleChange}
                    placeholder="e.g., 10"
                />
            </div>
           </div>
           <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
             </DialogClose>
             <Button type="submit">Save Changes</Button>
           </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
