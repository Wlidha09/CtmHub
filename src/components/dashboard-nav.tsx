
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Calculator,
  LayoutDashboard,
  Users,
  Building,
  ShieldCheck,
  LucideIcon,
  FileText,
  Briefcase,
  ShieldAlert,
  Ticket,
  CalendarCheck,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useCurrentRole } from "@/hooks/use-current-role";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: ('Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee')[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/departments", label: "Departments", icon: Building },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck, roles: ['Dev', 'Owner', 'RH'] },
  {
    href: "/dashboard/submit-leave",
    label: "Leave Request",
    icon: FileText,
    roles: ['Manager', 'Employee']
  },
   {
    href: "/dashboard/manage-leave",
    label: "Manage Leave",
    icon: ShieldAlert,
    roles: ['Owner', 'RH']
  },
  {
    href: "/dashboard/holidays",
    label: "Holidays",
    icon: CalendarCheck,
    roles: ['Owner', 'RH', 'Manager'],
  },
  {
    href: "/dashboard/candidates",
    label: "Candidates",
    icon: Briefcase,
    roles: ['Owner', 'RH', 'Manager']
  },
  {
    href: "/dashboard/tickets",
    label: "Tickets",
    icon: Ticket,
    roles: ['Owner', 'RH', 'Manager'],
  }
];

export function DashboardNav() {
  const pathname = usePathname();
  const { currentRole } = useCurrentRole();

  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) {
      return true; // if no roles are specified, show it to everyone
    }
    // For Dev role, show everything except 'Submit Leave'
    if (currentRole === 'Dev') {
        return item.href !== '/dashboard/submit-leave';
    }
    return item.roles.includes(currentRole);
  });

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={item.label}
            >
              <div className="flex items-center gap-2">
                <item.icon />
                <span>{item.label}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
