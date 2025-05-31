import React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function AvatarStack({
  users,
  limit = 3,
  size = "md",
  showRemainder = true,
  className,
  ...props
}) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  }

  const displayUsers = users.slice(0, limit)
  const remainder = users.length - limit

  return (
    <div className={cn("flex items-center -space-x-2", className)} {...props}>
      {displayUsers.map((user, index) => (
        <Avatar
          key={index}
          className={cn(
            "border-2 border-background ring-0",
            sizeClasses[size]
          )}
        >
          <AvatarImage
            src={user.image}
            alt={user.name || "User"}
          />
          <AvatarFallback className="text-xs">
            {user.name ? user.name.charAt(0) : "U"}
          </AvatarFallback>
        </Avatar>
      ))}

      {showRemainder && remainder > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full bg-muted border-2 border-background font-medium text-muted-foreground",
            sizeClasses[size]
          )}
        >
          +{remainder}
        </div>
      )}
    </div>
  )
}