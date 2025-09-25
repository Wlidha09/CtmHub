

"use client";

import * as React from "react";
import type { Role, PagePermissions, Permission } from "@/lib/types";
import { initialRoles, appPages } from "@/lib/data";
import { useCurrentRole } from "@/hooks/use-current-role";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getRoles, addRole as addRoleFB, updateRole, deleteRole as deleteRoleFB } from "@/lib/firebase/roles";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { withPermission } from "@/components/with-permission";

const translations = { en, fr };


// Component for the permissions table
function PermissionsTable({
  roles,
  handlePermissionChange,
  canManage,
}: {
  roles: Role[];
  handlePermissionChange: (
    roleName: string,
    page: string,
    permission: keyof Permission,
    checked: boolean
  ) => void;
  canManage: boolean;
}) {
  const { language } = useLanguage();
  const t = translations[language].roles_page;
  const permissionsKeys: (keyof Permission)[] = ["view", "create", "edit", "delete"];
  
  return (
    <div className="overflow-x-auto">
        <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
            <TableRow>
            <TableHead className="w-1/4 px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t.page}
            </TableHead>
            {roles.map((role) => (
                <TableHead
                key={role.name}
                className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                {role.name}
                </TableHead>
            ))}
            </TableRow>
        </TableHeader>
        <TableBody className="bg-white divide-y divide-gray-200">
            {appPages.map((page) => (
            <TableRow key={page}>
                <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {page}
                </TableCell>
                {roles.map((role) => (
                <TableCell
                    key={`${role.name}-${page}`}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                >
                    <div className="flex justify-center space-x-4">
                    {permissionsKeys.map((p) => {
                      const isChecked = role.permissions?.[page]?.[p] || false;
                      return (
                        <div key={p} className="flex items-center space-x-1">
                            <Checkbox
                            id={`${role.name}-${page}-${p}`}
                            checked={isChecked}
                            onCheckedChange={(checked) =>
                                handlePermissionChange(
                                role.name,
                                page,
                                p,
                                !!checked
                                )
                            }
                            disabled={!canManage || (role.isCore && role.name === 'Dev')}
                            />
                            <label
                            htmlFor={`${role.name}-${page}-${p}`}
                            className="text-xs text-muted-foreground uppercase"
                            >
                            {t[`permission_${p.charAt(0)}` as keyof typeof t]}
                            </label>
                        </div>
                      )
                    })}
                    </div>
                </TableCell>
                ))}
            </TableRow>
            ))}
        </TableBody>
        </Table>
    </div>
  );
}

// Component for adding/deleting roles
function RoleManager({
    roles,
    addRole,
    deleteRole,
    canManage,
  }: {
    roles: Role[];
    addRole: (roleName: string) => void;
    deleteRole: (roleName: string) => void;
    canManage: boolean;
  }) {
    const [newRoleName, setNewRoleName] = React.useState("");
    const { language } = useLanguage();
    const t = translations[language].roles_page;
  
    const handleAddRole = () => {
      if (newRoleName.trim() && canManage) {
        addRole(newRoleName.trim());
        setNewRoleName("");
      }
    };
  
    return (
      <Card>
        <CardHeader>
            <CardTitle>{t.role_management}</CardTitle>
            <CardDescription>{t.role_management_desc}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col gap-4">
                 {canManage && (
                    <div className="flex gap-2">
                        <Input
                        placeholder={t.new_role_placeholder}
                        value={newRoleName}
                        onChange={(e) => setNewRoleName(e.target.value)}
                        />
                        <Button onClick={handleAddRole}>
                        <PlusCircle className="mr-2 h-4 w-4" /> {t.add_role}
                        </Button>
                    </div>
                )}
                <div className="space-y-2">
                    <h4 className="font-medium">{t.existing_roles}</h4>
                    <ul className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {roles.map((role) => (
                        <li key={role.name} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                        <span>{role.name} {role.isCore && <span className="text-xs text-muted-foreground">({t.core_role})</span>}</span>
                        {!role.isCore && canManage && (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>{t.confirm_delete_title}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {t.confirm_delete_description.replace('{roleName}', role.name)}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => deleteRole(role.name)}>{t.delete}</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        </li>
                    ))}
                    </ul>
                </div>
            </div>
        </CardContent>
      </Card>
    );
}

// Main page component
function RolesPage() {
  const [roles, setRoles] = React.useState<Role[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { currentRole } = useCurrentRole();
  const { toast } = useToast();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].roles_page;

  const canManage = currentRole === "Dev" || currentRole === "Owner";

  const fetchRoles = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedRoles = await getRoles();
      if (fetchedRoles.length > 0) {
        setRoles(fetchedRoles);
      } else {
        // If no roles in DB, seed with initial roles
        await Promise.all(initialRoles.map(role => addRoleFB(role)));
        setRoles(initialRoles);
      }
    } catch (error) {
      console.error("Failed to load roles from Firestore", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: t.toast_load_error,
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, t]);

  React.useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handlePermissionChange = async (
    roleName: string,
    page: string,
    permission: keyof Permission,
    checked: boolean
  ) => {
    const originalRoles = [...roles];
    let updatedRoles = roles.map((role) => {
      if (role.name === roleName) {
        const newPermissions = { ...(role.permissions || {}) };
        
        if (!newPermissions[page]) {
          newPermissions[page] = { view: false, create: false, edit: false, delete: false };
        }

        const pagePermission = { ...newPermissions[page] };
        pagePermission[permission] = checked;

        if (permission === 'view' && !checked) {
            pagePermission.create = false;
            pagePermission.edit = false;
            pagePermission.delete = false;
        }
        if (permission !== 'view' && checked) {
            pagePermission.view = true;
        }

        newPermissions[page] = pagePermission;
        return { ...role, permissions: newPermissions };
      }
      return role;
    });

    setRoles(updatedRoles); // Optimistic update

    try {
      const roleToUpdate = updatedRoles.find(r => r.name === roleName);
      if (roleToUpdate) {
        await updateRole(roleName, { permissions: roleToUpdate.permissions });
      }
    } catch (error) {
        console.error("Failed to save role changes to Firestore", error);
        setRoles(originalRoles); // Revert on error
        toast({
            variant: "destructive",
            title: "Error",
            description: t.toast_save_error,
        });
    }
  };

  const addRole = async (roleName: string) => {
    if (roles.some(r => r.name.toLowerCase() === roleName.toLowerCase())) {
        toast({ variant: "destructive", title: "Error", description: t.toast_role_exists });
        return;
    }
    const newRole: Role = {
        name: roleName,
        isCore: false,
        permissions: appPages.reduce((acc, page) => {
            acc[page] = { view: false, create: false, edit: false, delete: false };
            return acc;
        }, {} as PagePermissions)
    };

    try {
        await addRoleFB(newRole);
        setRoles([...roles, newRole]);
        toast({ title: "Success", description: t.toast_create_success.replace('{roleName}', roleName) });
    } catch (error) {
        toast({ variant: "destructive", title: "Error", description: t.toast_create_error });
    }
  };

  const deleteRole = async (roleName: string) => {
    const roleToDelete = roles.find(r => r.name === roleName);
    if (!roleToDelete || roleToDelete.isCore) {
        toast({ variant: "destructive", title: "Error", description: t.toast_delete_core_error });
        return;
    }
    
    const originalRoles = [...roles];
    setRoles(roles.filter(r => r.name !== roleName)); // Optimistic delete

    try {
        await deleteRoleFB(roleName);
        toast({ title: "Success", description: t.toast_delete_success.replace('{roleName}', roleName) });
    } catch (error) {
        setRoles(originalRoles); // Revert on error
        toast({ variant: "destructive", title: "Error", description: t.toast_delete_error.replace('{roleName}', roleName) });
    }
  }

  const displayedRoles = React.useMemo(() => {
    if (currentRole === 'Dev') {
        return roles;
    }
    return roles.filter(role => role.name !== 'Dev');
  }, [roles, currentRole]);


  if (isLoading) {
    return <div>{t.loading}</div>;
  }

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
      
      <RoleManager roles={displayedRoles} addRole={addRole} deleteRole={deleteRole} canManage={canManage} />

      <Card>
        <CardHeader>
            <CardTitle>{t.permissions_matrix}</CardTitle>
            <CardDescription>{t.permissions_matrix_desc}</CardDescription>
        </CardHeader>
        <CardContent>
            <PermissionsTable
                roles={displayedRoles}
                handlePermissionChange={handlePermissionChange}
                canManage={canManage}
            />
        </CardContent>
      </Card>
    </div>
  );
}

export default withPermission(RolesPage, "Roles");
