import * as React from "react"
import { cn } from "@/lib/utils"

const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  return (
    <main
      ref={ref}
      className={cn(
        "relative flex flex-col flex-1 bg-background overflow-hidden",
        "lg:m-4 lg:rounded-2xl lg:border lg:border-border lg:shadow-sm",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"

export { SidebarInset }
