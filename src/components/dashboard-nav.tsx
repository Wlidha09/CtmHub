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
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", label: "Employees", icon: Users },
  { href: "/dashboard/departments", label: "Departments", icon: Building },
  { href: "/dashboard/roles", label: "Roles", icon: ShieldCheck },
  {
    href: "/dashboard/time-off-calculator",
    label: "Time Off Calculator",
    icon: Calculator,
  },
  {
    href: "/dashboard/submit-leave",
    label: "Leave Request",
    icon: FileText,
  },
  {
    href: "/dashboard/candidates",
    label: "Candidates",
    icon: Briefcase,
  }
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
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
