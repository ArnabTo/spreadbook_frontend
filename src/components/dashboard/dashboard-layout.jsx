"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useIsMobile } from "@/hooks/use-media-query";
import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";

function DashboardLayoutInner({ children }) {
    const { isAuthenticated, isLoading } = useAuth();
    const isMobile = useIsMobile();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/auth/sign-in");
        }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
        return (
            <div className="flex h-dvh items-center justify-center">
                <div className="size-8 animate-spin rounded-full border-4 border-muted border-t-brand" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="flex h-dvh overflow-hidden bg-background">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export function DashboardLayout({ children }) {
    return (
        <SidebarProvider>
            <DashboardLayoutInner>{children}</DashboardLayoutInner>
        </SidebarProvider>
    );
}
