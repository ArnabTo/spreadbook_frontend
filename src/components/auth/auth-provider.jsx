"use client";

import "@/lib/i18n/config";
import { AuthProvider } from "@/hooks/use-auth";

export function AuthProviderWrapper({ children }) {
    return <AuthProvider>{children}</AuthProvider>;
}
