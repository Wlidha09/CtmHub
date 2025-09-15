
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
import { Search, Edit, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentRole } from "@/hooks/use-current-role";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type FormattedEmployee = Employee & { departmentName: string };

export function EmployeeTable({ 
  data,
  onEditEmployee,
  onToggleStatus,
  onBulkToggleStatus,
}: { 
  data: FormattedEmployee[],
  onEditEmployee: (employee: FormattedEmployee) => void,
  onToggleStatus: (employee: FormattedEmployee) => void,
  onBulkToggleStatus: (employeeIds: string[], status: 'active' | 'inactive') => void;
}) {
  const [search, setSearch] = React.useState("");
  const [showInactive, setShowInactive] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<string[]>([]);
  const { currentRole } = useCurrentRole();
  const canManageEmployees = currentRole === 'Dev' || currentRole === 'Owner' || currentRole === 'RH';

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
        (employee.phoneNumber && employee.phoneNumber.toLowerCase().includes(searchTerm)) ||
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
  
  React.useEffect(() => {
    setSelectedRows([]);
  }, [search, showInactive]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(filteredData.map(e => e.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedRows(prev => [...prev, id]);
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id));
    }
  };

  const isAllSelected = selectedRows.length > 0 && selectedRows.length === filteredData.length;

  return (
    <Card>
      <div className="p-4 border-b flex items-center justify-between gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search employees..."
            className="pl-8 w-full md:w-1/2 lg:w-1/3"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {canManageEmployees && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selectedRows.length} selected</span>
            <Button size="sm" onClick={() => onBulkToggleStatus(selectedRows, 'active')}>
              <UserCheck className="mr-2 h-4 w-4"/>
              Activate
            </Button>
             <Button size="sm" variant="destructive" onClick={() => onBulkToggleStatus(selectedRows, 'inactive')}>
              <UserX className="mr-2 h-4 w-4"/>
              Deactivate
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
          <Label htmlFor="show-inactive">Show Inactive</Label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {canManageEmployees && (
                <TableHead padding="checkbox" className="w-[48px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
              )}
              <TableHead>Employee</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="hidden md:table-cell">Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              {canManageEmployees && <TableHead className="text-right">Actions:</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((employee) => (
                <TableRow key={employee.id} data-state={selectedRows.includes(employee.id) && "selected"}>
                  {canManageEmployees && (
                     <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(employee.id)}
                        onCheckedChange={(checked) => handleRowSelect(employee.id, !!checked)}
                        aria-label="Select row"
                      />
                    </TableCell>
                  )}
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
                    <Badge variant={employee.role === 'Admin' ? 'destructive' : employee.role === 'Manager' ? 'secondary' : 'outline'}>
                        {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {employee.departmentName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                        <span>{employee.email}</span>
                        {employee.phoneNumber && <span className="text-muted-foreground text-xs md:hidden">{employee.phoneNumber}</span>}
                    </div>
                  </TableCell>
                   <TableCell>
                      <Badge 
                        variant={(employee.status || 'active') === 'active' ? 'default' : 'secondary'}
                        className="cursor-pointer"
                        onClick={() => onToggleStatus(employee)}
                      >
                        {(employee.status || 'active') === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                  </TableCell>
                  {canManageEmployees && (
                    <TableCell className="text-right space-x-2">
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
                <TableCell colSpan={canManageEmployees ? 7 : 5} className="text-center h-24">
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
