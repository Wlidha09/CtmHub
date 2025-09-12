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
  SidebarRail
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
  DropdownMenuRadioItem
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentRole, setCurrentRole] = React.useState("Dev");
  return (
    <SidebarProvider>
      <Sidebar side="left" variant="sidebar" collapsible="icon">
        <SidebarRail />
        <SidebarHeader className="items-center justify-center gap-2 group-data-[collapsible=icon]:-ml-2">
            <Link href="/dashboard" className="flex items-center gap-2 font-bold text-sidebar-foreground">
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
                    <path d="M12 2a10 10 0 1 0 10 10" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                    <path d="M12 22a10 10 0 0 1-10-10" />
                    <path d="M12 22a10 10 0 0 0 10-10" />
                </svg>
                <span className="duration-200 group-data-[collapsible=icon]:opacity-0">LoopHub</span>
            </Link>
        </SidebarHeader>
        <SidebarContent>
          <DashboardNav />
        </SidebarContent>
        <SidebarFooter className="p-4 space-y-4 group-data-[collapsible=icon]:p-2">
          <div className="group-data-[collapsible=icon]:hidden">
            <Label htmlFor="role-switcher" className="px-2 text-xs font-medium text-sidebar-foreground/70">Role</Label>
            <Select value={currentRole} onValueChange={setCurrentRole}>
              <SelectTrigger className="w-full mt-1 bg-sidebar-background border-sidebar-border h-9" id="role-switcher">
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

          <div className="w-full h-px bg-sidebar-border" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="justify-start w-full gap-2 px-2 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:justify-center">
                <React.Fragment>
                    <Avatar>
                      <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person portrait"/>
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="text-left duration-200 group-data-[collapsible=icon]:opacity-0">
                      <p className="text-sm font-medium">Admin User</p>
                      <p className="text-xs text-muted-foreground">admin@loophub.com</p>
                    </div>
                </React.Fragment>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mb-2" side="right" align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      <Button variant="ghost" size="icon" className="rounded-full">
                         <React.Fragment>
                            <Avatar className="w-8 h-8">
                               <AvatarImage src="https://picsum.photos/seed/user-avatar/40/40" data-ai-hint="person portrait"/>
                               <AvatarFallback>AD</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                         </React.Fragment>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Profile</DropdownMenuItem>
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>Logout</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
            </div>
        </header>
        <SidebarInset>
            <main className="flex-1 p-4 md:p-6">
                {children}
            </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Dummy Avatar components for layout structure
import { Avatar as UIAvatar, AvatarFallback as UIAvatarFallback, AvatarImage as UIAvatarImage } from "@/components/ui/avatar";

const Avatar = ({ children, ...props }: React.ComponentProps<typeof UIAvatar>) => <UIAvatar {...props}>{children}</UIAvatar>;
const AvatarImage = ({ ...props }: React.ComponentProps<typeof UIAvatarImage>) => <UIAvatarImage {...props} />;
const AvatarFallback = ({ children, ...props }: React.ComponentProps<typeof UIAvatarFallback>) => <UIAvatarFallback {...props}>{children}</UIAvatarFallback>;
