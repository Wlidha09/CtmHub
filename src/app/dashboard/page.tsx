"use client";

import {
  Users,
  Building,
  ShieldCheck,
  FileClock,
  FileText,
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

// Mock data for leave requests
const leaveRequests = [
  {
    id: "LR001",
    leaveType: "Vacation",
    startDate: "2024-08-15",
    endDate: "2024-08-20",
    status: "Approved",
  },
  {
    id: "LR002",
    leaveType: "Sick Leave",
    startDate: "2024-09-01",
    endDate: "2024-09-01",
    status: "Pending",
  },
  {
    id: "LR003",
    leaveType: "Personal Day",
    startDate: "2024-09-10",
    endDate: "2024-09-10",
    status: "Rejected",
  },
];

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

const totalEmployees = 12;
const totalDepartments = 4;
const totalRoles = 5;

export default function DashboardPage() {
  const { currentRole } = useCurrentRole();

  const pendingRequests = leaveRequests.filter(
    (req) => req.status === "Pending"
  ).length;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {currentRole === "Employee" ? (
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Leave Requests</span>
                <FileText className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {leaveRequests.map((request) => (
                  <li
                    key={request.id}
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50"
                  >
                    <div>
                      <p className="font-semibold">{request.leaveType}</p>
                      <p className="text-sm text-muted-foreground">
                        {request.startDate} to {request.endDate}
                      </p>
                    </div>
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Total Employees
                </CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  Currently active members in the organization.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">
                  Departments
                </CardTitle>
                <Building className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDepartments}</div>
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
                <div className="text-2xl font-bold">{pendingRequests}</div>
                <p className="text-xs text-muted-foreground">
                  Leave requests awaiting approval.
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
