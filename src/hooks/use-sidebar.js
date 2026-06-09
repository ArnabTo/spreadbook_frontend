"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useBelowSidebarBreakpoint } from "@/hooks/use-media-query";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
    const belowBreakpoint = useBelowSidebarBreakpoint();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const userOverride = useRef(null);

    useEffect(() => {
        if (belowBreakpoint) {
            setIsCollapsed(true);
        } else if (userOverride.current !== null) {
            setIsCollapsed(userOverride.current);
            userOverride.current = null;
        }
    }, [belowBreakpoint]);

    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => {
            const next = !prev;
            userOverride.current = next;
            return next;
        });
    }, []);

    const setCollapsed = useCallback((value) => {
        setIsCollapsed(value);
    }, []);

    const openMobile = useCallback(() => {
        setIsMobileOpen(true);
    }, []);

    const closeMobile = useCallback(() => {
        setIsMobileOpen(false);
    }, []);

    const toggleMobile = useCallback(() => {
        setIsMobileOpen((prev) => !prev);
    }, []);

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                isMobileOpen,
                toggleCollapsed,
                setCollapsed,
                openMobile,
                closeMobile,
                toggleMobile,
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider");
    }
    return context;
}
