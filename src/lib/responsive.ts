import { useState, useEffect } from 'react';

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type Breakpoint = keyof typeof breakpoints;

/**
 * Hook to check if current viewport matches a given breakpoint
 * @param breakpoint The breakpoint to check against (sm, md, lg, xl, 2xl)
 * @returns boolean indicating if the viewport matches the breakpoint
 */
export function useBreakpoint(breakpoint: Breakpoint): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${breakpoints[breakpoint]}px)`);
    
    // Initial check
    setMatches(mediaQuery.matches);
    
    // Add listener for changes
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQuery.addEventListener('change', handler);
    
    // Cleanup
    return () => mediaQuery.removeEventListener('change', handler);
  }, [breakpoint]);

  return matches;
}

/**
 * Hook to check if current viewport is mobile (less than md breakpoint)
 * @returns boolean indicating if the viewport is mobile
 */
export function useIsMobile(): boolean {
  const isMd = useBreakpoint('md');
  return !isMd;
}

/**
 * Hook to check if current viewport is tablet (between md and lg breakpoints)
 * @returns boolean indicating if the viewport is tablet
 */
export function useIsTablet(): boolean {
  const isMd = useBreakpoint('md');
  const isLg = useBreakpoint('lg');
  return isMd && !isLg;
}

/**
 * Hook to check if current viewport is desktop (lg breakpoint and above)
 * @returns boolean indicating if the viewport is desktop
 */
export function useIsDesktop(): boolean {
  return useBreakpoint('lg');
}

/**
 * Hook to get the current breakpoint
 * @returns The current breakpoint key (sm, md, lg, xl, 2xl)
 */
export function useCurrentBreakpoint(): Breakpoint {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('sm');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width >= breakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= breakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= breakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= breakpoints.md) {
        setCurrentBreakpoint('md');
      } else {
        setCurrentBreakpoint('sm');
      }
    };

    // Initial check
    checkBreakpoint();
    
    // Add resize listener
    window.addEventListener('resize', checkBreakpoint);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return currentBreakpoint;
}

/**
 * Higher-order component that only renders its children on specific breakpoints
 */
type WithBreakpointProps = {
  children: React.ReactNode;
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
  const currentBreakpoint = useCurrentBreakpoint();
  let shouldRender = true;

  if (above) {
    shouldRender = breakpoints[currentBreakpoint] >= breakpoints[above];
  } else if (below) {
    shouldRender = breakpoints[currentBreakpoint] < breakpoints[below];
  } else if (only) {
    const onlyArray = Array.isArray(only) ? only : [only];
    shouldRender = onlyArray.includes(currentBreakpoint);
  }

  return shouldRender ? <>{children}</> : null;
}

/**
 * Utility to generate responsive styles based on breakpoints
 * @param values Object with breakpoint keys and corresponding style values
 * @param styleProp The CSS property to apply the values to
 * @returns Responsive style object
 */
export function responsiveStyle<T>(
  values: Partial<Record<Breakpoint, T>>,
  styleProp: string
): Record<string, T> {
  const result: Record<string, T> = {};
  
  Object.entries(values).forEach(([breakpoint, value]) => {
    if (breakpoint === 'sm') {
      result[styleProp] = value as T;
    } else {
      result[`@media (min-width: ${breakpoints[breakpoint as Breakpoint]}px)`] = {
        [styleProp]: value
      };
    }
  });
  
  return result;
}
