
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
import { useCurrentRole } from "@/hooks/use-current-role";
import { useLanguage } from "@/hooks/use-language";
import en from "@/locales/en.json";
import fr from "@/locales/fr.json";

const translations = { en, fr };

type NavItem = {
  href: string;
  labelKey: keyof typeof translations.en.navigation;
  icon: LucideIcon;
  roles?: ('Dev' | 'Owner' | 'RH' | 'Manager' | 'Employee')[];
};

const navItems: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/dashboard/employees", labelKey: "employees", icon: Users, roles: ['Dev', 'Owner', 'RH'] },
  { href: "/dashboard/my-profile", labelKey: "my_profile", icon: User, roles: ['Manager', 'Employee'] },
  { href: "/dashboard/departments", labelKey: "departments", icon: Building },
  { href: "/dashboard/roles", labelKey: "roles", icon: ShieldCheck, roles: ['Dev', 'Owner'] },
  {
    href: "/dashboard/submit-leave",
    labelKey: "leave_request",
    icon: FileText,
    roles: ['Manager', 'Employee']
  },
   {
    href: "/dashboard/manage-leave",
    labelKey: "manage_leave",
    icon: ShieldAlert,
    roles: ['Owner', 'RH']
  },
  {
    href: "/dashboard/holidays",
    labelKey: "holidays",
    icon: CalendarCheck,
    roles: ['Owner', 'RH', 'Manager'],
  },
  {
    href: "/dashboard/candidates",
    labelKey: "candidates",
    icon: Briefcase,
    roles: ['Owner', 'RH', 'Manager']
  },
  {
    href: "/dashboard/tickets",
    labelKey: "tickets",
    icon: Ticket,
    roles: ['Owner', 'RH', 'Manager'],
  },
  {
    href: "/dashboard/book-room",
    labelKey: "book_a_room",
    icon: BookMarked,
  },
  {
    href: "/dashboard/manage-rooms",
    labelKey: "manage_rooms",
    icon: Settings,
    roles: ['Owner', 'RH', 'Manager', 'Dev'],
  },
  {
    href: "/dashboard/availability",
    labelKey: "availability",
    icon: CalendarClock,
  },
  {
    href: "/dashboard/translator",
    labelKey: "translator",
    icon: Languages,
  },
   {
    href: "/dashboard/settings",
    labelKey: "settings",
    icon: Settings,
  },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { currentRole } = useCurrentRole();
  const { language } = useLanguage();
  const t = translations[language].navigation;

  const primaryNavItems = navItems.filter(item => item.href !== '/dashboard/settings');
  const settingsNavItem = navItems.find(item => item.href === '/dashboard/settings');

  const allFilteredNavItems = [
    ...primaryNavItems,
    ...(settingsNavItem ? [settingsNavItem] : []),
  ];

  const filteredNavItems = allFilteredNavItems.filter(item => {
    if (!item.roles) {
      return true; // if no roles are specified, show it to everyone
    }
    // For Dev role, show everything except 'Submit Leave'
    if (currentRole === 'Dev') {
        return item.href !== '/dashboard/submit-leave' && item.href !== '/dashboard/my-profile';
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
