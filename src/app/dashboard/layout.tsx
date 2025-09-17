
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, User, Users, ChevronDown } from "lucide-react";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  SidebarCollapse,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { DashboardNav } from "@/components/dashboard-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RoleProvider, useCurrentRole } from "@/hooks/use-current-role";
import { getSettings } from "@/lib/firebase/settings";
import type { AppSettings } from "@/lib/types";

function RoleSwitcher() {
  const { currentRole, setCurrentRole } = useCurrentRole();
  const canSwitchRole = currentRole === 'Dev' || currentRole === 'Owner';

  if (!canSwitchRole) return null;

  return (
    <div className="group-data-[collapsible=icon]:hidden">
      <Label
        htmlFor="role-switcher"
        className="px-2 text-xs font-medium text-sidebar-foreground/70"
      >
        Role
      </Label>
      <Select value={currentRole} onValueChange={setCurrentRole}>
        <SelectTrigger
          className="w-full mt-1 bg-sidebar-background border-sidebar-border h-9"
          id="role-switcher"
        >
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Dev">Dev</SelectItem>
          <SelectItem value="Owner">Owner</SelectItem>
          <SelectItem value="RH">RH</SelectItem>
          <SelectItem value="Manager">Manager</SelectItem>
          <SelectItem value="Employee">Employee</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = React.useState<AppSettings>({
    projectName: "LoopHub",
    leaveAccumulationAmount: 1.5,
  });

  React.useEffect(() => {
    const fetchProjectName = async () => {
        try {
            const fetchedSettings = await getSettings();
            setSettings(fetchedSettings);
        } catch (error) {
            console.error("Failed to fetch settings", error);
        }
    };
    fetchProjectName();
  }, []);

  return (
    <RoleProvider>
       <style>{`
        :root {
          --sidebar-primary: ${settings.logoSvgColor};
          --logo-text-color: ${settings.logoTextColor};
          --primary: ${settings.primaryColor};
          --background: ${settings.backgroundColor};
          --accent: ${settings.accentColor};
        }
      `}</style>
      <SidebarProvider>
        <Sidebar side="left" variant="sidebar" collapsible="icon">
          <SidebarRail />
          <SidebarHeader>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-bold"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-sidebar-primary"
              >
                <path d="M12 2 L14.5 9 L22 9 L16 14 L18 22 L12 17 L6 22 L8 14 L2 9 L9.5 9 Z"></path>
              </svg>
              <span className="duration-200 group-data-[collapsible=icon]:opacity-0" style={{ color: 'hsl(var(--logo-text-color))' }}>
                {settings.projectName}
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4 group-data-[collapsible=icon]:p-2 relative flex flex-col">
            <RoleSwitcher />
            <div className="w-full h-px bg-sidebar-border" />
            <div className="flex items-center justify-center gap-2 group-data-[state=expanded]:flex-row group-data-[state=collapsed]:flex-col">
              <SidebarCollapse className="group-data-[state=collapsed]:order-1" />
              <div className="group-data-[state=collapsed]:order-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="justify-start w-full gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center"
                    >
                        <React.Fragment>
                        <Avatar>
                            <AvatarImage
                            src="https://picsum.photos/seed/user-avatar/40/40"
                            data-ai-hint="person portrait"
                            />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <div className="text-left duration-200 group-data-[collapsible=icon]:opacity-0">
                            <p className="text-sm font-medium">Admin User</p>
                            <p className="text-xs text-muted-foreground">
                            admin@loophub.com
                            </p>
                        </div>
                        </React.Fragment>
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                    className="w-56 mb-2"
                    side="right"
                    align="start"
                    >
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/my-profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/user-settings">Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 min-h-screen">
          <header className="sticky top-0 z-10 flex items-center h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h1 className="text-lg font-semibold md:text-xl"></h1>
            </div>
            <div className="flex items-center w-full gap-4 ml-auto md:gap-2 lg:gap-4">
              <form className="flex-1 ml-auto sm:flex-initial">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background"
                  />
                </div>
              </form>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                    >
                      <React.Fragment>
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src="https://picsum.photos/seed/user-avatar/40/40"
                            data-ai-hint="person portrait"
                          />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                      </React.Fragment>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/dashboard/my-profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/dashboard/user-settings">Settings</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          <SidebarInset>
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </RoleProvider>
  );
}

// Dummy Avatar components for layout structure
import {
  Avatar as UIAvatar,
  AvatarFallback as UIAvatarFallback,
  AvatarImage as UIAvatarImage,
} from "@/components/ui/avatar";

const Avatar = ({
  children,
  ...props
}: React.ComponentProps<typeof UIAvatar>) => (
  <UIAvatar {...props}>{children}</UIAvatar>
);
const AvatarImage = ({
  ...props
}: React.ComponentProps<typeof UIAvatarImage>) => <UIAvatarImage {...props} />;
const AvatarFallback = ({
  children,
  ...props
}: React.ComponentProps<typeof UIAvatarFallback>) => (
  <UIAvatarFallback {...props}>{children}</UIAvatarFallback>
);
