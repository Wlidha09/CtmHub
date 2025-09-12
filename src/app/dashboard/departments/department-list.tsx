"use client";

import * as React from "react";
import type { Department, Employee } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";

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
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return parts[0].substring(0, 2);
  };
  
  const handleLeadChange = async (departmentId: string) => {
    if (!selectedLead) return;
    setIsUpdating(true);

    const newLead = allEmployees.find(e => e.id === selectedLead);
    if (!newLead) {
        setIsUpdating(false);
        return;
    }

    try {
        const departmentRef = doc(db, 'departments', departmentId);
        await updateDoc(departmentRef, {
            leadId: selectedLead,
        });

        // Optimistically update UI
        setDepartments(prevDepartments => 
          prevDepartments.map(dept => 
            dept.id === departmentId ? { ...dept, lead: newLead } : dept
          )
        );

        toast({
            title: "Lead Changed",
            description: `${newLead.name} is now the lead of the ${departments.find(d => d.id === departmentId)?.name} department.`,
        });
        setSelectedLead(undefined);
        router.refresh();
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to update the department lead.",
        });
    } finally {
        setIsUpdating(false);
    }
  };


  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {departments.map((dept) => (
        <Card key={dept.id}>
          <CardHeader>
            <CardTitle>{dept.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {dept.lead ? (
                <>
                <Avatar>
                    <AvatarImage src={dept.lead.avatarUrl} alt={dept.lead.name} data-ai-hint="person portrait"/>
                    <AvatarFallback>{getInitials(dept.lead.name)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{dept.lead.name}</p>
                    <p className="text-sm text-muted-foreground">Team Lead</p>
                </div>
                </>
            ) : (
                <p className="text-sm text-muted-foreground">No lead assigned.</p>
            )}
          </CardContent>
          <CardFooter>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">Change Lead</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Lead for {dept.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Select onValueChange={setSelectedLead}>
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
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button onClick={() => handleLeadChange(dept.id)} disabled={!selectedLead || isUpdating}>
                            {isUpdating ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
