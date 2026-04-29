import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium border",
        {
          "border-border bg-accent text-foreground": variant === "default",
          "border-success/20 bg-success/10 text-success": variant === "success",
          "border-warning/20 bg-warning/10 text-warning": variant === "warning",
          "border-error/20 bg-error/10 text-error": variant === "error",
        },
        className
      )}
      {...props}
    />
  );
}

Badge.displayName = "Badge";
export { Badge, type BadgeProps };
