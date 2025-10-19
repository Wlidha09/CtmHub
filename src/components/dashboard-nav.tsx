
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
  Languages,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { usePermissions } from "@/hooks/use-permissions";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";
import { appPages } from "@/lib/data";

const translations = { en, fr };

type NavItem = {
  href: string;
  labelKey: keyof typeof translations.en.navigation;
  icon: LucideIcon;
  pageName: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard, pageName: "Dashboard" },
  { href: "/dashboard/employees", labelKey: "employees", icon: Users, pageName: "Employees" },
  { href: "/dashboard/my-profile", labelKey: "my_profile", icon: User, pageName: "My Profile" },
  { href: "/dashboard/departments", labelKey: "departments", icon: Building, pageName: "Departments" },
  { href: "/dashboard/roles", labelKey: "roles", icon: ShieldCheck, pageName: "Roles" },
  { href: "/dashboard/submit-leave", labelKey: "leave_request", icon: FileText, pageName: "Leave Request" },
  { href: "/dashboard/manage-leave", labelKey: "manage_leave", icon: ShieldAlert, pageName: "Manage Leave" },
  { href: "/dashboard/holidays", labelKey: "holidays", icon: CalendarCheck, pageName: "Holidays" },
  { href: "/dashboard/candidates", labelKey: "candidates", icon: Briefcase, pageName: "Candidates" },
  { href: "/dashboard/tickets", labelKey: "tickets", icon: Ticket, pageName: "Tickets" },
  { href: "/dashboard/book-room", labelKey: "book_a_room", icon: BookMarked, pageName: "Book a Room" },
  { href: "/dashboard/manage-rooms", labelKey: "manage_rooms", icon: Settings, pageName: "Manage Rooms" },
  { href: "/dashboard/availability", labelKey: "availability", icon: CalendarClock, pageName: "Availability" },
  { href: "/dashboard/user-settings", labelKey: "settings", icon: Settings, pageName: "Settings" },
  { href: "/dashboard/translator", labelKey: "translator", icon: Languages, pageName: "Translator" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { language } = useLanguage();
  const { permissions: allPermissions, isLoading } = usePermissions();
  const t = translations[language].navigation;

  if (isLoading) {
    return (
      <SidebarMenu>
        {Array.from({ length: 8 }).map((_, i) => (
          <SidebarMenuItem key={i} className="px-2">
            <div className="w-full h-8 bg-sidebar-accent/50 rounded-md animate-pulse" />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    );
  }

  const filteredNavItems = navItems.filter(item => {
    const pagePermission = allPermissions?.[item.pageName];
    return pagePermission?.view;
  });

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
            <SidebarMenuButton
              isActive={pathname === item.href}
              tooltip={t[item.labelKey]}
            >
              <div className="flex items-center gap-2">
                <item.icon />
                <span>{t[item.labelKey]}</span>
              </div>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
