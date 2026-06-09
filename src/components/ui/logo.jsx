import { cn } from "@/lib/utils";

export function Logo({ src, alt = "Logo", className, width, height, ...props }) {
    // Next.js static image imports return { src, width, height } — extract the string
    const imgSrc = src?.src ?? src;

    if (typeof imgSrc === "string") {
        return (
            <div className={cn("flex items-center justify-center", className)} {...props}>
                <img src={imgSrc} alt={alt} width={width} height={height} className="object-contain" />
            </div>
        );
    }

    // Otherwise render as JSX element
    return (
        <div className={cn("flex items-center justify-center", className)} {...props}>
            {imgSrc}
        </div>
    );
}
