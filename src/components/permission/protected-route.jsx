"use client";

import { usePermission } from "@/hooks/use-permission";
import { AccessDenied } from "@/components/permission/access-denied";

export function ProtectedRoute({ module, children }) {
  const { canView } = usePermission(module);

  if (!canView) {
    return <AccessDenied />;
  }

  return children;
}
