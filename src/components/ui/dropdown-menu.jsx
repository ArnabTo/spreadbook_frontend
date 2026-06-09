"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const DropdownMenuContext = React.createContext(null);

function DropdownMenu({ children }) {
    const [isOpen, setIsOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const menuRef = React.useRef(null);
    const triggerRef = React.useRef(null);
    const itemsRef = React.useRef([]);

    const close = React.useCallback(() => {
        setIsOpen(false);
        setActiveIndex(-1);
    }, []);

    React.useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            const items = itemsRef.current;
            if (!items.length) return;

            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev + 1) % items.length);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
                    break;
                case "Enter":
                case " ":
                    e.preventDefault();
                    if (activeIndex >= 0 && items[activeIndex]) {
                        items[activeIndex].click();
                        close();
                    }
                    break;
                case "Escape":
                    e.preventDefault();
                    close();
                    triggerRef.current?.focus();
                    break;
            }
        };

        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target) &&
                triggerRef.current && !triggerRef.current.contains(e.target)) {
                close();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, activeIndex, close]);

    React.useEffect(() => {
        if (activeIndex >= 0 && itemsRef.current[activeIndex]) {
            itemsRef.current[activeIndex].focus();
        }
    }, [activeIndex]);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen, activeIndex, setActiveIndex, menuRef, triggerRef, itemsRef, close }}>
            {children}
        </DropdownMenuContext.Provider>
    );
}

function DropdownMenuTrigger({ children, className, asChild, ...props }) {
    const { isOpen, setIsOpen, triggerRef } = React.useContext(DropdownMenuContext);

    return (
        <button
            ref={triggerRef}
            type="button"
            data-slot="dropdown-trigger"
            aria-haspopup="menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
                "inline-flex items-center justify-center outline-none",
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

function DropdownMenuContent({ className, align = "start", sideOffset = 4, children, ...props }) {
    const { isOpen, menuRef, close } = React.useContext(DropdownMenuContext);

    if (!isOpen) return null;

    const alignClasses = {
        start: "left-0",
        end: "right-0",
        center: "left-1/2 -translate-x-1/2",
    };

    return (
        <div
            ref={menuRef}
            role="menu"
            data-slot="dropdown-content"
            aria-orientation="vertical"
            className={cn(
                "absolute z-50 mt-1 min-w-[12rem] overflow-hidden rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-lg ring-1 ring-foreground/10 focus:outline-none animate-in fade-in-0 zoom-in-95",
                alignClasses[align],
                className
            )}
            style={{ top: "100%", marginTop: sideOffset }}
            {...props}
        >
            {children}
            {/* Backdrop click handler */}
            <div className="fixed inset-0 -z-10" onClick={close} aria-hidden="true" />
        </div>
    );
}

function DropdownMenuItem({ className, children, icon, onClick, disabled, ...props }) {
    const { itemsRef, close, activeIndex } = React.useContext(DropdownMenuContext);
    const itemRef = React.useRef(null);

    // Register item reference
    const index = React.useRef(-1);
    React.useEffect(() => {
        index.current = itemsRef.current.length;
        itemsRef.current.push(itemRef.current);
        return () => {
            itemsRef.current = itemsRef.current.filter((_, i) => i !== index.current);
        };
    }, []);

    return (
        <button
            ref={itemRef}
            role="menuitem"
            data-slot="dropdown-item"
            disabled={disabled}
            onClick={(e) => {
                if (disabled) return;
                onClick?.(e);
                close();
            }}
            className={cn(
                "relative flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors select-none",
                "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                className
            )}
            {...props}
        >
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {children}
        </button>
    );
}

function DropdownMenuSeparator({ className, ...props }) {
    return (
        <div
            role="separator"
            data-slot="dropdown-separator"
            className={cn("-mx-1 my-1 h-px bg-border", className)}
            {...props}
        />
    );
}

function DropdownMenuLabel({ className, children, ...props }) {
    return (
        <div
            data-slot="dropdown-label"
            className={cn("px-2 py-1.5 text-xs font-medium text-muted-foreground", className)}
            {...props}
        >
            {children}
        </div>
    );
}

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
};
