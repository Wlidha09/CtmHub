import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { roles as rolesData } from "@/lib/data";
import { CheckCircle2, XCircle } from "lucide-react";
import type { Role } from "@/lib/types";

export default async function RolesPage() {
  const roles: Role[] = rolesData;

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
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Roles & Permissions
        </h1>
        <p className="text-muted-foreground">
          Review the access levels for each role in the organization.
        </p>
      </header>
      <Accordion type="single" collapsible className="w-full">
        {roles.filter(role => role && role.name !== 'Dev').map((role) => (
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
              <ul className="space-y-2 pl-4">
                {role.permissions.map((permission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 text-green-500 flex-shrink-0" />
                    <span>{permission}</span>
                  </li>
                ))}
                 {role.name === 'Owner' && (
                  <li className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                    <span>Submit leaves page</span>
                  </li>
                 )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
