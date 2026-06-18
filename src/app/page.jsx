"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
    const { isAuthenticated, isLoading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            router.replace("/auth/sign-in");
            return;
        }
        if (user?.company) {
            router.replace("/dashboard");
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    if (!user?.company) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <main className="flex flex-col items-center gap-4 text-center">
                    <h1 className="text-2xl font-bold tracking-tight">Access Restricted</h1>
                    <p className="text-muted-foreground max-w-md text-lg">
                        You do not have any company access.
                    </p>
                </main>
            </div>
        );
    }

    return null;
}
