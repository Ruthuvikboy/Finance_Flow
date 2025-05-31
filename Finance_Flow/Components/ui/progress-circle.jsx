import * as React from "react"
import { cn } from "@/lib/utils"

export const ProgressCircle = React.forwardRef(
  ({ className, size = "md", value, max = 100, thickness = 5, color = "primary", showValue = true, ...props }, ref) => {
    const percentage = (value / max) * 100;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = `${circumference} ${circumference}`;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
      primary: "stroke-blue-500",
      secondary: "stroke-purple-500",
      success: "stroke-green-500",
      danger: "stroke-red-500",
      warning: "stroke-amber-500",
    };

    const sizeClasses = {
      sm: "h-16 w-16",
      md: "h-24 w-24",
      lg: "h-32 w-32",
      xl: "h-40 w-40",
    };

    return (
      <div
        className={cn("relative inline-flex items-center justify-center shrink-0", sizeClasses[size], className)}
        ref={ref}
        {...props}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            className="stroke-gray-200"
            strokeWidth={thickness}
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            className={colorClasses[color]}
            strokeWidth={thickness}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center text-lg font-medium">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)

ProgressCircle.displayName = "ProgressCircle"