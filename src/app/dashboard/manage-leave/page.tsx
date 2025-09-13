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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getLeaveRequests,
} from "@/lib/firebase/leave-requests";
import { getEmployees } from "@/lib/firebase/employees";
import { getDepartments } from "@/lib/firebase/departments";
import { useToast } from "@/hooks/use-toast";
import type { LeaveRequest, Employee, Department } from "@/lib/types";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { updateLeaveRequestStatus } from "@/lib/actions";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useRouter } from "next/navigation";

type FormattedLeaveRequest = LeaveRequest & {
  employeeName: string;
  departmentName: string;
};

const STATUSES: LeaveRequest["status"][] = [
  "Pending",
  "Pending RH Approval",
  "Approved",
  "Rejected",
  "Cancelled",
];

export default function ManageLeavePage() {
  const [requests, setRequests] = React.useState<FormattedLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
  const router = useRouter();

  const canManage = currentRole === 'Owner' || currentRole === 'RH';

  const fetchRequests = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const [leaveRequests, employees, departments] = await Promise.all([
        getLeaveRequests(),
        getEmployees(),
        getDepartments(),
      ]);

      const employeeMap = new Map(employees.map((e) => [e.id, e]));
      const departmentMap = new Map(departments.map((d) => [d.id, d.name]));

      const formattedRequests = leaveRequests.map((req) => {
        const employee = employeeMap.get(req.userId);
        return {
          ...req,
          employeeName: employee?.name || "Unknown",
          departmentName:
            departmentMap.get(employee?.departmentId || "") || "Unknown",
        };
      });

      setRequests(formattedRequests);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch data.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  React.useEffect(() => {
    if (!canManage) {
        router.push('/dashboard');
        return;
    }
    fetchRequests();
  }, [fetchRequests, canManage, router]);

  const handleStatusUpdate = async (id: string, status: LeaveRequest['status']) => {
    const result = await updateLeaveRequestStatus(id, status);
    if (result.success) {
        toast({ title: 'Success', description: result.message });
        fetchRequests(); // Refresh data
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }


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

  const renderTable = (status: LeaveRequest["status"]) => {
    const filteredRequests = requests.filter((req) => req.status === status);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Leave Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : filteredRequests.length > 0 ? (
            filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.employeeName}</TableCell>
                <TableCell>{request.departmentName}</TableCell>
                <TableCell>{request.leaveType}</TableCell>
                <TableCell>
                  {format(new Date(request.startDate), "PPP")} -{" "}
                  {format(new Date(request.endDate), "PPP")}
                </TableCell>
                <TableCell className="text-right">
                  {status === "Pending" && (
                     <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'Pending RH Approval')}>Approve</Button>
                  )}
                  {status === "Pending RH Approval" && (
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'Approved')}>Approve</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(request.id, 'Rejected')}>Reject</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No requests found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };
  
  if (!canManage) {
    return null; // or a loading/access denied component
  }


  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Manage Leave Requests
        </h1>
        <p className="text-muted-foreground">
          Approve or reject employee leave requests.
        </p>
      </header>
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="Pending">
            <CardHeader>
                <TabsList>
                {STATUSES.map((status) => (
                    <TabsTrigger key={status} value={status}>
                        {status}
                        <Badge variant={getStatusVariant(status)} className="ml-2">
                            {requests.filter(r => r.status === status).length}
                        </Badge>
                    </TabsTrigger>
                ))}
                </TabsList>
            </CardHeader>
            {STATUSES.map((status) => (
              <TabsContent key={status} value={status} className="m-0">
                {renderTable(status)}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
