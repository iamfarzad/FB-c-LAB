import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
// Import the actual module components and hooks
import * as responsiveModule from './responsive.tsx';
import { WithBreakpoint } from './responsive.tsx';

// DO NOT use jest.mock for './responsive.tsx' if using jest.spyOn for its exports

describe('WithBreakpoint Component', () => {
  const TestChild = () => <div>Child Content</div>;

  afterEach(() => {
    // Restore all mocks/spies after each test to avoid interference
    jest.restoreAllMocks();
  });

  // Test cases based on previous failures and instructions

  // 1. above="md", current='sm': Expected not to render.
  it('should not render children when "above" is "md" and current is "sm"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('sm');
    render(<WithBreakpoint above="md"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  // 2. below="md", current='sm': Expected to render.
  it('should render children when "below" is "md" and current is "sm"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('sm');
    render(<WithBreakpoint below="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  // 3. only="md", current='md': Expected to render.
  it('should render children when "only" is "md" and current is "md"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint only="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  // 4. only=['sm', 'lg'], current='md': Expected not to render.
  it('should not render children when "only" is ["sm", "lg"] and current is "md"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint only={['sm', 'lg']}><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  // Additional test cases

  it('should render children when "above" is "sm" and current is "md"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint above="sm"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render children when "below" is "lg" and current is "xl"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('xl');
    render(<WithBreakpoint below="lg"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });

  it('should render children when "only" is ["md", "xl"] and current is "xl"', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('xl');
    render(<WithBreakpoint only={['md', 'xl']}><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render children if no props are specified (default behavior)', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should render children when "above" is "md" and current is "md" (inclusive)', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint above="md"><TestChild /></WithBreakpoint>);
    expect(screen.getByText('Child Content')).toBeInTheDocument();
  });

  it('should not render children when "below" is "md" and current is "md" (exclusive)', () => {
    jest.spyOn(responsiveModule, 'useCurrentBreakpoint').mockReturnValue('md');
    render(<WithBreakpoint below="md"><TestChild /></WithBreakpoint>);
    expect(screen.queryByText('Child Content')).toBeNull();
  });
});
