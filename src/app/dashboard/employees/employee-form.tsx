
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
import { useToast } from "@/hooks/use-toast";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Checkbox } from "@/components/ui/checkbox";

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Partial<Employee>) => void;
  employee: Employee | null;
  departments: Department[];
}

export function EmployeeForm({ isOpen, onClose, onSave, employee, departments }: EmployeeFormProps) {
  const [formData, setFormData] = React.useState<Partial<Employee>>({});
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();

  const canEditSensitiveFields = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

  React.useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        startDate: employee.startDate ? new Date(employee.startDate).toISOString().split('T')[0] : '',
        birthDate: employee.birthDate ? new Date(employee.birthDate).toISOString().split('T')[0] : '',
        leaveBalance: employee.leaveBalance ?? 0,
        isDev: employee.isDev || false,
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
        userSettings: { language: 'en' },
        isDev: false,
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
     if (name === "phoneNumber") {
      // Allow only digits after +216 and limit length
      const prefix = "+216";
      if (value.startsWith(prefix)) {
        const numericPart = value.substring(prefix.length).replace(/[^0-9]/g, "");
        setFormData(prev => ({ ...prev, [name]: `${prefix}${numericPart}` }));
      } else {
        // If they delete the prefix, reset it
        setFormData(prev => ({ ...prev, [name]: prefix }));
      }
    } else {
      setFormData(prev => ({ 
          ...prev, 
          [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value 
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({...prev, [name]: checked}));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.departmentId) {
       toast({
        variant: "destructive",
        title: "Missing Fields",
        description: "Please fill out all required fields.",
      });
      return;
    }
    
    // Validate phone number
    const phoneRegex = /^\+216\d{8}$/;
    if (formData.phoneNumber && !phoneRegex.test(formData.phoneNumber)) {
      toast({
        variant: "destructive",
        title: "Invalid Phone Number",
        description: "Phone number must be in the format +216 followed by 8 digits.",
      });
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
                placeholder="+216 12345678"
                maxLength={12}
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
                disabled={!canEditSensitiveFields || formData.isDev}
                >
                <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                    {currentRole === 'Dev' && <SelectItem value="Dev">Dev</SelectItem>}
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
                disabled={!canEditSensitiveFields}
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
                    disabled={!canEditSensitiveFields}
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
                    disabled={!canEditSensitiveFields}
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
                    disabled
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
