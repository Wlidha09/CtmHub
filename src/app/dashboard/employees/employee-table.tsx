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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Employee } from "@/lib/types";
import { Search, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type FormattedEmployee = Employee & { departmentName: string };

export function EmployeeTable({ 
  data,
  onEditEmployee,
}: { 
  data: FormattedEmployee[],
  onEditEmployee: (employee: FormattedEmployee) => void 
}) {
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Owner' || currentRole === 'RH';

  const filteredData = React.useMemo(() => {
    return data.filter((employee) => {
      const status = employee.status || 'active';
      const isVisible = showInactive ? true : status === 'active';

      if (!isVisible) {
        return false;
      }

      const searchTerm = search.toLowerCase();
      return (
        employee.name.toLowerCase().includes(searchTerm) ||
        employee.email.toLowerCase().includes(searchTerm) ||
        employee.role.toLowerCase().includes(searchTerm) ||
        employee.departmentName.toLowerCase().includes(searchTerm)
      );
    });
  }, [data, search, showInactive]);

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`;
    }
    return parts[0].substring(0, 2);
  };

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8 w-full md:w-1/2 lg:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive">Show Inactive</Label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead>Contact</TableHead>
              {canManageEmployees && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={employee.avatarUrl} alt={employee.name} data-ai-hint="person portrait"/>
                        <AvatarFallback>
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{employee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                     <Badge variant={(employee.status || 'active') === 'active' ? 'secondary' : 'outline'}>
                        {employee.status || 'active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={employee.role === 'Admin' ? 'destructive' : employee.role === 'Manager' ? 'secondary' : 'outline'}>
                        {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {employee.departmentName}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  {canManageEmployees && (
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onEditEmployee(employee)}>
                        <Edit className="w-4 h-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={canManageEmployees ? 6 : 5} className="text-center h-24">
                  No employees found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
