"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import type { Employee } from "@/lib/types";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addDepartment } from "@/lib/firebase/departments";

interface AddDepartmentFormProps {
  allEmployees: Employee[];
  onDepartmentAdded: () => void;
}

export function AddDepartmentForm({ allEmployees, onDepartmentAdded }: AddDepartmentFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [departmentName, setDepartmentName] = React.useState("");
  const [selectedLeadId, setSelectedLeadId] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setDepartmentName("");
    setSelectedLeadId(undefined);
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      resetForm();
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentName) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please enter a department name.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDepartment({ name: departmentName, leadId: selectedLeadId || "" });
      toast({
        title: "Department Created",
        description: `The ${departmentName} department has been created successfully.`,
      });
      setIsOpen(false);
      onDepartmentAdded();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create department.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Department</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department Name</Label>
              <Input
                id="dept-name"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                placeholder="e.g., Marketing"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-lead">Department Lead (Optional)</Label>
              <Select onValueChange={setSelectedLeadId} value={selectedLeadId}>
                <SelectTrigger id="dept-lead">
                  <SelectValue placeholder="Select a lead" />
                </SelectTrigger>
                <SelectContent>
                  {allEmployees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
