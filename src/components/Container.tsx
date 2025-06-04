import { ReactNode } from 'react';

interface ContainerProps {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  as?: keyof JSX.IntrinsicElements;
}

export function Container({
  children,
  className = '',
  size = 'xl',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  const maxWidth = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }[size];

  return (
    <Component
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${maxWidth} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Container;
