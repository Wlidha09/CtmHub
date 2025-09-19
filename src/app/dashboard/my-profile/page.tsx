
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
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { useAuth } from "@/hooks/use-auth";

const translations = { en, fr };

export default function MyProfilePage() {
  const { user: authUser } = useAuth();
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [departmentName, setDepartmentName] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language].my_profile_page;

  const fetchData = React.useCallback(async () => {
    if (!authUser) return;
    setIsLoading(true);
    try {
      // In a real app, you would have a mapping from auth user uid to employee id.
      // For this demo, we'll find the user by email.
      const allEmployees = await getEmployee(authUser.uid); // This needs to be adjusted based on actual employee fetching logic
      
      const user = allEmployees; // Assuming getEmployee is modified to find by auth uid or a similar unique identifier

      if (user) {
        const [departmentList] = await Promise.all([
          getDepartments(),
        ]);

        setCurrentUser(user);
        const userDept = departmentList.find(d => d.id === user.departmentId);
        setDepartmentName(userDept?.name || "Unknown");
        setDepartments(departmentList);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_load_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [authUser, toast, t]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (employeeData: Partial<Employee>) => {
    if (!currentUser) return;
    try {
      // Prevent role and department changes from this form for non-admins
      const dataToSave = { ...employeeData };
      delete dataToSave.role;
      delete dataToSave.departmentId;
      delete dataToSave.status;
      delete dataToSave.leaveBalance;
      delete dataToSave.startDate;

      await updateEmployee(currentUser.id, dataToSave);
      toast({ title: "Success", description: t.toast_save_success });
      setIsEditing(false);
      fetchData(); // Refresh data
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_save_error,
      });
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return name.substring(0, 2);
  };


  if (isLoading) {
    return <div>{t.loading}</div>;
  }

  if (!currentUser) {
    return <div>{t.load_error || "Could not load user profile."}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {t.title}
        </h1>
        <p className="text-muted-foreground">
          {t.description}
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
                {t.edit_profile}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm mt-4">
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.email}</p>
                <p>{currentUser.email}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.phone}</p>
                <p>{currentUser.phoneNumber || t.not_provided}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.start_date}</p>
                <p>{format(new Date(currentUser.startDate), "MMMM d, yyyy")}</p>
              </div>
               <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.birth_date}</p>
                <p>{currentUser.birthDate ? format(new Date(currentUser.birthDate), "MMMM d, yyyy") : t.not_provided}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.status}</p>
                <p className="capitalize">{currentUser.status}</p>
              </div>
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground">{t.leave_balance}</p>
                <p>{currentUser.leaveBalance ?? 0} {t.days}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

