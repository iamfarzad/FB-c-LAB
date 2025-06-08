import { ReactNode, HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'
import { Container } from './Container'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  variant?: 'default' | 'accent' | 'muted'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

function Section({ 
  children, 
  variant = 'default',
  size = 'lg',
  containerSize = 'xl',
  className,
  ...props 
}: SectionProps) {
  const variants = {
    default: 'bg-background',
    accent: 'bg-accent/5',
    muted: 'bg-muted/20'
  }

  const sizes = {
    sm: 'py-8 sm:py-12',
    md: 'py-12 sm:py-16',
    lg: 'py-16 sm:py-20',
    xl: 'py-20 sm:py-24'
  }

  return (
    <section 
      className={cn(
        'relative',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <Container size={containerSize}>
        {children}
      </Container>
    </section>
  )
}

export { Section } 