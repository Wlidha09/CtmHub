"use client";

import * as React from "react";
import { format } from "date-fns";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

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
      setFormData(employee);
    } else {
      setFormData({
        name: '',
        email: '',
        avatarUrl: 'https://picsum.photos/seed/new-employee/100/100',
        role: 'Employee',
        departmentId: '',
        status: 'active',
        startDate: new Date().toISOString(),
        birthDate: new Date().toISOString(),
      });
    }
  }, [employee, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: 'startDate' | 'birthDate', date: Date | undefined) => {
    if (date) {
        setFormData(prev => ({ ...prev, [name]: date.toISOString() }));
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role || !formData.departmentId) {
      alert("Please fill out all fields.");
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{employee ? "Edit Employee" : "Add Employee"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="start-date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.startDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formData.startDate ? format(new Date(formData.startDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={formData.startDate ? new Date(formData.startDate) : undefined}
                        onSelect={(date) => handleDateChange("startDate", date)}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>
          </div>
           <div className="space-y-2">
                <Label htmlFor="birth-date">Birth Date</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        id="birth-date"
                        variant={"outline"}
                        className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.birthDate && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formData.birthDate ? format(new Date(formData.birthDate), "PPP") : <span>Pick a date</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={formData.birthDate ? new Date(formData.birthDate) : undefined}
                        onSelect={(date) => handleDateChange("birthDate", date)}
                        captionLayout="dropdown-buttons"
                        fromYear={1950}
                        toYear={new Date().getFullYear()}
                        initialFocus
                        />
                    </PopoverContent>
                </Popover>
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
