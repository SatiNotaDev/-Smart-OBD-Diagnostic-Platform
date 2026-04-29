import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        {
          "bg-primary/8 text-primary": variant === "default",
          "bg-success/8 text-success": variant === "success",
          "bg-warning/8 text-warning": variant === "warning",
          "bg-error/8 text-error": variant === "error",
        },
        className
      )}
      {...props}
    />
  );
}

Badge.displayName = "Badge";
export { Badge, type BadgeProps };
