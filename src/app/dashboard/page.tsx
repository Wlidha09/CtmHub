
"use client";

import {
  Users,
  Building,
  ShieldCheck,
  FileClock,
  FileText,
  Plane,
  Coins,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SeedButton } from "./seed-button";
import * as React from "react";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useLanguage } from "@/hooks/use-language";
import { Badge } from "@/components/ui/badge";
import { getEmployees, getEmployee } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { getLeaveRequests } from "@/lib/firebase/leave-requests";
import type { Employee, LeaveRequest } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const translations = { en, fr };

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Approved":
      return "default";
    case "Pending":
      return "secondary";
    case "Pending RH Approval":
      return "secondary";
    case "Action Required":
      return "secondary";
    case "Rejected":
      return "destructive";
    case "Cancelled":
      return "outline";
    default:
      return "outline";
  }
};

const totalRoles = 5; // This is static based on our defined roles

export default function DashboardPage() {
  const { currentRole } = useCurrentRole();
  const { language } = useLanguage();
  const { user: authUser } = useAuth();
  const [totalEmployees, setTotalEmployees] = React.useState(0);
  const [totalDepartments, setTotalDepartments] = React.useState(0);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [currentUser, setCurrentUser] = React.useState<Employee | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const t = translations[language].dashboard;

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [employees, departments, allRequests] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getLeaveRequests(), // Fetch all requests initially
        ]);
        setTotalEmployees(employees.length);
        setTotalDepartments(departments.length);
        
        let userForRole: Employee | null = null;
        if (authUser?.email) {
            userForRole = employees.find(e => e.email === authUser.email) || null;
            setCurrentUser(userForRole);
        }

        if (userForRole) {
            const userRequests = allRequests.filter(r => r.userId === userForRole!.id);
            setLeaveRequests(userRequests);
        } else {
            setLeaveRequests(allRequests);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [authUser, currentRole]);

  const pendingRequestsCount = leaveRequests.filter(
    (req) => req.status === "Pending" || req.status === "Pending RH Approval"
  ).length;

  const totalLeaveDaysCumulated = leaveRequests.reduce((acc, req) => {
    if (req.status === 'Approved') {
        const startDate = parseISO(req.startDate);
        const endDate = parseISO(req.endDate);
        if (startDate && endDate) {
            return acc + differenceInDays(endDate, startDate) + 1;
        }
    }
    return acc;
  }, 0);


  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {t.title}
          </h1>
          <p className="text-muted-foreground">
            {t.description}
          </p>
        </div>
        <div className="flex gap-2">
            <SeedButton />
        </div>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentRole === "Employee" ? (
          <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">{t.employee.myLeaveBalance}</CardTitle>
                    <Coins className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{currentUser?.leaveBalance ?? 0} days</div>}
                    <p className="text-xs text-muted-foreground">
                        {t.employee.myLeaveBalanceDescription}
                    </p>
                </CardContent>
            </Card>
            <Card className="col-span-1 md:col-span-2 lg:col-span-3">
                <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{t.employee.myLeaveRequests}</span>
                    <FileText className="w-4 h-4 text-muted-foreground" />
                </CardTitle>
                </CardHeader>
                <CardContent>
                {isLoading ? (
                    <p>{t.loading}</p>
                ) : leaveRequests.length > 0 ? (
                    <ul className="space-y-2">
                    {leaveRequests.slice(0, 3).map((request) => ( // Show a few recent ones
                        <li
                        key={request.id}
                        className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                        >
                        <div>
                            <p className="font-semibold">{request.leaveType}</p>
                            <p className="text-sm text-muted-foreground">
                            {new Date(request.startDate).toLocaleDateString()} to {new Date(request.endDate).toLocaleDateString()}
                            </p>
                        </div>
                        <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                        </Badge>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <p>{t.employee.noLeaveRequests}</p>
                )}
                </CardContent>
            </Card>
          </>
        ) : (
          <>
            {(currentRole === "RH" || currentRole === 'Dev' || currentRole === 'Owner') && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      {t.manager.totalEmployees}
                    </CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalEmployees}</div>}
                    <p className="text-xs text-muted-foreground">
                      {t.manager.totalEmployeesDescription}
                    </p>
                  </CardContent>
                </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {t.manager.departments}
                </CardTitle>
                <Building className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalDepartments}</div>}
                <p className="text-xs text-muted-foreground">
                  {t.manager.departmentsDescription}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {t.manager.definedRoles}
                </CardTitle>
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRoles}</div>
                <p className="text-xs text-muted-foreground">
                  {t.manager.definedRolesDescription}
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  {t.manager.pendingRequests}
                </CardTitle>
                <FileClock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{pendingRequestsCount}</div>}
                <p className="text-xs text-muted-foreground">
                  {t.manager.pendingRequestsDescription}
                </p>
              </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">{t.manager.totalLeaveDays}</CardTitle>
                    <Plane className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalLeaveDaysCumulated}</div>}
                    <p className="text-xs text-muted-foreground">
                        {t.manager.totalLeaveDaysDescription}
                    </p>
                </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
