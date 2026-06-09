"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

function Avatar({ className, src, alt, fallback, size = "md", ...props }) {
    const sizeClasses = {
        xs: "size-6 text-xs",
        sm: "size-8 text-sm",
        md: "size-10 text-base",
        lg: "size-12 text-lg",
        xl: "size-16 text-xl",
    };

    return (
        <div
            data-slot="avatar"
            className={cn(
                "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10",
                sizeClasses[size],
                className
            )}
            {...props}
        >
            {src ? (
                <img src={src} alt={alt || "Avatar"} className="size-full object-cover" />
            ) : (
                <span className="font-medium text-muted-foreground">{fallback || "U"}</span>
            )}
        </div>
    );
}

export { Avatar };
