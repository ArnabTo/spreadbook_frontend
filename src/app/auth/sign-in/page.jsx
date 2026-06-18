"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/config/api";
import { SignInLeftPanel } from "@/components/sign-in/sign-in-left-panel";
import { SignInRightPanel } from "@/components/sign-in/sign-in-right-panel";


export default function SignInPage() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [universalLogo, setUniversalLogo] = useState(null);

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isLoading, isAuthenticated, router]);

    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, []);

    useEffect(() => {
        fetch(`${API_BASE_URL.replace(/\/+$/, "")}/api/branding/`)
            .then((res) => res.json())
            .then((data) => {
                if (data?.logo) {
                    setUniversalLogo(
                        data.logo.startsWith("/")
                            ? `${API_BASE_URL.replace(/\/+$/, "")}${data.logo}`
                            : data.logo
                    );
                }
            })
            .catch(() => {});
    }, []);

    if (isLoading) return null;
    if (isAuthenticated) return null;

    return (
        <div className="flex h-dvh w-full flex-col md:flex-row">
            <div className="hidden md:flex md:w-[45%]">
                <SignInLeftPanel universalLogo={universalLogo} />
            </div>
            <div className="flex w-full md:w-[55%]">
                <SignInRightPanel />
            </div>
        </div>
    );
}
