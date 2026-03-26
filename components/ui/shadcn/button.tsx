import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/design/cn"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-normal ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-0 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-accent text-white shadow-sm hover:bg-accent-hover active:bg-accent-active",
        destructive:
          "bg-verdict-abandon/10 text-verdict-abandon hover:bg-verdict-abandon/20 active:bg-verdict-abandon/30",
        outline:
          "border border-border-default bg-transparent text-txt-secondary shadow-sm hover:bg-surface-2 hover:text-txt-primary",
        secondary:
          "bg-surface-2 text-txt-primary hover:bg-surface-3 active:bg-surface-3 border border-border-subtle",
        ghost:
          "bg-transparent text-txt-secondary hover:bg-surface-2 hover:text-txt-primary active:bg-surface-3",
        link: "text-accent underline-offset-4 hover:underline",
        accent:
          "bg-accent-muted text-accent hover:bg-accent-glow active:bg-accent/20",
      },
      size: {
        default: "h-9 px-4 py-2",
        xs: "h-6 px-2 text-micro gap-1 rounded-sm",
        sm: "h-8 rounded-md px-3 text-xs gap-1.5",
        md: "h-9 px-4 text-sm gap-2 rounded-md",
        lg: "h-11 rounded-lg px-6 text-base gap-2.5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
