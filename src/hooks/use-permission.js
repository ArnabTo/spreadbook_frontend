"use client";

import { useMemo } from "react";
import { usePermissionStore } from "@/store/permission-store";
import { DEFAULT_PERMISSIONS } from "@/config/permissions";

export function usePermission(module) {
  const { permissions } = usePermissionStore();

  return useMemo(() => {
    const perms = permissions[module] || DEFAULT_PERMISSIONS;
    return {
      canView: perms.view,
      canCreate: perms.create,
      canUpdate: perms.update,
      canDelete: perms.delete,
    };
  }, [permissions, module]);
}
