"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    Menu,
    Search,
    Bell,
    Mail,
    Calculator,
    Globe,
    ChevronDown,
    User,
    FileText,
    Trash2,
    LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useSidebar } from "@/hooks/use-sidebar";
import { useAuth } from "@/hooks/use-auth";
import i18n from "@/lib/i18n/config";

export function Navbar() {
    const { t } = useTranslation();
    const { openMobile, isCollapsed, toggleCollapsed } = useSidebar();
    const { user, logout } = useAuth();
    const [currentLang, setCurrentLang] = useState(i18n.language || "en");

    const switchLanguage = (lang) => {
        i18n.changeLanguage(lang);
        setCurrentLang(lang);
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    };

    return (
        <header
            data-slot="navbar"
            className={cn(
                "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60 sm:px-6",
                currentLang === "ar" ? "flex-row-reverse" : ""
            )}
        >
            {/* Left Section */}
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="md:hidden"
                    onClick={openMobile}
                    aria-label="Open menu"
                >
                    <Menu className="size-5" />
                </Button>

                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hidden md:inline-flex"
                    onClick={toggleCollapsed}
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    <Menu className="size-5" />
                </Button>
            </div>

            {/* Center - Search */}
            <div className="flex flex-1 items-center justify-center px-4">
                <div className="relative w-full max-w-md">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder={t("navbar.search") || "Search Transaction"}
                        className="h-9 w-full rounded-lg bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground/70"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-1 sm:gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm" aria-label="Switch language">
                            <Globe className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[8rem]">
                        <DropdownMenuItem onClick={() => switchLanguage("en")}>
                            {currentLang === "en" && "✓ "}English
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => switchLanguage("ar")}>
                            {currentLang === "ar" && "✓ "}العربية
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="ghost" size="icon-sm" aria-label="Messages">
                    <Mail className="size-4" />
                </Button>

                <Button variant="ghost" size="icon-sm" aria-label="Notifications">
                    <Bell className="size-4" />
                </Button>

                <Button variant="ghost" size="icon-sm" aria-label="Calculator">
                    <Calculator className="size-4" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="ml-2 flex items-center gap-2 px-2"
                            aria-label="User menu"
                        >
                            <Avatar
                                src={user?.avatar}
                                fallback={user?.name?.charAt(0) || "U"}
                                size="sm"
                            />
                            <span className="hidden text-sm font-medium sm:inline-flex">
                                {user?.name || "User"}
                            </span>
                            <ChevronDown className="hidden size-3 text-muted-foreground sm:block" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                            <User className="mr-2 size-4" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <FileText className="mr-2 size-4" />
                            View All Transactions
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                            <Trash2 className="mr-2 size-4" />
                            Clear Cache
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={logout}
                            className="text-destructive focus:text-destructive"
                        >
                            <LogOut className="mr-2 size-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
