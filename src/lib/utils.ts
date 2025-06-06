import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Breakpoints matching Tailwind's default breakpoints
export const breakpoints: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

/**
 * Utility function to merge class names with Tailwind CSS
 * @param inputs - Class names to be merged
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates responsive class names based on breakpoints
 * @param classes - Object with breakpoint keys and class names
 * @returns Responsive class names string
 *
 * @example
 * responsiveClasses({
 *   base: 'text-sm',
 *   sm: 'text-base',
 *   md: 'text-lg',
 *   lg: 'text-xl',
 *   xl: 'text-2xl',
 *   '2xl': 'text-3xl'
 * })
 */
export function responsiveClasses(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
  '2xl'?: string;
}): string {
  const { base = '', ...breakpointClasses } = classes;
  
  return [
    base,
    ...Object.entries(breakpointClasses).map(([breakpoint, className]) => {
      if (!className) return '';
      return `${breakpoint === 'sm' ? 'sm:' : breakpoint + ':'}${className}`;
    })
  ].filter(Boolean).join(' ');
}

/**
 * Gets the current breakpoint based on window width
 * @returns Current breakpoint
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === 'undefined') return 'sm';
  
  const width = window.innerWidth;
  
  if (width >= breakpoints['2xl']) return '2xl';
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  return 'sm';
}

/**
 * Checks if the current viewport matches a media query
 * @param query - Media query string
 * @returns Boolean indicating if the media query matches
 */
export function matchesMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(query).matches;
}

/**
 * Debounce function for resize/scroll events
 * @param fn - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle function for scroll/resize events
 * @param fn - Function to throttle
 * @param limit - Time limit in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastArgs: Parameters<T> | null = null;
  let lastThis: any = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0; // Tracks when the function was last called (either immediately or via timeout)

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    if (timeoutId === null) { // Not currently in a cooldown period (no trailing call scheduled)
      if (now - lastCallTime >= limit) { // Enough time has passed since the last actual call
        fn.apply(lastThis, lastArgs);
        lastCallTime = now;
      } else { // Not enough time passed, schedule it (trailing call)
        // Ensure existing timeout is cleared before setting a new one
        if (timeoutId) clearTimeout(timeoutId); // Should not be needed due to outer if, but safe
        timeoutId = setTimeout(() => {
          fn.apply(lastThis, lastArgs!); // Apply with the last arguments received
          lastCallTime = Date.now();
          timeoutId = null; // Clear timeoutId after execution
        }, limit - (now - lastCallTime)); // Time remaining until limit is met
      }
    }
    // If timeoutId is not null, it means a call is already scheduled.
    // The latest args & this will be picked up by that scheduled call because lastArgs and lastThis are updated above.
  };
}


/**
 * Generates a unique ID
 * @param prefix - Optional prefix for the ID
 * @returns A unique ID string
 */
export function generateId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
}
