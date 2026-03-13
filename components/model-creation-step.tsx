"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, CheckCircle2, Loader2, BarChart3, Clock, ExternalLink } from "lucide-react"

interface DataSourceStep {
  id: string
  name: string
  symbol: string
  color: string
  status: "pending" | "processing" | "completed" | "error"
  substeps: {
    id: string
    title: string
    status: "pending" | "processing" | "completed" | "error"
  }[]
}

const initialDataSources: DataSourceStep[] = [
  {
    id: "google-ads",
    name: "Google Ads",
    symbol: "G",
    color: "bg-blue-500",
    status: "pending",
    substeps: [
      { id: "connect", title: "Check connection", status: "pending" },
      { id: "extract", title: "Extract Data", status: "pending" },
      { id: "process", title: "Process & Clean", status: "pending" },
      { id: "dashboard", title: "Build Dashboard", status: "pending" },
    ],
  },
  {
    id: "meta-ads",
    name: "Meta Ads",
    symbol: "M",
    color: "bg-indigo-500",
    status: "pending",
    substeps: [
      { id: "connect", title: "Check connection", status: "pending" },
      { id: "extract", title: "Extract Data", status: "pending" },
      { id: "process", title: "Process & Clean", status: "pending" },
      { id: "dashboard", title: "Build Dashboard", status: "pending" },
    ],
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    symbol: "K",
    color: "bg-purple-500",
    status: "pending",
    substeps: [
      { id: "connect", title: "Check connection", status: "pending" },
      { id: "extract", title: "Extract Data", status: "pending" },
      { id: "process", title: "Process & Clean", status: "pending" },
      { id: "dashboard", title: "Build Dashboard", status: "pending" },
    ],
  },
  {
    id: "cross-channel",
    name: "Cross-channel dashboard",
    symbol: "C",
    color: "bg-emerald-500",
    status: "pending",
    substeps: [
      { id: "model", title: "Build Model", status: "pending" },
      { id: "structure", title: "Prepare Data Structures", status: "pending" },
      { id: "dashboard", title: "Build Dashboard", status: "pending" },
    ],
  },
]

const SubstepItem = memo(
  ({
    substep,
    isActive,
    isCompleted,
    isProcessing,
  }: {
    substep: { id: string; title: string; status: "pending" | "processing" | "completed" | "error" }
    isActive: boolean
    isCompleted: boolean
    isProcessing: boolean
  }) => (
    <div
      className={`flex items-center gap-2 px-2 py-1 rounded text-xs transition-all duration-300 ${
        isActive ? "text-purple-700" : isCompleted ? "text-muted-foreground" : "text-muted-foreground"
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="h-3 w-3 text-purple-700 flex-shrink-0" />
      ) : isProcessing ? (
        <Loader2 className="h-3 w-3 animate-spin text-purple-600 flex-shrink-0" />
      ) : (
        <div className="h-3 w-3 rounded-full border border-current opacity-30 flex-shrink-0" />
      )}
      <span className="font-medium">{substep.title}</span>
    </div>
  ),
)

SubstepItem.displayName = "SubstepItem"

const DataSourceItem = memo(
  ({
    source,
    sourceIndex,
    currentSourceIndex,
    currentSubstepIndex,
    isExpanded,
    onToggleExpansion,
  }: {
    source: DataSourceStep
    sourceIndex: number
    currentSourceIndex: number
    currentSubstepIndex: number
    isExpanded: boolean
    onToggleExpansion: (sourceId: string) => void
  }) => {
    const isActiveSource = currentSourceIndex === sourceIndex
    const isCompletedSource = source.status === "completed"
    const shouldShowSubsteps = isExpanded || isActiveSource || source.status === "processing"

    const progressWidth = useMemo(() => {
      if (!isActiveSource) return 0
      return ((currentSubstepIndex + 1) / source.substeps.length) * 100
    }, [isActiveSource, currentSubstepIndex, source.substeps.length])

    const handleToggleExpansion = useCallback(() => {
      onToggleExpansion(source.id)
    }, [source.id, onToggleExpansion])

    return (
      <div
        className={`rounded-lg border transition-all duration-300 relative overflow-hidden ${
          isActiveSource
            ? "bg-purple-50/30 border-purple-200/50"
            : isCompletedSource
              ? "bg-gray-50 border-gray-200"
              : "bg-muted/20 border-transparent"
        }`}
      >
        {isActiveSource && (
          <div
            className="absolute inset-0 bg-purple-200/30 transition-all duration-1000 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        )}

        <div className="flex items-center gap-3 p-3 cursor-pointer relative z-10" onClick={handleToggleExpansion}>
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="relative flex-shrink-0">
              {source.status === "processing" && (
                <div className="absolute -inset-1 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
              )}
              <div
                className={`h-6 w-6 rounded-full ${source.color} flex items-center justify-center text-white text-xs font-bold`}
              >
                {source.symbol}
              </div>
            </div>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-sm truncate">{source.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {source.substeps.map((substep, substepIndex) => {
              const isActiveSubstep = isActiveSource && currentSubstepIndex === substepIndex
              const isCompletedSubstep = substep.status === "completed"

              return (
                <div
                  key={substep.id}
                  className={`w-1.5 h-4 rounded-sm transition-all duration-300 ${
                    isActiveSubstep
                      ? "bg-purple-600 animate-pulse"
                      : isCompletedSubstep
                        ? "bg-purple-700"
                        : "bg-muted-foreground/20"
                  }`}
                  title={substep.title}
                />
              )
            })}
          </div>

          {isCompletedSource && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs gap-1 bg-white/80 hover:bg-white border border-border/50 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              See dashboard
            </Button>
          )}
        </div>

        {shouldShowSubsteps && (
          <div className="px-6 pb-3 relative z-10">
            <div className="flex flex-col gap-1">
              {source.substeps.map((substep, substepIndex) => {
                const isActiveSubstep = isActiveSource && currentSubstepIndex === substepIndex
                const isCompletedSubstep = substep.status === "completed"
                const isProcessingSubstep = substep.status === "processing"

                return (
                  <SubstepItem
                    key={substep.id}
                    substep={substep}
                    isActive={isActiveSubstep}
                    isCompleted={isCompletedSubstep}
                    isProcessing={isProcessingSubstep}
                  />
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  },
)

DataSourceItem.displayName = "DataSourceItem"

export const ModelCreationStep = memo(() => {
  const [dataSources, setDataSources] = useState<DataSourceStep[]>(initialDataSources)
  const [currentSourceIndex, setCurrentSourceIndex] = useState(-1)
  const [currentSubstepIndex, setCurrentSubstepIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  const { totalSteps, completedSteps } = useMemo(() => {
    const total = dataSources.reduce((acc, source) => acc + source.substeps.length, 0)
    const completed = dataSources.reduce(
      (acc, source) => acc + source.substeps.filter((substep) => substep.status === "completed").length,
      0,
    )
    return { totalSteps: total, completedSteps: completed }
  }, [dataSources])

  const toggleSourceExpansion = useCallback((sourceId: string) => {
    setExpandedSources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }, [])

  const startProcessing = useCallback(() => {
    setIsProcessing(true)
    setCurrentSourceIndex(0)
    setCurrentSubstepIndex(0)
    processNextStep(0, 0)
  }, [])

  const processNextStep = useCallback(
    async (sourceIndex: number, substepIndex: number) => {
      if (sourceIndex >= dataSources.length) {
        setIsCompleted(true)
        setIsProcessing(false)
        return
      }

      const currentSource = dataSources[sourceIndex]

      if (substepIndex >= currentSource.substeps.length) {
        setDataSources((prev) =>
          prev.map((source, index) => (index === sourceIndex ? { ...source, status: "completed" as const } : source)),
        )

        setTimeout(() => {
          setCurrentSourceIndex(sourceIndex + 1)
          setCurrentSubstepIndex(0)
          processNextStep(sourceIndex + 1, 0)
        }, 500)
        return
      }

      setDataSources((prev) =>
        prev.map((source, index) => (index === sourceIndex ? { ...source, status: "processing" as const } : source)),
      )

      setDataSources((prev) =>
        prev.map((source, sIndex) =>
          sIndex === sourceIndex
            ? {
                ...source,
                substeps: source.substeps.map((substep, ssIndex) =>
                  ssIndex === substepIndex ? { ...substep, status: "processing" as const } : substep,
                ),
              }
            : source,
        ),
      )

      await new Promise((resolve) => setTimeout(resolve, 2000))

      setDataSources((prev) =>
        prev.map((source, sIndex) =>
          sIndex === sourceIndex
            ? {
                ...source,
                substeps: source.substeps.map((substep, ssIndex) =>
                  ssIndex === substepIndex ? { ...substep, status: "completed" as const } : substep,
                ),
              }
            : source,
        ),
      )

      const newProgress = ((sourceIndex * currentSource.substeps.length + substepIndex + 1) / totalSteps) * 100
      setProgress(newProgress)

      setTimeout(() => {
        setCurrentSubstepIndex(substepIndex + 1)
        processNextStep(sourceIndex, substepIndex + 1)
      }, 500)
    },
    [dataSources, totalSteps],
  )

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isProcessing && !isCompleted) {
      interval = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isProcessing, isCompleted])

  // Auto-start processing when component mounts (coming from Accounts step)
  useEffect(() => {
    if (!hasAutoStarted && !isProcessing && !isCompleted) {
      setHasAutoStarted(true)
      // Small delay to allow UI to render before starting
      setTimeout(() => {
        startProcessing()
      }, 500)
    }
  }, [hasAutoStarted, isProcessing, isCompleted, startProcessing])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/10 rounded-lg border relative overflow-hidden">
        <div
          className="absolute inset-0 bg-purple-200/30 transition-all duration-1000 ease-out"
          style={{ width: `${progress}%` }}
        />

        <div className="flex items-center gap-4 relative z-10">
          <h3 className="text-sm font-semibold text-foreground">Cross-channel dashboard</h3>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3 text-purple-700" />
              <span className="text-xs font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-purple-700" />
              <span className="text-xs">
                {completedSteps}/{totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-purple-600" />
              <span className="text-xs">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        </div>

        <Badge
          variant={isCompleted ? "default" : isProcessing ? "secondary" : "outline"}
          className="text-xs h-5 relative z-10"
        >
          {isCompleted ? "Done" : isProcessing ? "Processing" : "Ready"}
        </Badge>
      </div>

      <div className="space-y-2">
        {dataSources.map((source, sourceIndex) => (
          <DataSourceItem
            key={source.id}
            source={source}
            sourceIndex={sourceIndex}
            currentSourceIndex={currentSourceIndex}
            currentSubstepIndex={currentSubstepIndex}
            isExpanded={expandedSources.has(source.id)}
            onToggleExpansion={toggleSourceExpansion}
          />
        ))}
      </div>

      <div className="flex items-center justify-center pt-2">
        {!isProcessing && !isCompleted && (
          <Button onClick={startProcessing} size="default" className="gap-2 cursor-pointer">
            <Brain className="h-4 w-4" />
            Start Processing
          </Button>
        )}
      </div>
    </div>
  )
})

ModelCreationStep.displayName = "ModelCreationStep"
