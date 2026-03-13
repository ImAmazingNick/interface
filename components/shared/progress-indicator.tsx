import { Badge } from "@/components/ui/badge"
import { BarChart3, CheckCircle2, Clock } from "lucide-react"

interface ProgressIndicatorProps {
  progress: number
  completedSteps: number
  totalSteps: number
  elapsedTime: number
  isCompleted: boolean
  isProcessing: boolean
  title?: string
  className?: string
}

export function ProgressIndicator({
  progress,
  completedSteps,
  totalSteps,
  elapsedTime,
  isCompleted,
  isProcessing,
  title,
  className = "",
}: ProgressIndicatorProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const progressPercentage = Math.round(progress)
  const statusText = isCompleted ? "Completed" : isProcessing ? "In progress" : "Ready to start"
  const ariaLabel = `${title || "Process"} progress: ${progressPercentage}% complete. ${completedSteps} of ${totalSteps} steps finished. Status: ${statusText}. Elapsed time: ${formatTime(elapsedTime)}.`

  return (
    <div
      className={`flex items-center justify-between px-3 py-2 bg-muted/10 rounded-lg border relative overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={progressPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className="absolute inset-0 bg-purple-200/30 transition-all duration-1000 ease-out"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <div className="flex items-center gap-4 relative z-10">
        {title && <h3 className="text-sm font-semibold text-foreground">{title}</h3>}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <BarChart3 className="h-3 w-3 text-purple-700" aria-hidden="true" />
            <span className="text-xs font-medium" aria-label={`${progressPercentage} percent complete`}>
              {progressPercentage}%
            </span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-purple-700" aria-hidden="true" />
            <span className="text-xs" aria-label={`${completedSteps} of ${totalSteps} steps completed`}>
              {completedSteps}/{totalSteps}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-purple-600" aria-hidden="true" />
            <span className="text-xs" aria-label={`Elapsed time: ${formatTime(elapsedTime)}`}>
              {formatTime(elapsedTime)}
            </span>
          </div>
        </div>
      </div>

      <Badge
        variant={isCompleted ? "default" : isProcessing ? "secondary" : "outline"}
        className="text-xs h-5 relative z-10"
        aria-label={`Status: ${statusText}`}
      >
        {isCompleted ? "Done" : isProcessing ? "Processing" : "Ready"}
      </Badge>
    </div>
  )
}
