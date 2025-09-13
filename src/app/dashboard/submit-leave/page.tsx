"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NewLeaveRequestForm } from "./new-leave-request-form";

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

export default function LeaveRequestPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Approved":
        return "default";
      case "Pending":
        return "secondary";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Leave Requests
          </h1>
          <p className="text-muted-foreground">
            View your leave requests and submit new ones.
          </p>
        </header>
        <NewLeaveRequestForm />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Leave Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.leaveType}</TableCell>
                  <TableCell>{request.startDate}</TableCell>
                  <TableCell>{request.endDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
