import { useState, useEffect, ReactNode } from 'react';

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof breakpoints;

// Actual useCurrentBreakpoint (will be mocked by Jest in tests)
export function useCurrentBreakpoint(): Breakpoint {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');
  useEffect(() => {
    const checkBreakpoint = () => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 0;
      if (width >= breakpoints['2xl']) setCurrentBreakpoint('2xl');
      else if (width >= breakpoints.xl) setCurrentBreakpoint('xl');
      else if (width >= breakpoints.lg) setCurrentBreakpoint('lg');
      else if (width >= breakpoints.md) setCurrentBreakpoint('md');
      else setCurrentBreakpoint('sm');
    };
    if (typeof window !== 'undefined') {
      checkBreakpoint();
      window.addEventListener('resize', checkBreakpoint);
      return () => window.removeEventListener('resize', checkBreakpoint);
    }
  }, []);
  return currentBreakpoint;
}

type WithBreakpointProps = {
  children: ReactNode;
  above?: Breakpoint;
  below?: Breakpoint;
  only?: Breakpoint | Breakpoint[];
};

export function WithBreakpoint({
  children,
  above,
  below,
  only
}: WithBreakpointProps) {
  const currentBreakpoint = useCurrentBreakpoint(); // This will be mocked in tests
  let render = false; // Default to false

  if (above) {
    render = breakpoints[currentBreakpoint] >= breakpoints[above];
  } else if (below) {
    render = breakpoints[currentBreakpoint] < breakpoints[below];
  } else if (only) {
    const onlyArray = Array.isArray(only) ? only : [only];
    render = onlyArray.includes(currentBreakpoint);
  } else {
    // If none of above, below, or only are specified, always render
    render = true;
  }

  return render ? <>{children}</> : null;
}
