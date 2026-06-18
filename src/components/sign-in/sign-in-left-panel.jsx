"use client";

import { useTranslation } from "react-i18next";
import { Logo } from "@/components/ui/logo";

import SpreadBookLogo from "../../../public/assets/logo/spreadbook_logo.jpg";

export function SignInLeftPanel({ universalLogo }) {
    const { t } = useTranslation();
    const logoSrc = universalLogo || SpreadBookLogo;

    return (
        <div className="flex h-full w-full flex-col items-center justify-between bg-brandGray py-16 px-8 text-white">
            <div className="flex flex-1 flex-col items-center justify-center gap-5">
                <Logo src={logoSrc} alt="Spread Book" width={200} height={100} className="rounded-lg overflow-hidden"/>
                <p className="text-md font-medium tracking-wide">
                    {t("signIn.brandSubtext")}
                </p>
            </div>

            <div className="flex flex-col items-center gap-1 text-center text-xs text-white/60">
                <p>{t("signIn.footer")}</p>
                <p>{t("signIn.footerRights")}</p>
                <p className="mt-2 text-sm font-medium text-white">
                    {t("signIn.footerContact")}
                </p>
            </div>
        </div>
    );
}
