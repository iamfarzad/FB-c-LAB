import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
// Import the actual module components and hooks
import * as responsiveModule from './responsive.tsx';
import { WithBreakpoint, breakpoints } from './responsive.tsx';
import type { Breakpoint as BreakpointType } from './responsive.tsx';

// DO NOT use jest.mock for './responsive.tsx' if using jest.spyOn for its exports

// Helper to make the spied useCurrentBreakpoint return a specific value
const mockSetCurrentBreakpoint = (breakpoint: BreakpointType) => {
  // Ensure we are spying on the useCurrentBreakpoint function from the imported module
  // and setting its mockReturnValue for the duration of a test.
  // The spy should be set up per test or group of tests if different return values are needed.
  // For this helper, we assume the spy is already in place or will be setup in `beforeEach`.
  // However, to make it self-contained for this helper's purpose IF CALLED PER TEST:
  // This is not ideal as spies should be restored.
  // A better pattern is spy in beforeEach/test, restore in afterEach.
  return jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue(breakpoint);
};

describe('WithBreakpoint Component', () => {
  const TestChild = () => <div>Child Content</div>;
  let useCurrentBreakpointSpy: jest.SpyInstance;

  beforeEach(() => {
    // Default spy implementation for each test if needed, or specific setup
    // This will ensure that for each test, we are starting with a fresh spy setup if we want.
    // For now, individual tests will set up their own spy return value.
  });

  afterEach(() => {
    // Restore all mocks/spies after each test to avoid interference
    jest.restoreAllMocks();
  });

  // Test cases based on previous failures and instructions

  // 1. above="md", current='sm': Expected not to render.
  it('should not render children when "above" is "md" and current is "sm"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('sm');
    render(<WithBreakpoint above="md"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  // 2. below="md", current='sm': Expected to render.
  it('should render children when "below" is "md" and current is "sm"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('sm');
    render(<WithBreakpoint below="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  // 3. only="md", current='md': Expected to render.
  it('should render children when "only" is "md" and current is "md"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint only="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  // 4. only=['sm', 'lg'], current='md': Expected not to render.
  it('should not render children when "only" is ["sm", "lg"] and current is "md"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint only={['sm', 'lg']}><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  // Additional test cases

  it('should render children when "above" is "sm" and current is "md"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint above="sm"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render children when "below" is "lg" and current is "xl"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('xl');
    render(<WithBreakpoint below="lg"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  it('should render children when "only" is ["md", "xl"] and current is "xl"', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('xl');
    render(<WithBreakpoint only={['md', 'xl']}><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render children if no props are specified (default behavior)', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render children when "above" is "md" and current is "md" (inclusive)', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint above="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render children when "below" is "md" and current is "md" (exclusive)', () => {
    useCurrentBreakpointSpy = jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint below="md"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });
});
