"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccessDenied() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-red-50">
          <ShieldAlert className="size-10 text-red-500" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("permission.accessDenied.title")}
          </h1>
          <p className="max-w-md text-muted-foreground">
            {t("permission.accessDenied.description")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            {t("permission.accessDenied.goBack")}
          </Button>
          <Button onClick={() => router.push("/dashboard")}>
            {t("permission.accessDenied.goDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}
