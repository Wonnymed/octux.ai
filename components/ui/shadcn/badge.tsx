import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/design/cn"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm font-medium whitespace-nowrap select-none shrink-0 transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-2 text-txt-secondary",
        secondary: "bg-surface-2 text-txt-secondary border border-border-subtle",
        destructive: "bg-verdict-abandon-muted text-verdict-abandon",
        outline: "bg-transparent border border-border-default text-txt-secondary",
        proceed: "bg-verdict-proceed-muted text-verdict-proceed",
        delay: "bg-verdict-delay-muted text-verdict-delay",
        abandon: "bg-verdict-abandon-muted text-verdict-abandon",
        accent: "bg-accent-muted text-accent",
      },
      size: {
        default: "h-5 px-2 text-micro gap-1",
        xs: "h-4 px-1.5 text-[10px] gap-0.5 rounded-sm",
        sm: "h-5 px-2 text-micro gap-1 rounded-sm",
        md: "h-6 px-2.5 text-xs gap-1.5 rounded-md",
        lg: "h-6 px-2.5 text-xs gap-1.5 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
