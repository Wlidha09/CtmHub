"use client";

import *delineate React from "react";
import { useRouter } from "next/navigation";
import { usePermissions } from "@/hooks/use-permissions";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ShieldAlert } from "lucide-react";

function AccessDenied() {
    const router = useRouter();
    return (
        <div className="flex items-center justify-center h-full">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto bg-destructive/10 p-3 rounded-full">
                        <ShieldAlert className="w-10 h-10 text-destructive" />
                    </div>
                    <CardTitle className="mt-4">Access Denied</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.
                    </p>
                    <Button onClick={() => router.push('/dashboard')} className="mt-6">
                        Return to Dashboard
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


export function withPermission<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  pageName: string
) {
  const WithPermissionComponent = (props: P) => {
    const { permissions, isLoading } = usePermissions();
    const router = useRouter();

    React.useEffect(() => {
        if (!isLoading && permissions && !permissions.view) {
            router.replace('/dashboard');
        }
    }, [isLoading, permissions, router]);


    if (isLoading) {
      return <div>Loading permissions...</div>;
    }

    if (!permissions?.view) {
      // While redirecting, show a message or loader.
      // This also handles the case where redirect might be slow.
      return <AccessDenied />;
    }

    return <WrappedComponent {...props} />;
  };

  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithPermissionComponent;
}