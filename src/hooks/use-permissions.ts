"use client";

import * as React from "react";
import { useCurrentRole } from "./use-current-role";
import { getRole } from "@/lib/firebase/roles";
import type { Permission } from "@/lib/types";

export function usePermissions(pageName?: string) {
    const { currentRole } = useCurrentRole();
    const [permissions, setPermissions] = React.useState<Permission | null>(null);
    const [allPagePermissions, setAllPagePermissions] = React.useState<Record<string, Permission> | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        async function fetchPermissions() {
            if (!currentRole) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            try {
                const roleData = await getRole(currentRole);
                if (roleData) {
                    setAllPagePermissions(roleData.permissions as Record<string, Permission>);
                    if (pageName && roleData.permissions[pageName]) {
                        setPermissions(roleData.permissions[pageName]);
                    } else {
                        setPermissions(null); // No specific permissions for this page
                    }
                }
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
                setPermissions(null);
                setAllPagePermissions(null);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPermissions();
    }, [currentRole, pageName]);
    
    // If no pageName is provided, return all permissions for the role
    if (!pageName) {
        return { permissions: allPagePermissions, isLoading };
    }

    // Otherwise, return permissions for the specific page
    return { permissions, isLoading };
}