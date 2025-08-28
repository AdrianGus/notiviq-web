import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  variant?: "default" | "destructive" | "secondary" | "outline"
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, loading, variant = "default", children, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"

    const variants: Record<typeof variant, string> = {
      default:
        "bg-black text-white hover:bg-neutral-900 active:bg-neutral-950 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2",
      destructive:
        "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2",
      secondary:
        "bg-neutral-200 text-neutral-800 hover:bg-neutral-300 active:bg-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2",
      outline:
        "border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-100 active:bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:ring-offset-2",
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], className)}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"