"use client";

import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, Check, X as XIcon, Save, ChevronRight, Home } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePermissionStore } from "@/store/permission-store";
import { ROLE_PERMISSIONS, MODULES, ROLES } from "@/config/permissions";
import { usePermission } from "@/hooks/use-permission";

const ACTIONS = ["view", "create", "update", "delete"];

function PermissionPage() {
  const { t } = useTranslation();
  const { permissions: currentUserPerms } = usePermissionStore();
  const { canView, canUpdate } = usePermission("permission");
  const [editablePermissions, setEditablePermissions] = useState(null);
  const [saved, setSaved] = useState(false);

  const roleLabels = useMemo(
    () => ({
      [ROLES.SUPERADMIN]: t("permission.roles.superadmin"),
      [ROLES.ADMIN]: t("permission.roles.admin"),
      [ROLES.MANAGER]: t("permission.roles.manager"),
      [ROLES.SALES]: t("permission.roles.sales"),
      [ROLES.ACCOUNTS]: t("permission.roles.accounts"),
      [ROLES.INVENTORY]: t("permission.roles.inventory"),
      [ROLES.VIEWER]: t("permission.roles.viewer"),
      [ROLES.ACCOUNTANT]: t("permission.roles.accountant"),
    }),
    [t]
  );

  const moduleLabels = useMemo(() => {
    const labels = {};
    Object.keys(MODULES).forEach((key) => {
      labels[MODULES[key]] = t(`permission.modules.${MODULES[key]}`);
    });
    return labels;
  }, [t]);

  const allRoles = useMemo(() => Object.values(ROLES), []);
  const allModules = useMemo(() => Object.values(MODULES), []);

  const localPermissions = useMemo(() => {
    return editablePermissions || ROLE_PERMISSIONS;
  }, [editablePermissions]);

  const handleToggle = (role, mod, action) => {
    setEditablePermissions((prev) => {
      const base = prev || ROLE_PERMISSIONS;
      const updated = { ...base };
      updated[role] = (updated[role] || []).map((entry) => {
        if (entry.module !== mod) return entry;
        return { ...entry, [action]: !entry[action] };
      });
      return updated;
    });
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!canView) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">{t("permission.noPermission")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between rounded-xl bg-white px-5 py-3 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Home className="size-4" />
          <span>{t("permission.title")}</span>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-gray-800">{t("permission.pageTitle")}</span>
        </div>
        {canUpdate && (
          <Button onClick={handleSave} disabled={!editablePermissions}>
            <Save className="mr-2 size-4" />
            {t("permission.save")}
          </Button>
        )}
      </div>

      {saved && (
        <div className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700 ring-1 ring-green-200">
          {t("permission.saved")}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm ring-1 ring-black/5">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t("permission.module")}
              </th>
              {allRoles.map((role) => (
                <th
                  key={role}
                  className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
                >
                  {roleLabels[role]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allModules.map((module) => (
              <tr key={module} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50">
                <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 hover:bg-gray-50/50">
                  {moduleLabels[module] || module}
                </td>
                {allRoles.map((role) => {
                  const rolePerms = localPermissions[role] || [];
                  const perm = rolePerms.find((e) => e.module === module);
                  const hasView = perm?.view;
                  return (
                    <td key={role} className="px-3 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {ACTIONS.map((action) => {
                          const checked = perm?.[action];
                          const canEdit = canUpdate && hasView;
                          return (
                            <button
                              key={action}
                              disabled={!canEdit}
                              onClick={() => handleToggle(role, module, action)}
                              className={`flex size-7 items-center justify-center rounded-md text-xs font-medium transition-colors
                                ${checked
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }
                                ${!canEdit ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                              `}
                              title={`${roleLabels[role]} - ${moduleLabels[module] || module} - ${action}`}
                            >
                              {action === "view" && (checked ? <Check className="size-3.5" /> : <XIcon className="size-3.5" />)}
                              {action === "create" && (checked ? "C" : "-")}
                              {action === "update" && (checked ? "U" : "-")}
                              {action === "delete" && (checked ? "D" : "-")}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function PermissionPageWrapper() {
  return <PermissionPage />;
}
