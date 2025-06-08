import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-primary-foreground shadow hover:bg-primary/90 active:scale-95',
      secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:scale-95',
      outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:scale-95',
      ghost: 'hover:bg-accent hover:text-accent-foreground active:scale-95',
      destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-95'
    }

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-md',
      md: 'h-9 px-4 py-2 text-sm rounded-md',
      lg: 'h-10 px-8 text-base rounded-md',
      icon: 'h-9 w-9 rounded-md'
    }

    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          loading && 'pointer-events-none opacity-70',
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button } 