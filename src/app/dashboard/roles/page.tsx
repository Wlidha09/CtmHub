"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRoles, updateRolePermissions } from "@/lib/firebase/roles";
import { useCurrentRole } from "@/hooks/use-current-role";
import { CheckCircle2, XCircle, Trash2, PlusCircle } from "lucide-react";
import type { Role } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [newPermission, setNewPermission] = React.useState<{ [key: string]: string }>({});
  const { currentRole } = useCurrentRole();
  const { toast } = useToast();
  const isDev = currentRole === 'Dev';

  React.useEffect(() => {
    async function fetchRoles() {
      setIsLoading(true);
      try {
        const rolesData = await getRoles();
        setRoles(rolesData.sort((a, b) => a.name.localeCompare(b.name)));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch roles.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoles();
  }, [toast]);

  const handlePermissionChange = (roleName: string, value: string) => {
    setNewPermission(prev => ({ ...prev, [roleName]: value }));
  };

  const handleAddPermission = async (roleName: string) => {
    const permissionToAdd = newPermission[roleName]?.trim();
    if (!permissionToAdd) return;

    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const updatedPermissions = [...role.permissions, permissionToAdd];

    try {
      await updateRolePermissions(roleName, updatedPermissions);
      setRoles(prevRoles =>
        prevRoles.map(r =>
          r.name === roleName ? { ...r, permissions: updatedPermissions } : r
        )
      );
      setNewPermission(prev => ({ ...prev, [roleName]: '' }));
      toast({
        title: "Success",
        description: `Permission added to ${roleName}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add permission.",
      });
    }
  };

  const handleDeletePermission = async (roleName: string, permissionToDelete: string) => {
    const role = roles.find(r => r.name === roleName);
    if (!role) return;

    const updatedPermissions = role.permissions.filter(p => p !== permissionToDelete);

    try {
      await updateRolePermissions(roleName, updatedPermissions);
      setRoles(prevRoles =>
        prevRoles.map(r =>
          r.name === roleName ? { ...r, permissions: updatedPermissions } : r
        )
      );
      toast({
        title: "Success",
        description: `Permission removed from ${roleName}.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove permission.",
      });
    }
  };

  const getBadgeVariant = (roleName: string) => {
    switch (roleName) {
      case 'Dev':
        return 'destructive';
      case 'Owner':
        return 'destructive';
      case 'RH':
        return 'secondary';
      case 'Manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Roles & Permissions
        </h1>
        <p className="text-muted-foreground">
          Review and manage access levels for each role in the organization.
        </p>
      </header>
      <Accordion type="single" collapsible className="w-full">
        {roles.filter(role => role && role.name).map((role) => (
          <AccordionItem key={role.name} value={role.name}>
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{role.name}</span>
                <Badge variant={getBadgeVariant(role.name)}>
                    {role.name}
                </Badge>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <ul className="space-y-2 pl-4">
                  {role.permissions.map((permission, index) => (
                    <li key={index} className="flex items-center justify-between gap-3 group">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>{permission}</span>
                      </div>
                      {isDev && role.name !== 'Dev' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-8 h-8 opacity-0 group-hover:opacity-100"
                          onClick={() => handleDeletePermission(role.name, permission)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </li>
                  ))}
                  {role.name === 'Owner' && (
                    <li className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                      <span>Submit leaves page</span>
                    </li>
                  )}
                </ul>

                {isDev && role.name !== 'Dev' && (
                  <div className="pl-4 pt-4 border-t">
                     <div className="flex gap-2">
                        <Input 
                            placeholder="Add new permission"
                            value={newPermission[role.name] || ''}
                            onChange={(e) => handlePermissionChange(role.name, e.target.value)}
                        />
                        <Button onClick={() => handleAddPermission(role.name)}>
                            <PlusCircle className="w-4 h-4 mr-2"/>
                            Add
                        </Button>
                     </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
