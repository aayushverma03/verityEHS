// Badge component based on shadcn/ui
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-teal-700 text-white",
        secondary: "border-transparent bg-stone-100 text-stone-700",
        destructive: "border-transparent bg-red-600 text-white",
        outline: "border-stone-300 text-stone-700",
        success: "border-transparent bg-emerald-600 text-white",
        warning: "border-transparent bg-amber-500 text-white",
        danger: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
