
"use client";

import {
  Users,
  Building,
  ShieldCheck,
  FileClock,
  FileText,
  Plane,
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
import { Badge } from "@/components/ui/badge";
import { getEmployees } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { getLeaveRequests } from "@/lib/firebase/leave-requests";
import type { LeaveRequest } from "@/lib/types";
import { differenceInDays, parseISO } from "date-fns";

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
  const [totalEmployees, setTotalEmployees] = React.useState(0);
  const [totalDepartments, setTotalDepartments] = React.useState(0);
  const [leaveRequests, setLeaveRequests] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [employees, departments, requests] = await Promise.all([
          getEmployees(),
          getDepartments(),
          getLeaveRequests(), // Assuming this fetches all for admin roles
        ]);
        setTotalEmployees(employees.length);
        setTotalDepartments(departments.length);
        setLeaveRequests(requests);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

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
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome to LoopHub! Here's a quick overview of your organization.
          </p>
        </div>
        <SeedButton />
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentRole === "Employee" ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Leave Requests</span>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p>Loading requests...</p>
              ) : (
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
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {currentRole === "RH" && (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">
                      Total Employees
                    </CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalEmployees}</div>}
                    <p className="text-xs text-muted-foreground">
                      Currently active members in the organization.
                    </p>
                  </CardContent>
                </Card>
            )}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Departments
                </CardTitle>
                <Building className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalDepartments}</div>}
                <p className="text-xs text-muted-foreground">
                  Number of departments across the company.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Defined Roles
                </CardTitle>
                <ShieldCheck className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalRoles}</div>
                <p className="text-xs text-muted-foreground">
                  User roles with specific permissions.
                </p>
              </CardContent>
            </Card>
             <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Pending Requests
                </CardTitle>
                <FileClock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{pendingRequestsCount}</div>}
                <p className="text-xs text-muted-foreground">
                  Leave requests awaiting approval.
                </p>
              </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium">Total Leave Days</CardTitle>
                    <Plane className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {isLoading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalLeaveDaysCumulated}</div>}
                    <p className="text-xs text-muted-foreground">
                        Approved leave days for the current year.
                    </p>
                </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
