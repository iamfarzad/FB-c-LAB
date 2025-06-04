import { ReactNode } from 'react';
import { cn } from '../lib/utils';

interface GridProps {
  children: ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
  sm?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
  md?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
  lg?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
  xl?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'none';
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gapX?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  gapY?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  as?: keyof JSX.IntrinsicElements;
}

export function Grid({
  children,
  className = '',
  cols = 1,
  sm,
  md,
  lg,
  xl,
  gap = 4,
  gapX,
  gapY,
  as: Component = 'div',
  ...props
}: GridProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    7: 'grid-cols-7',
    8: 'grid-cols-8',
    9: 'grid-cols-9',
    10: 'grid-cols-10',
    11: 'grid-cols-11',
    12: 'grid-cols-12',
    none: 'grid-cols-none',
  };

  const gapClasses = {
    0: 'gap-0',
    1: 'gap-1',
    2: 'gap-2',
    3: 'gap-3',
    4: 'gap-4',
    5: 'gap-5',
    6: 'gap-6',
    7: 'gap-7',
    8: 'gap-8',
    9: 'gap-9',
    10: 'gap-10',
    11: 'gap-11',
    12: 'gap-12',
  };

  const gapXClasses = {
    0: 'gap-x-0',
    1: 'gap-x-1',
    2: 'gap-x-2',
    3: 'gap-x-3',
    4: 'gap-x-4',
    5: 'gap-x-5',
    6: 'gap-x-6',
    7: 'gap-x-7',
    8: 'gap-x-8',
    9: 'gap-x-9',
    10: 'gap-x-10',
    11: 'gap-x-11',
    12: 'gap-x-12',
  };

  const gapYClasses = {
    0: 'gap-y-0',
    1: 'gap-y-1',
    2: 'gap-y-2',
    3: 'gap-y-3',
    4: 'gap-y-4',
    5: 'gap-y-5',
    6: 'gap-y-6',
    7: 'gap-y-7',
    8: 'gap-y-8',
    9: 'gap-y-9',
    10: 'gap-y-10',
    11: 'gap-y-11',
    12: 'gap-y-12',
  };

  const classes = cn(
    'grid w-full',
    gridCols[cols],
    sm && `sm:${gridCols[sm]}`,
    md && `md:${gridCols[md]}`,
    lg && `lg:${gridCols[lg]}`,
    xl && `xl:${gridCols[xl]}`,
    gapClasses[gap],
    gapX && gapXClasses[gapX],
    gapY && gapYClasses[gapY],
    className
  );

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}

export default Grid;
