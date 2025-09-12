import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { roles } from "@/lib/data";
import { CheckCircle2 } from "lucide-react";

export default function RolesPage() {
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
        {roles.map((role) => (
          <AccordionItem key={role.name} value={role.name}>
            <AccordionTrigger>
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold">{role.name}</span>
                <Badge variant={role.name === 'Admin' ? 'destructive' : role.name === 'Manager' ? 'secondary' : 'outline'}>
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
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
