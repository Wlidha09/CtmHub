
"use client";

import * as React from "react";

type RoleContextType = {
  currentRole: string; // Changed to string to allow for custom roles
  setCurrentRole: (role: string) => void;
};

const RoleContext = React.createContext<RoleContextType | undefined>(
  undefined
);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = React.useState<string>("Employee");

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
