"use client"

import { memo, useCallback } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCircle, Circle } from "lucide-react"
import type { StepNavigationProps, Step } from "@/types"

const StepItem = memo(function StepItem({
  step,
  index,
  isActive,
  onSelect,
  isCollapsed,
}: {
  step: Step
  index: number
  isActive: boolean
  onSelect: (stepId: string) => void
  isCollapsed: boolean
}) {
  const isCompleted = step.completed

  const handleClick = useCallback(() => {
    onSelect(step.id)
  }, [step.id, onSelect])

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-3 h-11 text-left font-medium rounded-lg transition-all duration-300 ease-out cursor-pointer",
        isActive
          ? "bg-primary/10 border border-primary/20 shadow-sm hover:bg-primary/15 hover:border-primary/30 hover:shadow-md hover:scale-[1.02] hover:-translate-y-0.5"
          : "hover:bg-muted/60 hover:border hover:border-border/60 hover:shadow-md hover:scale-[1.01] hover:-translate-y-0.5",
        isCollapsed && "justify-center",
      )}
      onClick={handleClick}
    >
      <div className={cn("flex items-center gap-3 w-full", isCollapsed && "justify-center")}>
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-4 w-4 text-primary" />
          ) : (
            <div className="relative">
              <Circle
                className={cn(
                  "h-4 w-4 transition-colors duration-200",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-muted-foreground">
                {index + 1}
              </span>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "font-medium transition-colors duration-200",
                isActive ? "text-primary" : "text-card-foreground",
              )}
            >
              {step.title}
            </h3>
          </div>
        )}
      </div>
    </Button>
  )
})

export const StepNavigation = memo(function StepNavigation({
  steps,
  currentStep,
  onStepSelect,
  isCollapsed = false,
  onToggleCollapse,
}: StepNavigationProps & {
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}) {
  const handleStepSelect = useCallback(
    (stepId: string) => {
      onStepSelect(stepId)
    },
    [onStepSelect],
  )

  return (
    <div
      className={cn(
        "bg-gray-50 border-r border-border transition-all duration-300 relative",
        isCollapsed ? "w-16 min-w-16" : "w-64 min-w-64",
      )}
    >
      {/* Full-height Resize Handle */}
      {onToggleCollapse && (
        <div
          className="absolute right-0 top-0 bottom-0 w-6 cursor-col-resize transition-all duration-300 group z-10"
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onMouseEnter={() => {
            document.body.style.cursor = 'col-resize'
          }}
          onMouseLeave={() => {
            document.body.style.cursor = 'default'
          }}
        >
          {/* Elegant hover background with gradient */}
          <div className="absolute inset-0 bg-gradient-to-l from-sidebar-accent/15 via-sidebar-accent/8 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out"></div>

          {/* Subtle animated border line */}
          <div className="absolute right-0 top-0 bottom-0 w-px bg-sidebar-border group-hover:bg-sidebar-accent/60 transition-all duration-300"></div>

          {/* Animated dots indicator */}
          <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-400 delay-150">
            <div className="w-1.5 h-1.5 bg-sidebar-foreground/30 rounded-full animate-pulse transition-all duration-300 group-hover:bg-sidebar-foreground/50"></div>
            <div className="w-1 h-1 bg-sidebar-foreground/50 rounded-full animate-pulse delay-100 transition-all duration-300 group-hover:bg-sidebar-foreground/70"></div>
            <div className="w-1.5 h-1.5 bg-sidebar-foreground/30 rounded-full animate-pulse delay-200 transition-all duration-300 group-hover:bg-sidebar-foreground/50"></div>
          </div>

          {/* Subtle ripple effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-sidebar-accent/20 rounded-full animate-ping"></div>
          </div>
        </div>
      )}

      <div className={cn("border-b border-border", isCollapsed ? "p-4" : "p-6 pr-8")}>
        {!isCollapsed && <h2 className="text-base font-heading font-semibold text-card-foreground">Cross-channel Performance</h2>}
      </div>

      <div className={cn("space-y-1", isCollapsed ? "px-2 py-4" : "px-4 py-6")}>
        {steps.map((step, index) => (
          <StepItem
            key={step.id}
            step={step}
            index={index}
            isActive={currentStep === step.id}
            onSelect={handleStepSelect}
            isCollapsed={isCollapsed}
          />
        ))}
      </div>
    </div>
  )
})
