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
import type { LeaveRequest } from "@/lib/types";
import { getLeaveRequests } from "@/lib/firebase/leave-requests";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function LeaveRequestPage() {
  const [requests, setRequests] = React.useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchRequests = React.useCallback(async () => {
    setIsLoading(true);
    try {
      // Assuming we have a way to get current user ID, for now fetching all
      // In a real app, you'd pass a userId to getLeaveRequests
      const leaveRequests = await getLeaveRequests();
      setRequests(leaveRequests);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch leave requests.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

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
        <NewLeaveRequestForm onFormSubmit={fetchRequests} />
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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : requests.length > 0 ? (
                requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>{request.leaveType}</TableCell>
                    <TableCell>{format(new Date(request.startDate), "PPP")}</TableCell>
                    <TableCell>{format(new Date(request.endDate), "PPP")}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(request.status)}>
                        {request.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                  <TableCell colSpan={4} className="text-center">No leave requests found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
