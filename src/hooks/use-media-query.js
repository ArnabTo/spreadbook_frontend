"use client";

import { useState, useEffect } from "react";

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);

        const listener = (event) => setMatches(event.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
}

export function useIsMobile() {
    return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet() {
    return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop() {
    return useMediaQuery("(min-width: 1024px)");
}

export function useBelowSidebarBreakpoint() {
    return useMediaQuery("(max-width: 1099px)");
}
