"use client";

import { useState, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navData } from "@/config/nav.config.dashboard";
import { useSidebar } from "@/hooks/use-sidebar";
import { useIsMobile } from "@/hooks/use-media-query";
import {
    Search,
    X,
    LogOut,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, closeMobile, isMobileOpen } = useSidebar();
    const { user, logout } = useAuth();
    const isMobile = useIsMobile();

    return (
        <>
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
                    onClick={closeMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                data-slot="sidebar"
                data-state={isCollapsed ? "collapsed" : "expanded"}
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-white/10 bg-brand transition-all duration-300 ease-in-out lg:static lg:z-auto",
                    isCollapsed ? "w-[70px]" : "w-[280px]",
                    isMobile
                        ? cn(
                            "translate-x-0",
                            isMobileOpen ? "translate-x-0" : "-translate-x-full"
                        )
                        : "translate-x-0"
                )}
            >
                {/* Logo area */}
                <div
                    className={cn(
                        "flex h-16 shrink-0 items-center border-b border-white/10 px-4",
                        isCollapsed ? "justify-center" : "gap-3"
                    )}
                >
                    {isCollapsed ? (
                        <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">
                            S
                        </div>
                    ) : (
                        <>
                            <div className="flex size-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold text-white">
                                S
                            </div>
                            <span className="text-base font-semibold text-white/90">
                                Spread Book
                            </span>
                            {isMobile && (
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="ml-auto text-white/70 hover:bg-white/10 hover:text-white"
                                    onClick={closeMobile}
                                    aria-label="Close menu"
                                >
                                    <X className="size-4" />
                                </Button>
                            )}
                        </>
                    )}
                </div>

                {/* User Card */}
                <div className="shrink-0 border-b border-white/10 px-3 py-3">
                    {isCollapsed ? (
                        <div className="flex justify-center">
                            <Avatar
                                src={user?.avatar}
                                fallback={user?.name?.charAt(0) || "U"}
                                size="sm"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 px-1">
                            <Avatar
                                src={user?.avatar}
                                fallback={user?.name?.charAt(0) || "U"}
                                size="sm"
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                                <span className="truncate text-sm font-medium text-white/90">
                                    {user?.name || "User"}
                                </span>
                                <span className="truncate text-xs text-white/50">
                                    {user?.email || ""}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon-xs"
                                onClick={logout}
                                className="shrink-0 text-white/50 hover:bg-white/10 hover:text-white"
                                aria-label="Logout"
                            >
                                <LogOut className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>

                {/* Menu Search */}
                {!isCollapsed && <SidebarSearch />}

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {navData.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            {!isCollapsed && (
                                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wider text-white/40">
                                    {section.subheader}
                                </p>
                            )}
                            <ul className="space-y-1">
                                {section.items.map((item) => (
                                    <SidebarNavItem
                                        key={item.title}
                                        item={item}
                                        pathname={pathname}
                                        isCollapsed={isCollapsed}
                                        onNavClick={isMobile ? closeMobile : undefined}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}

function SidebarSearch() {
    return (
        <div className="shrink-0 px-3 py-3">
            <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-white/40" />
                <input
                    placeholder="Search Menu"
                    className="h-8 w-full rounded-md border border-white/20 bg-white/10 pl-8 pr-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/30 focus:ring-1 focus:ring-white/30"
                />
            </div>
        </div>
    );
}

function SidebarNavItem({ item, pathname, isCollapsed, onNavClick }) {
    const hasChildren = item.children && item.children.length > 0;
    const [isOpen, setIsOpen] = useState(false);
    const path = item.path;

    const isActive = useMemo(() => {
        if (pathname === path) return true;
        if (hasChildren) {
            return item.children.some(
                (child) => pathname === child.path || pathname.startsWith(child.path + "/")
            );
        }
        return false;
    }, [pathname, path, hasChildren, item.children]);

    const handleToggle = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    if (isCollapsed) {
        return <CollapsedNavItem item={item} isActive={isActive} />;
    }

    return (
        <li>
            <div className="relative">
                <Link
                    href={hasChildren ? "#" : item.path}
                    onClick={(e) => {
                        if (hasChildren) {
                            handleToggle(e);
                        } else {
                            onNavClick?.();
                        }
                    }}
                    data-active={isActive}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition-colors",
                        "text-white/60 hover:text-white",
                        " data-[active=true]:text-white data-[active=true]:font-medium"
                    )}
                >
                    <item.icon className="size-6 shrink-0" />
                    <span className="flex-1 truncate text-lg">{item.title}</span>
                    {hasChildren && (
                        <button
                            onClick={handleToggle}
                            className="flex size-5 items-center justify-center rounded text-white/40 hover:bg-white/10 hover:text-white"
                            aria-label={isOpen ? "Collapse" : "Expand"}
                        >
                            {isOpen ? (
                                <ChevronDown className="size-6" />
                            ) : (
                                <ChevronRight className="size-6" />
                            )}
                        </button>
                    )}
                </Link>
            </div>

            {/* Children submenu */}
            {hasChildren && isOpen && (
                <ul className="ml-4 mt-1 space-y-1 border-l border-white/20 pl-3">
                    {item.children.map((child) => {
                        const isChildActive = pathname === child.path;
                        const ChildIcon = child.icon;
                        return (
                            <li key={child.title}>
                                <Link
                                    href={child.path}
                                    onClick={onNavClick}
                                    data-active={isChildActive}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                        "text-white/50  hover:text-white",
                                        " data-[active=true]:text-white data-[active=true]:font-medium"
                                    )}
                                >
                                    {ChildIcon && <ChildIcon className="size-6 shrink-0" />}
                                    <span className="truncate text-lg">{child.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            )}
        </li>
    );
}

function CollapsedNavItem({ item, isActive }) {
    return (
        <li>
            <Link
                href={item.children?.[0]?.path || item.path}
                data-active={isActive}
                className={cn(
                    "flex items-center justify-center rounded-lg p-2 transition-colors",
                    "text-white/60 hover:bg-white/10 hover:text-white",
                    "data-[active=true]:bg-white/20 data-[active=true]:text-white"
                )}
                title={item.title}
            >
                <item.icon className="size-5 shrink-0" />
            </Link>
        </li>
    );
}

export { Sidebar };
