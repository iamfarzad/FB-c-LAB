import { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

interface LoadingProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
}

function Loading({ 
  className, 
  size = 'md', 
  variant = 'spinner', 
  text,
  ...props 
}: LoadingProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  if (variant === 'spinner') {
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        <div className={cn(
          'animate-spin rounded-full border-2 border-current border-t-transparent',
          sizes[size]
        )} />
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'dots') {
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        <div className="flex space-x-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={cn(
                'rounded-full bg-current animate-pulse',
                size === 'sm' ? 'w-1 h-1' : size === 'md' ? 'w-1.5 h-1.5' : 'w-2 h-2'
              )}
              style={{
                animationDelay: `${i * 0.15}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
        {text && (
          <span className={cn('text-muted-foreground', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  if (variant === 'pulse') {
    return (
      <div className={cn('flex items-center gap-2', className)} {...props}>
        <div className={cn(
          'rounded-full bg-current animate-pulse',
          sizes[size]
        )} />
        {text && (
          <span className={cn('text-muted-foreground animate-pulse', textSizes[size])}>
            {text}
          </span>
        )}
      </div>
    )
  }

  return null
}

// Skeleton loader component
interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
}

function Skeleton({ className, width, height, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
      style={{
        width,
        height,
        ...style
      }}
      {...props}
    />
  )
}

export { Loading, Skeleton } 