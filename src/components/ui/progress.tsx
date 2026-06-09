import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0-100
  tone?: "primary" | "secondary" | "warning" | "danger";
}

const toneBg: Record<NonNullable<ProgressProps["tone"]>, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  warning: "bg-warning",
  danger: "bg-danger",
};

export function Progress({ value, tone = "primary", className, ...props }: ProgressProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all", toneBg[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
