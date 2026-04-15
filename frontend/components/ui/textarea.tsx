// Textarea component based on shadcn/ui
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[60px] w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-800 placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:border-teal-600 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
