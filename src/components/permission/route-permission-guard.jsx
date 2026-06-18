"use client";

import { usePathname } from "next/navigation";
import { usePermission } from "@/hooks/use-permission";
import { AccessDenied } from "@/components/permission/access-denied";
import { getModuleFromPath } from "@/lib/route-module-map";

export function RoutePermissionGuard({ children }) {
  const pathname = usePathname();
  const module = getModuleFromPath(pathname);
  const { canView } = usePermission(module || "__nonexistent__");

  if (module && !canView) {
    return <AccessDenied />;
  }

  return children;
}
