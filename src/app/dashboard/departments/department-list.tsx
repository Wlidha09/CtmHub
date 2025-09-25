
"use client";

import * as React from "react";
import type { Department, Employee } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { doc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useCurrentRole } from "@/hooks/use-current-role";
import { deleteDepartment } from "@/lib/firebase/departments";

type DepartmentWithLead = Department & { lead?: Employee };

function EditDepartmentDialog({
  isOpen,
  onOpenChange,
  dept,
  allEmployees,
  departments,
  onUpdateSuccess,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  dept: DepartmentWithLead | null;
  allEmployees: Employee[];
  departments: DepartmentWithLead[];
  onUpdateSuccess: () => void;
}) {
  const [departmentName, setDepartmentName] = React.useState<string>("");
  const [selectedLead, setSelectedLead] = React.useState<string | undefined>();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  React.useEffect(() => {
    if (dept) {
        setDepartmentName(dept.name);
        setSelectedLead(dept.leadId);
    }
  }, [dept, isOpen]); // Rerun when dialog opens

  if (!dept) {
    return null;
  }

  const handleSaveChanges = async () => {
    setIsUpdating(true);
    
    const leadHasChanged = selectedLead !== dept.leadId;

    if (selectedLead && leadHasChanged) {
      const isAlreadyLead = departments.some(
        (d) => d.leadId === selectedLead && d.id !== dept.id
      );
      if (isAlreadyLead) {
        toast({
          variant: "destructive",
          title: "Assignment Failed",
          description: "This employee is already leading another department.",
        });
        setIsUpdating(false);
        return false;
      }
    }
    
    const updates: Partial<Department> = {};
    if (departmentName && departmentName !== dept.name) {
      updates.name = departmentName;
    }
    if (leadHasChanged) {
        updates.leadId = selectedLead || "";
    }
    
    if (Object.keys(updates).length === 0) {
      setIsUpdating(false);
      onOpenChange(false);
      return true; // No changes to save
    }

    try {
        const batch = writeBatch(db);
        const departmentRef = doc(db, 'departments', dept.id);
        batch.update(departmentRef, updates);

        if (leadHasChanged) {
            // New lead is assigned
            if (selectedLead) {
                const newLeadRef = doc(db, 'employees', selectedLead);
                batch.update(newLeadRef, { role: 'Manager' });
            }
            
            // Old lead is unassigned
            if (dept.leadId) {
                // Check if the old lead is still a lead of any other department in the *original* list
                const isStillLead = departments.some(
                    (d) => d.leadId === dept.leadId && d.id !== dept.id
                );

                if (!isStillLead) {
                    const oldLeadRef = doc(db, 'employees', dept.leadId);
                    batch.update(oldLeadRef, { role: 'Employee' });
                }
            }
        }


        await batch.commit();

        toast({
            title: "Department Updated",
            description: `The ${dept.name} department has been updated.`,
        });
        onUpdateSuccess();
        onOpenChange(false);
        return true;
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update the department.",
        });
        return false;
    } finally {
        setIsUpdating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit {dept.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="dept-name">Department Name</Label>
                    <Input 
                        id="dept-name"
                        value={departmentName} 
                        onChange={(e) => setDepartmentName(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <Label>Department Lead</Label>
                    <Select onValueChange={setSelectedLead} value={selectedLead || ""}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a new lead" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">No Leader</SelectItem>
                        {allEmployees
                        .map((employee) => (
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
                <Button onClick={handleSaveChanges} disabled={isUpdating}>
                    {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export function DepartmentList({
  initialDepartments,
  allEmployees,
  onAction,
}: {
  initialDepartments: DepartmentWithLead[];
  allEmployees: Employee[];
  onAction: () => void;
}) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [selectedDept, setSelectedDept] = React.useState<DepartmentWithLead | null>(null);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
  const canManageDepartments = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

  const generateColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 80%)`;
  };
  
  const getInitials = (name: string) => {
    return name
        .split(' ')
        .map(word => word.charAt(0))
        .join('');
  };

  const handleDelete = async (departmentId: string) => {
    setIsUpdating(true);
    try {
      await deleteDepartment(departmentId);
      toast({
        title: "Department Deleted",
        description: "The department has been successfully deleted.",
      });
      onAction();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the department.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditClick = (dept: DepartmentWithLead) => {
    setSelectedDept(dept);
    setIsEditDialogOpen(true);
  }

  return (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {initialDepartments.map((dept) => (
            <Card key={dept.id}>
            <CardHeader className="flex flex-col items-center justify-center gap-4">
                <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background"
                    style={{ backgroundColor: generateColor(dept.name) }}
                >
                    {getInitials(dept.name)}
                </div>
                <CardTitle>{dept.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-center">
                {dept.lead ? (
                    <p className="font-semibold">{dept.lead.name}</p>
                ) : (
                    <p className="text-muted-foreground">No lead assigned.</p>
                )}
            </CardContent>
            {canManageDepartments && (
                <CardFooter className="flex justify-center gap-2">
                <Button variant="outline" className="w-full" onClick={() => handleEditClick(dept)}>Edit</Button>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the department.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(dept.id)} disabled={isUpdating}>
                        {isUpdating ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
                </CardFooter>
            )}
            </Card>
        ))}
        </div>
         <EditDepartmentDialog
            isOpen={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            dept={selectedDept}
            allEmployees={allEmployees}
            departments={initialDepartments}
            onUpdateSuccess={onAction}
        />
    </>
  );
}
