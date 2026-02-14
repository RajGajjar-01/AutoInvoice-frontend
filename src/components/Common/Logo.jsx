import { Link } from "@tanstack/react-router";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function Logo({ variant = "full", className, asLink = true, }) {
    const content = (
        <div className={cn("flex items-center gap-2 font-bold text-xl", className)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                AI
            </div>
            {variant === "full" && <span>AutoInvoice</span>}
        </div>
    );

    if (!asLink) {
        return content;
    }
    return <Link to="/" className="no-underline text-foreground">{content}</Link>;
}
