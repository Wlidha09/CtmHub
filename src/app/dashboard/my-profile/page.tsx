
"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";
import { getEmployee, updateEmployee } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import type { Employee, Department } from "@/lib/types";
import { EmployeeForm } from "../employees/employee-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { format } from "date-fns";

// In a real app, this would come from the authenticated user
const FAKE_CURRENT_USER_ID = "e2";

export default function MyProfilePage() {
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [departmentName, setDepartmentName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [user, departmentList] = await Promise.all([
        getEmployee(FAKE_CURRENT_USER_ID),
        getDepartments(),
      ]);

      if (user) {
        setCurrentUser(user);
        const userDept = departmentList.find(d => d.id === user.departmentId);
        setDepartmentName(userDept?.name || "Unknown");
      }
      setDepartments(departmentList);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load your profile data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (employeeData: Partial<Employee>) => {
    if (!currentUser) return;
    try {
      // Prevent role and department changes from this form
      const dataToSave = { ...employeeData };
      delete dataToSave.role;
      delete dataToSave.departmentId;

      await updateEmployee(currentUser.id, dataToSave);
      toast({ title: "Success", description: "Your profile has been updated." });
      setIsEditing(false);
      fetchData(); // Refresh data
    } catch (error)      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save profile information.",
      });
    }
  };
  
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };


  if (isLoading) {
    return <div>Loading your profile...</div>;
  }

  if (!currentUser) {
    return <div>Could not load your profile.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          My Profile
        </h1>
        <p className="text-muted-foreground">
          View and manage your personal information.
        </p>
      </header>

      {isEditing ? (
        <EmployeeForm 
            isOpen={isEditing}
            onClose={() => setIsEditing(false)}
            onSave={handleSave}
            employee={currentUser}
            departments={departments}
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} data-ai-hint="person portrait"/>
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl">{currentUser.name}</CardTitle>
                <CardDescription>{currentUser.role} &middot; {departmentName}</CardDescription>
              </div>
            </div>
             <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit className="mr-2 h-4 w-4"/>
                Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Email</p>
                <p>{currentUser.email}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Phone Number</p>
                <p>{currentUser.phoneNumber || "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Start Date</p>
                <p>{format(new Date(currentUser.startDate), "MMMM d, yyyy")}</p>
              </div>
               <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Birth Date</p>
                <p>{currentUser.birthDate ? format(new Date(currentUser.birthDate), "MMMM d, yyyy") : "Not provided"}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Status</p>
                <p className="capitalize">{currentUser.status}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">Leave Balance</p>
                <p>{currentUser.leaveBalance ?? 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
