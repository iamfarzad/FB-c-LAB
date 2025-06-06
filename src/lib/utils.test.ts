import { cn, responsiveClasses, getCurrentBreakpoint, breakpoints, matchesMediaQuery, debounce, throttle, generateId } from './utils';

jest.useFakeTimers();

describe('cn', () => {
  it('should merge class names correctly', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes', () => {
    expect(cn('text-red-500', { 'bg-blue-500': true, 'font-bold': false })).toBe('text-red-500 bg-blue-500');
  });

  it('should override conflicting classes with tailwind-merge', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2'); // tailwind-merge behavior
  });

  it('should handle empty strings, null, and undefined inputs', () => {
    expect(cn('text-red-500', '', null, undefined, 'bg-blue-500')).toBe('text-red-500 bg-blue-500');
  });

  it('should return an empty string if no valid class names are provided', () => {
    expect(cn('', null, undefined)).toBe('');
  });
});

describe('responsiveClasses', () => {
  it('should return base class if no breakpoint classes are provided', () => {
    expect(responsiveClasses({ base: 'text-sm' })).toBe('text-sm');
  });

  it('should generate responsive classes correctly', () => {
    const classes = responsiveClasses({
      base: 'text-sm',
      sm: 'text-base',
      md: 'text-lg',
      lg: 'text-xl',
      xl: 'text-2xl',
      '2xl': 'text-3xl',
    });
    // The order might vary due to Object.entries, so we check for inclusion and structure
    expect(classes).toContain('text-sm');
    expect(classes).toContain('sm:text-base');
    expect(classes).toContain('md:text-lg');
    expect(classes).toContain('lg:text-xl');
    expect(classes).toContain('xl:text-2xl');
    expect(classes).toContain('2xl:text-3xl');
  });

  it('should handle missing base class', () => {
    const result = responsiveClasses({ sm: 'text-base', md: 'text-lg' });
    expect(result).toContain('sm:text-base');
    expect(result).toContain('md:text-lg');
  });

  it('should handle empty or undefined breakpoint classes', () => {
    const classes = responsiveClasses({
      base: 'text-sm',
      sm: '',
      md: undefined,
      lg: 'text-xl',
    });
    expect(classes).toBe('text-sm lg:text-xl');
  });

  it('should return an empty string if no classes are provided', () => {
    expect(responsiveClasses({})).toBe('');
  });
});

describe('getCurrentBreakpoint', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    // @ts-ignore
    delete global.window.innerWidth; // Clean up mocked property
  });

  it('should return "sm" if window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    global.window = undefined; // Set window to undefined
    expect(getCurrentBreakpoint()).toBe('sm');
    global.window = originalWindow; // Restore window
  });

  it('should return "sm" for widths less than md breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.sm -1 });
    expect(getCurrentBreakpoint()).toBe('sm');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.md -1 });
    expect(getCurrentBreakpoint()).toBe('sm');
  });

  it('should return "md" for widths between md and lg breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.md });
    expect(getCurrentBreakpoint()).toBe('md');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.lg - 1 });
    expect(getCurrentBreakpoint()).toBe('md');
  });

  it('should return "lg" for widths between lg and xl breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.lg });
    expect(getCurrentBreakpoint()).toBe('lg');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.xl - 1 });
    expect(getCurrentBreakpoint()).toBe('lg');
  });

  it('should return "xl" for widths between xl and 2xl breakpoints', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints.xl });
    expect(getCurrentBreakpoint()).toBe('xl');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints['2xl'] - 1 });
    expect(getCurrentBreakpoint()).toBe('xl');
  });

  it('should return "2xl" for widths greater than or equal to 2xl breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints['2xl'] });
    expect(getCurrentBreakpoint()).toBe('2xl');
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: breakpoints['2xl'] + 100 });
    expect(getCurrentBreakpoint()).toBe('2xl');
  });
});

describe('matchesMediaQuery', () => {
  const originalWindow = global.window;

  afterEach(() => {
    global.window = originalWindow;
    // @ts-ignore
    delete global.window.matchMedia; // Clean up mocked property
  });

  it('should return false if window is undefined', () => {
    const originalWindow = global.window;
    // @ts-ignore
    global.window = undefined; // Set window to undefined
    expect(matchesMediaQuery('(min-width: 768px)')).toBe(false);
    global.window = originalWindow; // Restore window
  });

  it('should return true if media query matches', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(min-width: 768px)',
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    expect(matchesMediaQuery('(min-width: 768px)')).toBe(true);
  });

  it('should return false if media query does not match', () => {
     Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false, // Simulate no match
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
    expect(matchesMediaQuery('(min-width: 1024px)')).toBe(false);
  });
});

describe('debounce', () => {
  let mockFn: jest.Mock;

  beforeEach(() => {
    mockFn = jest.fn();
    jest.clearAllTimers();
  });

  it('should call the function after the specified delay', () => {
    const debouncedFn = debounce(mockFn, 500);
    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call the function only once if called multiple times within the delay period', () => {
    const debouncedFn = debounce(mockFn, 500);
    debouncedFn();
    debouncedFn();
    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should reset the timer if called again before the delay has passed', () => {
    const debouncedFn = debounce(mockFn, 500);
    debouncedFn();
    jest.advanceTimersByTime(300);
    expect(mockFn).not.toHaveBeenCalled();
    debouncedFn();
    jest.advanceTimersByTime(300);
    expect(mockFn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(200);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should pass arguments to the debounced function', () => {
    const debouncedFn = debounce(mockFn, 500);
    const arg1 = 'test';
    const arg2 = 123;
    debouncedFn(arg1, arg2);
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledWith(arg1, arg2);
  });

  it('should maintain the `this` context of the debounced function', () => {
    const context = { value: 42 };
    const debouncedFn = debounce(function(this: any) { mockFn(this.value); }, 500);

    debouncedFn.call(context);
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledWith(42);
  });
});

describe('throttle', () => {
  let mockFn: jest.Mock;

  beforeEach(() => {
    mockFn = jest.fn();
    jest.clearAllTimers();
  });

  it('should call the function immediately on the first call', () => {
    const throttledFn = throttle(mockFn, 500);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should not call the function again if called within the time limit', () => {
    const throttledFn = throttle(mockFn, 500);
    throttledFn();
    throttledFn();
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should call the function again after the time limit has passed', () => {
    const throttledFn = throttle(mockFn, 500);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(200);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);
    throttledFn();
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should execute the last call made within the throttle period after the period ends', () => {
    const throttledFn = throttle(mockFn, 500);
    throttledFn('first');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('first');

    throttledFn('second');
    jest.advanceTimersByTime(100);
    throttledFn('third');
    jest.advanceTimersByTime(100);
    throttledFn('fourth');

    expect(mockFn).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenCalledWith('fourth');

    jest.advanceTimersByTime(1); // Ensure 'now' is measurably after 'lastCallTime'
    throttledFn('fifth');
    expect(mockFn).toHaveBeenCalledTimes(3);
    expect(mockFn).toHaveBeenCalledWith('fifth');
  });


  it('should pass arguments to the throttled function', () => {
    const throttledFn = throttle(mockFn, 500);
    const arg1 = 'test';
    const arg2 = 123;
    throttledFn(arg1, arg2);
    expect(mockFn).toHaveBeenCalledWith(arg1, arg2);

    jest.advanceTimersByTime(500);
    throttledFn('another call');
    expect(mockFn).toHaveBeenCalledWith('another call');
  });

  it('should maintain the `this` context of the throttled function', () => {
    const context = { value: 42 };
    const throttledFn = throttle(function(this: any) { mockFn(this.value); }, 500);

    throttledFn.call(context);
    expect(mockFn).toHaveBeenCalledWith(42);

    jest.advanceTimersByTime(500);
    const context2 = { value: 84 };
    throttledFn.call(context2);
    expect(mockFn).toHaveBeenCalledWith(84);
  });
});

describe('generateId', () => {
  it('should return a string', () => {
    expect(typeof generateId()).toBe('string');
  });

  it('should return unique IDs on multiple calls', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
  });

  it('should apply the prefix correctly if provided', () => {
    const prefix = 'custom';
    const id = generateId(prefix);
    expect(id.startsWith(prefix + '-')).toBe(true);
  });

  it('should use "id" as the default prefix if none is provided', () => {
    const id = generateId();
    expect(id.startsWith('id-')).toBe(true);
  });

  it('should generate an ID of the correct format', () => {
    const id = generateId('test');
    // Example: test-a1b2c3d4e
    expect(id).toMatch(/^test-[a-z0-9]{9}$/);
  });
});
