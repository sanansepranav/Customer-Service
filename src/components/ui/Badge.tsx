import * as React from "react"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-slate-100 text-slate-700 ring-1 ring-slate-200/50",
      success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50",
      warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/50",
      danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50",
      info: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/50"
    };

    return (
      <div
        ref={ref}
        className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase shadow-sm ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
