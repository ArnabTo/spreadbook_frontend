"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_PERMISSIONS, DEFAULT_PERMISSIONS, permissionsArrayToObject } from "@/config/permissions";

const PermissionContext = createContext(null);

export function PermissionProvider({ children }) {
  const { user } = useAuth();
  const role = user?.role?.toLowerCase() || "";
  const permissions = useMemo(() => {
    const arr = ROLE_PERMISSIONS[role] || [];
    return permissionsArrayToObject(arr);
  }, [role]);

  const getPermission = useCallback(
    (module) => {
      return permissions[module] || DEFAULT_PERMISSIONS;
    },
    [permissions]
  );

  const hasPermission = useCallback(
    (module, action) => {
      const perms = permissions[module];
      if (!perms) return false;
      return !!perms[action];
    },
    [permissions]
  );

  const value = useMemo(
    () => ({ permissions, getPermission, hasPermission, role }),
    [permissions, getPermission, hasPermission, role]
  );

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissionStore() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionStore must be used within a PermissionProvider");
  }
  return context;
}

export { PermissionContext };
