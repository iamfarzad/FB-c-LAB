import * as React from "react"
import { cn } from "../../lib/utils"

export interface InteractiveGridPatternProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: number
  width?: number
  height?: number
  interactive?: boolean
  squares?: Array<[number, number]>
  cellSize?: number
  className?: string
}

export function InteractiveGridPattern({
  size = 40,
  width: widthProp,
  height: heightProp,
  interactive = true,
  squares = [
    [4, 4],
    [5, 1],
    [8, 5],
    [5, 6],
    [5, 8],
    [9, 10],
    [1, 3],
    [12, 3],
    [3, 8],
    [11, 14],
  ],
  cellSize = 4,
  className,
  ...props
}: InteractiveGridPatternProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = React.useState<{ x: number; y: number } | null>(
    null
  )

  // Update dimensions on mount and window resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        // You can get width and height here if needed for other calculations
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return

    const { left, top } = containerRef.current.getBoundingClientRect()
    const x = e.clientX - left
    const y = e.clientY - top
    setMousePosition({ x, y })
  }

  // Generate the grid pattern with SVG
  const gridId = React.useMemo(() => `grid-${Math.random().toString(36).substr(2, 9)}`, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full overflow-hidden",
        interactive && "pointer-events-auto",
        className
      )}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={() => interactive}
      onMouseLeave={() => interactive}
      {...props}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id={gridId}
            width={size}
            height={size}
            patternUnits="userSpaceOnUse"
          >
            <path
              d={`M ${size} 0 L 0 0 0 ${size}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="opacity-30"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${gridId})`}
          className="text-muted-foreground/20"
        />
        
        {/* Interactive squares */}
        {squares.map(([row, col], index) => {
          const x = col * size
          const y = row * size
          
          let scale = 1
          if (mousePosition && interactive) {
            const distance = Math.sqrt((mousePosition.x - x) ** 2 + (mousePosition.y - y) ** 2)
            scale = Math.max(1, 1.5 - distance / 200)
          }
          
          return (
            <rect
              key={index}
              x={x}
              y={y}
              width={size}
              height={size}
              fill="currentColor"
              className="opacity-20 transition-all duration-300 ease-out"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: `${x + size/2}px ${y + size/2}px`,
              }}
            />
          )
        })}
      </svg>
    </div>
  )
}
