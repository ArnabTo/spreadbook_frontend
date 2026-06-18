"use client";

import { usePermission } from "@/hooks/use-permission";

export function CreatePermission({ module, children }) {
  const { canCreate } = usePermission(module);
  if (!canCreate) return null;
  return children;
}

export function UpdatePermission({ module, children }) {
  const { canUpdate } = usePermission(module);
  if (!canUpdate) return null;
  return children;
}

export function DeletePermission({ module, children }) {
  const { canDelete } = usePermission(module);
  if (!canDelete) return null;
  return children;
}

export function ViewPermission({ module, children }) {
  const { canView } = usePermission(module);
  if (!canView) return null;
  return children;
}
