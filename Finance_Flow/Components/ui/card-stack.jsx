import React from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function CardStack({
  cards,
  limit = 3,
  direction = "right",
  gap = 3,
  rotation = 2,
  className,
  ...props
}) {
  const displayCards = cards.slice(0, limit)

  return (
    <div
      className={cn("relative w-full max-w-md", className)}
      {...props}
    >
      {displayCards.map((card, index) => {
        // Calculate offset based on direction and index
        const offsetDirection = direction === "right"
          ? { right: `${index * gap}%` }
          : { left: `${index * gap}%` }

        // Alternate rotation
        const rotate = index % 2 === 0
          ? `rotate-${rotation}`
          : `rotate-${-rotation}`

        return (
          <Card
            key={index}
            className={cn(
              "absolute top-0 w-full shadow-xl transition-all duration-200 hover:translate-y-0",
              rotate,
              index === 0 && "relative z-30 shadow-xl hover:-translate-y-1",
              index === 1 && "z-20 shadow-lg hover:-translate-y-1",
              index === 2 && "z-10 shadow-md hover:-translate-y-1",
            )}
            style={{
              ...offsetDirection,
              marginTop: `${index * 10}px`
            }}
          >
            {card}
          </Card>
        )
      })}
    </div>
  )
}