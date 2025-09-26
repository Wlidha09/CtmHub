
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
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };

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

function ManageLeavePage() {
  const [requests, setRequests] = React.useState<FormattedLeaveRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const { currentRole } = useCurrentRole();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].manage_leave_page;

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
        description: t.toast_fetch_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  React.useEffect(() => {
    if (!canManage) {
        // The withPermission HOC will handle redirection, 
        // but we can keep this as a secondary check.
        // router.push('/dashboard'); 
        return;
    }
    fetchRequests();
  }, [fetchRequests, canManage, router]);

  const handleStatusUpdate = async (id: string, status: LeaveRequest['status']) => {
    const result = await updateLeaveRequestStatus(id, status);
    if (result.success) {
        toast({ title: 'Success', description: t.toast_update_success.replace('{status}', status) });
        fetchRequests(); // Refresh data
    } else {
        toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
  }


  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" | "success" | "warning" => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "secondary";
      case "Pending RH Approval":
        return "warning";
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
  
  const getStatusStyle = (status: string) => {
    if (status === 'Pending') {
      return { backgroundColor: '#FF7F50', color: 'white' };
    }
    return {};
  };

  const renderTable = (status: LeaveRequest["status"]) => {
    const filteredRequests = requests.filter((req) => req.status === status);

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.table_header_employee}</TableHead>
            <TableHead>{t.table_header_department}</TableHead>
            <TableHead>{t.table_header_type}</TableHead>
            <TableHead>{t.table_header_dates}</TableHead>
            <TableHead className="text-right">{t.table_header_actions}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                {t.loading}
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
                     <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'Pending RH Approval')}>{t.approve}</Button>
                  )}
                  {status === "Pending RH Approval" && (
                    <div className="flex gap-2 justify-end">
                      <Button size="sm" onClick={() => handleStatusUpdate(request.id, 'Approved')}>{t.approve}</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(request.id, 'Rejected')}>{t.reject}</Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                {t.no_requests}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    );
  };
  
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
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="Pending">
            <CardHeader>
                <TabsList>
                {STATUSES.map((status) => (
                    <TabsTrigger key={status} value={status}>
                        {status}
                         <Badge 
                            variant={getStatusVariant(status)}
                            style={getStatusStyle(status)}
                            className="ml-2"
                        >
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

export default withPermission(ManageLeavePage, "Manage Leave");
