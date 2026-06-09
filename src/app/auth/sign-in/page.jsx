"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SignInLeftPanel } from "@/components/sign-in/sign-in-left-panel";
import { SignInRightPanel } from "@/components/sign-in/sign-in-right-panel";


export default function SignInPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, []);

    if (isLoading) return null;
    if (isAuthenticated) return null;

    return (
        <div className="flex h-dvh w-full flex-col md:flex-row">
            <div className="hidden md:flex md:w-[45%]">
                <SignInLeftPanel />
            </div>
            <div className="flex w-full md:w-[55%]">
                <SignInRightPanel />
            </div>
        </div>
    );
}
