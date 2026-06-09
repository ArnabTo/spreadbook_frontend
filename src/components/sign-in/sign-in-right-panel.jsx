"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Mail, Lock } from "lucide-react";
import { Button } from "../ui/button";
import { Logo } from "@/components/ui/logo";
import { useAuth } from "@/hooks/use-auth";

import SanaLogo from "../../../public/assets/logo/sana_logo.jpeg";

export function SignInRightPanel() {
    const { t } = useTranslation();
    const { login } = useAuth();
    const [email, setEmail] = useState("sana@spread-books.com");
    const [password, setPassword] = useState("");
    const [remember, setRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setError("Please enter email and password");
            return;
        }
        setIsSubmitting(true);
        setError("");
        const result = await login(email, password);
        if (!result.success) {
            setError(result.error || "Login failed");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-full w-full flex-col items-start justify-center ml-28 bg-white">
            <div className="flex w-full max-w-sm flex-col gap-10">
                <Logo
                    className="justify-baseline rounded-lg overflow-hidden"
                    src={SanaLogo} alt="Sana Logo" width={200} height={100} />

                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {t("signIn.title")}
                    </h1>
                    <p className="text-sm text-gray-500">
                        {t("signIn.subtitle")}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-semibold tracking-wider text-gray-500">
                            {t("signIn.emailLabel")}
                        </label>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5">
                            <Mail className="size-5 text-gray-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t("signIn.emailPlaceholder")}
                                className="w-full bg-transparent text-lg text-gray-700 outline-none placeholder:text-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold tracking-wider text-gray-500">
                                {t("signIn.passwordLabel")}
                            </label>
                            <button type="button" className="text-xs font-medium text-brand hover:underline">
                                {t("signIn.forgotPassword")}
                            </button>
                        </div>
                        <div className="flex items-center gap-3 rounded-lg border border-gray-300 px-4 py-2.5">
                            <Lock className="size-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent text-lg text-gray-700 outline-none"
                            />
                        </div>
                    </div>

                    <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                        <input
                            type="checkbox"
                            checked={remember}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="size-4 accent-brand"
                        />
                        {t("signIn.rememberMe")}
                    </label>

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand hover:bg-brand-hover w-32 py-6 rounded-none text-lg"
                    >
                        {isSubmitting ? "Signing in..." : t("signIn.signInButton")}
                    </Button>
                </form>
            </div>
        </div>
    );
}
