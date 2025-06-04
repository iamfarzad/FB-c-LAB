"use client";

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
  squares = [],
  cellSize = 4,
  className,
  ...props
}: InteractiveGridPatternProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
  const [mousePosition, setMousePosition] = React.useState<{ x: number; y: number } | null>(
    null
  )
  const [isHovered, setIsHovered] = React.useState(false)

  // Update dimensions on mount and window resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setDimensions({ width, height })
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

  // Calculate the number of cells in the grid
  const width = widthProp || dimensions.width
  const height = heightProp || dimensions.height
  const numCols = Math.ceil(width / size) + 1
  const numRows = Math.ceil(height / size) + 1

  // Generate the grid cells
  const cells = []
  for (let i = 0; i < numRows; i++) {
    for (let j = 0; j < numCols; j++) {
      const x = j * size
      const y = i * size
      const isActive = squares.some(([row, col]) => row === i && col === j)
      
      cells.push(
        <div
          key={`${i}-${j}`}
          className={cn(
            "absolute rounded-full bg-current transition-all duration-300 ease-in-out",
            isActive ? "opacity-100" : "opacity-10"
          )}
          style={{
            width: cellSize,
            height: cellSize,
            left: x - cellSize / 2,
            top: y - cellSize / 2,
            transform: mousePosition
              ? `translate(${(mousePosition.x - x) / 20}px, ${(mousePosition.y - y) / 20}px)`
              : "translate(0, 0)",
            transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
          }}
        />
      )
    }
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        interactive && "pointer-events-auto",
        className
      )}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseEnter={() => interactive && setIsHovered(true)}
      onMouseLeave={() => interactive && setIsHovered(false)}
      {...props}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-300",
          isHovered && interactive ? "opacity-100" : "opacity-70"
        )}
      >
        {cells}
      </div>
    </div>
  )
}
