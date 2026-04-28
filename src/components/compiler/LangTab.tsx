import { cn } from "../../lib/utils";
import type { LangConfig, LangKey } from "../../lib/lagnConfig";

interface LangTabProps {
    langKey: LangKey
    config: LangConfig
    active: boolean
    onClick: () => void
}

export function LangTab({ config, active, onClick }: LangTabProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "inline-flex items-center gap-2 px-3 py-2 text-xs font-medium",
                "rounded-t-lg border border-transparent border-b-0",
                "transition-all duration-150 whitespace-nowrap outline-none",
                "font-sans antialiased cursor-pointer",

                active
                    ? "bg-background text-foreground border-border -mb-px"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            )}
        >
            <span
                className="size-2 rounded-full shrink-0 transition-opacity duration-150"
                style={{
                    backgroundColor: config.color,
                    opacity: active ? 1 : 0.4,
                }}
            />
            {config.label}
        </button>
    )
}