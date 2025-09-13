"use client";

import * as React from "react";
import type { Role } from "@/lib/types";

type RoleContextType = {
  currentRole: Role["name"];
  setCurrentRole: (role: Role["name"]) => void;
};

const RoleContext = React.createContext<RoleContextType | undefined>(
  undefined
);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = React.useState<Role["name"]>("Dev");

  return (
    <RoleContext.Provider value={{ currentRole, setCurrentRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useCurrentRole() {
  const context = React.useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useCurrentRole must be used within a RoleProvider");
  }
  return context;
}
