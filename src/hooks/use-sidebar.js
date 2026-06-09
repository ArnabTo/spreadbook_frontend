"use client";

import { createContext, useContext, useState, useCallback } from "react";

const SidebarContext = createContext(null);

export function SidebarProvider({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleCollapsed = useCallback(() => {
        setIsCollapsed((prev) => !prev);
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
