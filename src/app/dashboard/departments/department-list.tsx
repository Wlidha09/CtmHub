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
  DialogTrigger,
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
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { useCurrentRole } from "@/hooks/use-current-role";
import { deleteDepartment } from "@/lib/firebase/departments";

type DepartmentWithLead = Department & { lead: Employee };

export function DepartmentList({
  initialDepartments,
  allEmployees,
}: {
  initialDepartments: DepartmentWithLead[];
  allEmployees: Employee[];
}) {
  const [departments, setDepartments] = React.useState(initialDepartments);
  const [selectedLead, setSelectedLead] = React.useState<string | undefined>();
  const [departmentName, setDepartmentName] = React.useState<string>("");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();
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


  const handleEdit = (dept: Department) => {
    setDepartmentName(dept.name);
    setSelectedLead(undefined);
  };

  const handleSaveChanges = async (departmentId: string) => {
    setIsUpdating(true);
    const originalDept = departments.find(d => d.id === departmentId);
    if (!originalDept) return;

    const newLead = allEmployees.find(e => e.id === selectedLead);

    const updates: Partial<Department> = {};
    if (departmentName && departmentName !== originalDept.name) {
      updates.name = departmentName;
    }
    if (selectedLead && selectedLead !== originalDept.leadId) {
      updates.leadId = selectedLead;
    }
    
    if (Object.keys(updates).length === 0) {
      setIsUpdating(false);
      return;
    }

    try {
        const departmentRef = doc(db, 'departments', departmentId);
        await updateDoc(departmentRef, updates);

        setDepartments(prevDepartments => 
          prevDepartments.map(dept => {
            if (dept.id === departmentId) {
                return {
                    ...dept,
                    name: updates.name || dept.name,
                    lead: newLead || dept.lead,
                }
            }
            return dept;
          })
        );

        toast({
            title: "Department Updated",
            description: `The ${originalDept.name} department has been updated.`,
        });
        router.refresh();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update the department.",
        });
    } finally {
        setIsUpdating(false);
    }
  };

  const handleDelete = async (departmentId: string) => {
    setIsUpdating(true);
    try {
      await deleteDepartment(departmentId);
      setDepartments(prev => prev.filter(d => d.id !== departmentId));
      toast({
        title: "Department Deleted",
        description: "The department has been successfully deleted.",
      });
      router.refresh();
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


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {departments.map((dept) => (
        <Card key={dept.id}>
          <CardHeader className="flex flex-row items-center gap-4">
             <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-background"
                style={{ backgroundColor: generateColor(dept.name) }}
            >
                {getInitials(dept.name)}
            </div>
            <CardTitle>{dept.name}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            {dept.lead ? (
                <p className="font-semibold">{dept.lead.name}</p>
            ) : (
                <p className="text-muted-foreground">No lead assigned.</p>
            )}
          </CardContent>
          {canManageDepartments && (
            <CardFooter className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full" onClick={() => handleEdit(dept)}>Edit</Button>
                </DialogTrigger>
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
                        <Select onValueChange={setSelectedLead} defaultValue={dept.leadId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a new lead" />
                          </SelectTrigger>
                          <SelectContent>
                            {allEmployees
                              .filter((e) => e.departmentId === dept.id)
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
                      <DialogClose asChild>
                          <Button onClick={() => handleSaveChanges(dept.id)} disabled={isUpdating}>
                              {isUpdating ? "Saving..." : "Save Changes"}
                          </Button>
                      </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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
  );
}
