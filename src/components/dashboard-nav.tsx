
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
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
  CalendarClock,
  BookMarked,
  Settings,
  User,
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
  { href: "/dashboard/employees", label: "Employees", icon: Users, roles: ['Dev', 'Owner', 'RH'] },
  { href: "/dashboard/my-profile", label: "My Profile", icon: User, roles: ['Manager', 'Employee'] },
  { href: "/dashboard/departments", label: "Departments", icon: Building },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck, roles: ['Dev', 'Owner'] },
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
  },
  {
    href: "/dashboard/book-room",
    label: "Book a Room",
    icon: BookMarked,
  },
  {
    href: "/dashboard/manage-rooms",
    label: "Manage Rooms",
    icon: Settings,
    roles: ['Owner', 'RH', 'Manager', 'Dev'],
  },
  {
    href: "/dashboard/availability",
    label: "Availability",
    icon: CalendarClock,
  },
   {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
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
        return item.href !== '/dashboard/submit-leave' && item.href !== '/dashboard/my-profile';
    }
    return item.roles.includes(currentRole);
  }).sort((a, b) => {
    // Custom sort to move Availability to the end
    if (a.href === '/dashboard/availability') return 1;
    if (b.href === '/dashboard/availability') return -1;
    return 0;
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
