"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { navData } from "@/config/nav.config.dashboard";
import { useSidebar } from "@/hooks/use-sidebar";
import { useIsMobile } from "@/hooks/use-media-query";
import { usePermissionStore } from "@/store/permission-store";
import {
    Search,
    X,
    LogOut,
    ChevronDown,
    ChevronRight,
    PanelLeftClose,
    PanelLeftOpen,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { API_BASE_URL } from "@/config/api";
import Image from "next/image";

function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggleCollapsed, closeMobile, isMobileOpen } = useSidebar();
    const { user, logout } = useAuth();
    const { permissions } = usePermissionStore();
    const isMobile = useIsMobile();

    const hasModuleAccess = useCallback(
        (module) => {
            if (!module) return true;
            return permissions[module]?.view ?? false;
        },
        [permissions]
    );

    const filteredNavData = useMemo(() => {
        return navData
            .map((section) => ({
                ...section,
                items: section.items
                    .filter((item) => {
                        if (item.children) {
                            const visibleChildren = item.children.filter((child) => hasModuleAccess(child.module));
                            return visibleChildren.length > 0;
                        }
                        return hasModuleAccess(item.module);
                    })
                    .map((item) => {
                        if (!item.children) return item;
                        return {
                            ...item,
                            children: item.children.filter((child) => hasModuleAccess(child.module)),
                        };
                    }),
            }))
            .filter((section) => section.items.length > 0);
    }, [hasModuleAccess]);

    const universalLogoSrc = user?.universalLogo
        ? user.universalLogo.startsWith("/")
            ? `${API_BASE_URL.replace(/\/+$/, "")}${user.universalLogo}`
            : user.universalLogo
        : null;
    const [isHoverExpanded, setIsHoverExpanded] = useState(false);

    const effectiveCollapsed = isCollapsed && !isHoverExpanded;
    const isOverlayExpanded = isCollapsed && isHoverExpanded && !isMobile;

    const handleSidebarMouseEnter = useCallback(() => {
        if (!isMobile && isCollapsed) {
            setIsHoverExpanded(true);
        }
    }, [isMobile, isCollapsed]);

    const handleSidebarMouseLeave = useCallback(() => {
        setIsHoverExpanded(false);
    }, []);

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
                data-state={effectiveCollapsed ? "collapsed" : "expanded"}
                onMouseEnter={handleSidebarMouseEnter}
                onMouseLeave={handleSidebarMouseLeave}
                className={cn(
                    "fixed left-0 top-0 z-50 flex h-dvh flex-col border-r border-white/10 bg-brand transition-all duration-300 ease-in-out",
                    isOverlayExpanded
                        ? "md:fixed md:z-50 md:shadow-xl"
                        : "md:static md:z-auto",
                    effectiveCollapsed ? "w-[70px]" : "w-[280px]",
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
                        "bg-white flex h-16 shrink-0 items-center px-4",
                        effectiveCollapsed ? "justify-center" : "gap-3"
                    )}
                >
                    {universalLogoSrc ? (
                        <Image
                            src={universalLogoSrc}
                            alt="Logo"
                            width={effectiveCollapsed ? 32 : 160}
                            height={40}
                            unoptimized
                            className={cn(
                                "object-contain",
                                effectiveCollapsed ? "size-8" : "h-10 w-full object-cover"
                            )}
                        />
                    ) : (
                        effectiveCollapsed ? (
                            <div className="bg-brand flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white">
                                S
                            </div>
                        ) : (
                            <>
                                <div className="bg-brand flex size-9 items-center justify-center rounded-lg text-sm font-bold text-white">
                                    S
                                </div>
                                <span className="text-base font-semibold text-white/90">
                                    Spread Book
                                </span>
                            </>
                        )
                    )}
                    {isMobile && !effectiveCollapsed && (
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
                </div>

                {/* Menu Search */}
                {!effectiveCollapsed && <SidebarSearch />}
                {effectiveCollapsed && (
                    <div className="shrink-0 flex justify-center py-2">
                        <Search className="size-5 text-white/50" />
                    </div>
                )}

                {/* User Card */}
                <SidebarUserCard user={user} logout={logout} isCollapsed={effectiveCollapsed} />

                {/* Navigation */}
                <nav
                    className={cn(
                        "flex-1 px-3 py-4",
                        effectiveCollapsed ? "overflow-visible" : "overflow-y-auto"
                    )}
                >
                    {filteredNavData.map((section, idx) => (
                        <div key={idx} className="mb-6">
                            {!effectiveCollapsed && section.subheader && (
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
                                        isCollapsed={effectiveCollapsed}
                                        onNavClick={isMobile ? closeMobile : undefined}
                                    />
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Collapse Toggle (desktop only) */}
                {!isMobile && (
                    <div className="shrink-0 border-t border-white/10 p-3">
                        <button
                            onClick={toggleCollapsed}
                            className={cn(
                                "flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white",
                                effectiveCollapsed && "justify-center"
                            )}
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {effectiveCollapsed ? (
                                <PanelLeftOpen className="size-5 shrink-0" />
                            ) : (
                                <>
                                    <PanelLeftClose className="size-5 shrink-0" />
                                    <span>Collapse</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
}

function SidebarSearch() {
    return (
        <div className="shrink-0 px-3 py-3">
            <div className="relative rounded-md bg-white">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                <input
                    placeholder="Search Menu"
                    className="h-8 w-full rounded-md bg-white pl-8 pr-2 text-sm text-gray-700 outline-none placeholder:text-gray-400"
                />
            </div>
        </div>
    );
}

function SidebarUserCard({ user, logout, isCollapsed }) {
    const [menuOpen, setMenuOpen] = useState(false);

    if (isCollapsed) {
        return (
            <div className="bg-brand-dark shrink-0 flex justify-center py-3">
                <Avatar
                    src={user?.avatar}
                    fallback={user?.name?.charAt(0) || "U"}
                    size="sm"
                />
            </div>
        );
    }

    return (
        <div className="min-w-4/5 mx-auto bg-brand-dark shrink-0 px-4 py-3 rounded-lg relative">
            <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex flex-col w-full items-center justify-center gap-3"
            >
                <Avatar
                    src={user?.avatar}
                    fallback={user?.name?.charAt(0) || "U"}
                    size="sm"
                />
                <div className="flex w-full items-center justify-center gap-2">
                    <span className="text-sm font-semibold text-white/90 truncate">
                        {user?.name || "User"}
                    </span>
                    <ChevronDown className={cn("size-4 text-gray-500 transition-transform", menuOpen && "rotate-180")} />
                </div>
            </button>

            {menuOpen && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <ul className="absolute left-3 right-3 top-full z-20 mt-1 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                        <li>
                            <button
                                onClick={() => { setMenuOpen(false); window.location.href = "/dashboard/profile"; }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                My Profile
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setMenuOpen(false); window.location.href = "/dashboard/transactions"; }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                View All Transactions
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => { setMenuOpen(false); }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                Clear Cache
                            </button>
                        </li>
                        <li className="border-t border-gray-100">
                            <button
                                onClick={() => { setMenuOpen(false); logout(); }}
                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                                Logout
                            </button>
                        </li>
                    </ul>
                </>
            )}
        </div>
    );
}

function SidebarNavItem({ item, pathname, isCollapsed, onNavClick }) {
    const hasChildren = item.children && item.children.length > 0;
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

    const [isOpen, setIsOpen] = useState(isActive);

    useEffect(() => {
        if (isActive) {
            setIsOpen(true);
        }
    }, [isActive]);

    const handleToggle = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen((prev) => !prev);
    }, []);

    if (isCollapsed) {
        return (
            <CollapsedNavItem
                item={item}
                isActive={isActive}
                pathname={pathname}
                onNavClick={onNavClick}
            />
        );
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

function CollapsedNavItem({ item, isActive, pathname, onNavClick }) {
    const hasChildren = item.children && item.children.length > 0;
    const [showFlyout, setShowFlyout] = useState(false);

    const handleMouseEnter = useCallback(() => {
        if (hasChildren) {
            setShowFlyout(true);
        }
    }, [hasChildren]);

    const handleMouseLeave = useCallback(() => {
        setShowFlyout(false);
    }, []);

    const triggerClassName = cn(
        "flex w-full items-center justify-center rounded-lg p-2 transition-colors",
        "text-white/60 hover:bg-white/10 hover:text-white",
        "data-[active=true]:bg-white/20 data-[active=true]:text-white"
    );

    return (
        <li
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {hasChildren ? (
                <button
                    type="button"
                    data-active={isActive}
                    className={triggerClassName}
                    title={item.title}
                    aria-label={item.title}
                    aria-expanded={showFlyout}
                >
                    <item.icon className="size-5 shrink-0" />
                </button>
            ) : (
                <Link
                    href={item.path}
                    data-active={isActive}
                    className={triggerClassName}
                    title={item.title}
                    onClick={onNavClick}
                >
                    <item.icon className="size-5 shrink-0" />
                </Link>
            )}

            {hasChildren && showFlyout && (
                <div
                    className="absolute left-full top-0 z-50 ml-2 min-w-[200px] rounded-lg border border-white/10 bg-brand py-2 shadow-xl"
                    role="menu"
                >
                    <p className="mb-1 border-b border-white/10 px-3 py-2 text-xs font-medium uppercase tracking-wider text-white/40">
                        {item.title}
                    </p>
                    <ul className="space-y-0.5 px-2">
                        {item.children.map((child) => {
                            const isChildActive =
                                pathname === child.path ||
                                pathname.startsWith(child.path + "/");
                            const ChildIcon = child.icon;

                            return (
                                <li key={child.title}>
                                    <Link
                                        href={child.path}
                                        onClick={onNavClick}
                                        data-active={isChildActive}
                                        role="menuitem"
                                        className={cn(
                                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                                            "text-white/60 hover:bg-white/10 hover:text-white",
                                            "data-[active=true]:bg-white/20 data-[active=true]:text-white data-[active=true]:font-medium"
                                        )}
                                    >
                                        {ChildIcon && (
                                            <ChildIcon className="size-4 shrink-0" />
                                        )}
                                        <span className="truncate">{child.title}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </li>
    );
}

export { Sidebar };
