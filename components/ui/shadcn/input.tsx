import * as React from "react"

import { cn } from "@/lib/design/cn"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-border-default bg-surface-1 px-3 py-1 text-sm text-txt-primary shadow-sm transition-all duration-normal ease-out",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-txt-primary",
          "placeholder:text-txt-disabled",
          "focus-visible:outline-none focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent/30",
          "disabled:cursor-not-allowed disabled:opacity-40",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
