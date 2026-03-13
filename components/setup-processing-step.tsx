"use client"

import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  CheckCircle2,
  Loader2,
  Database,
  Globe,
  BarChart3,
  Clock,
  ExternalLink,
  Zap,
  Settings,
  ChevronRight,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { TreeItem } from "@/components/shared/tree-item"
import { StatusBadge } from "@/components/shared/status-badge"
import type { Connection, DataSourceConnection, Account } from "@/types/step-interfaces"
import type { SelectedSourceData } from "@/types/setup-interfaces"

interface ProcessingStep {
  id: string
  title: string
  status: "pending" | "processing" | "completed" | "error"
}

interface ConnectionProcessing {
  id: string
  name: string
  email: string
  accounts: Account[]
  substeps: ProcessingStep[]
  status: "pending" | "processing" | "completed" | "error"
  progress: number
}

interface SourceProcessing {
  id: string
  name: string
  icon: string
  status: "pending" | "processing" | "completed" | "error"
  connections: ConnectionProcessing[]
  progress: number
}

interface SetupProcessingStepProps {
  selectedSources: SelectedSourceData[]
  selectedAccountsCount: number
  onComplete?: () => void
}

const defaultSubsteps: ProcessingStep[] = [
  { id: "validate-connection", title: "Validating Connection", status: "pending" },
  { id: "sync-accounts", title: "Syncing Accounts", status: "pending" },
  { id: "extract-data", title: "Extracting Data", status: "pending" },
  { id: "process-metrics", title: "Processing Metrics", status: "pending" },
  { id: "setup-dashboard", title: "Setting Up Dashboard", status: "pending" }
]

const SubstepItem = memo(
  ({
    substep,
    isActive,
    isCompleted,
    isProcessing,
  }: {
    substep: ProcessingStep
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

const ConnectionProcessingItem = memo(
  ({
    connection,
    isActive,
    currentSubstepIndex,
    isExpanded,
    onToggle
  }: {
    connection: ConnectionProcessing
    isActive: boolean
    currentSubstepIndex: number
    isExpanded: boolean
    onToggle: () => void
  }) => {
    const progressWidth = useMemo(() => {
      if (!isActive) return 0
      return ((currentSubstepIndex + 1) / connection.substeps.length) * 100
    }, [isActive, currentSubstepIndex, connection.substeps.length])

    return (
      <div className="ml-8">
        <div
          className={`relative overflow-hidden transition-all duration-300`}
        >

          <div
            className="flex items-center gap-3 p-2 px-4 cursor-pointer relative z-10"
            onClick={onToggle}
          >
            <div className="flex items-center gap-2 flex-1">
              <div className="min-w-0 flex items-center gap-2">
                <span className="font-medium text-sm">{connection.name}</span>
                <span className="text-sm text-muted-foreground">• {connection.email}</span>
              </div>
            </div>

            {/* Progress indicators */}
          <div className="flex items-center gap-1">
              {connection.substeps.map((substep, index) => {
                const isActiveSubstep = isActive && currentSubstepIndex === index
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
          </div>

          {/* Substeps */}
          {isExpanded && (
            <div className="px-3 pb-2">
              <div className="flex flex-col gap-1">
                {connection.substeps.map((substep, index) => (
                  <SubstepItem
                    key={substep.id}
                    substep={substep}
                    isActive={isActive && currentSubstepIndex === index}
                    isCompleted={substep.status === "completed"}
                    isProcessing={substep.status === "processing"}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
)

ConnectionProcessingItem.displayName = "ConnectionProcessingItem"

const SourceProcessingCard = memo(
  ({
    source,
    sourceIndex,
    currentSourceIndex,
    currentConnectionIndex,
    currentSubstepIndex,
    isExpanded,
    onToggleExpansion,
    expandedConnections,
    onToggleConnection,
    isLast
  }: {
    source: SourceProcessing
    sourceIndex: number
    currentSourceIndex: number
    currentConnectionIndex: number
    currentSubstepIndex: number
    isExpanded: boolean
    onToggleExpansion: (sourceId: string) => void
    expandedConnections: Set<string>
    onToggleConnection: (connectionId: string) => void
    isLast?: boolean
  }) => {
    const isActiveSource = currentSourceIndex === sourceIndex
    const isCompletedSource = source.status === "completed"
    const shouldShowConnections = isExpanded

    const sourceProgress = useMemo(() => {
      const totalSteps = source.connections.reduce((acc, conn) => acc + conn.substeps.length, 0)
      const completedSteps = source.connections.reduce(
        (acc, conn) => acc + conn.substeps.filter(s => s.status === "completed").length,
        0
      )
      return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    }, [source.connections])

    return (
      <>
        <div
          className={`relative overflow-hidden transition-all duration-300 ${
            isActiveSource
              ? "bg-purple-50/30"
              : ""
          }`}
        >
          {/* Background progress bar for entire item */}
          {isActiveSource && source.status !== "completed" && (
            <div
              className="absolute inset-0 bg-purple-200/20 transition-all duration-1000 ease-out pointer-events-none"
              style={{ width: `${sourceProgress}%` }}
            />
          )}

          <div
            className="flex items-center gap-3 p-3 cursor-pointer relative z-10"
            onClick={() => onToggleExpansion(source.id)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="relative flex-shrink-0">
                <div className="h-10 w-10 rounded-md border border-[#e8e5e0] bg-white/90 flex items-center justify-center p-1.5">
                  {source.icon ? (
                    <img
                      src={source.icon}
                      alt={source.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {source.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
                {source.status === "processing" && (
                  <div className="absolute inset-0 -m-1">
                    <svg className="h-12 w-12 animate-spin" viewBox="0 0 48 48">
                      <circle
                        className="opacity-25"
                        cx="24"
                        cy="24"
                        r="20"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        color="rgb(147, 51, 234)"
                      />
                      <path
                        className="opacity-75"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        color="rgb(147, 51, 234)"
                        d="M24 4 A 20 20 0 0 1 44 24"
                      />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-medium text-sm truncate">{source.name}</span>
                <Badge variant="outline" className="text-xs">
                  {source.connections.length} connection{source.connections.length !== 1 ? 's' : ''}
                </Badge>
              </div>
            </div>

            {/* Overall progress indicator */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">{Math.round(sourceProgress)}%</span>
          </div>

          {isCompletedSource && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 px-2 text-xs gap-1 bg-white/80 hover:bg-white border border-border/50 flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
                View
            </Button>
          )}
        </div>

          {/* Connections */}
          {shouldShowConnections && (
            <div className="px-3 pb-3 relative z-10">
              {source.connections.map((connection, connIndex) => {
                const isActiveConnection = isActiveSource && currentConnectionIndex === connIndex

                return (
                  <ConnectionProcessingItem
                    key={connection.id}
                    connection={connection}
                    isActive={isActiveConnection}
                    currentSubstepIndex={currentSubstepIndex}
                    isExpanded={expandedConnections.has(connection.id)}
                    onToggle={() => onToggleConnection(connection.id)}
                  />
                )
              })}
            </div>
          )}
          </div>
        
        {/* Separator line between items */}
        {!isLast && (
          <div className="border-b border-[#e8e5e0]" />
        )}
      </>
    )
  }
)

SourceProcessingCard.displayName = "SourceProcessingCard"

export function SetupProcessingStep({
  selectedSources,
  selectedAccountsCount,
  onComplete
}: SetupProcessingStepProps) {
  // Transform the selected sources into processing format
  const [sources, setSources] = useState<SourceProcessing[]>([])

  // Update sources when selectedSources changes
  useEffect(() => {
    console.log("🔄 selectedSources changed:", selectedSources)
    console.log("selectedSources length:", selectedSources?.length || 0)

    if (selectedSources && selectedSources.length > 0) {
      // Reset processing state when new data comes in
      setHasAutoStarted(false)
      setCurrentSourceIndex(-1)
      setCurrentConnectionIndex(-1)
      setCurrentSubstepIndex(-1)
      setIsProcessing(false)
      setIsCompleted(false)

      const transformedSources: SourceProcessing[] = selectedSources.map(sourceData => ({
        id: sourceData.source.id,
        name: sourceData.source.name,
        icon: sourceData.source.icon,
        status: "pending" as const,
        progress: 0,
        connections: sourceData.connections.map(connData => ({
          id: connData.connection.id,
          name: connData.connection.name,
          email: connData.connection.email,
          accounts: connData.accounts,
          substeps: defaultSubsteps.map(step => ({ ...step })),
          status: "pending" as const,
          progress: 0
        }))
      }))
      setSources(transformedSources)
      console.log(`📊 Processing setup for ${transformedSources.length} sources with ${transformedSources.reduce((acc, s) => acc + s.connections.length, 0)} connections`)
    } else {
      console.log("⚠️ No selectedSources or empty array")
    }
  }, [selectedSources])
  
  const [currentSourceIndex, setCurrentSourceIndex] = useState(-1)
  const [currentConnectionIndex, setCurrentConnectionIndex] = useState(-1)
  const [currentSubstepIndex, setCurrentSubstepIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [expandedConnections, setExpandedConnections] = useState<Set<string>>(new Set())
  const [hasAutoStarted, setHasAutoStarted] = useState(false)

  // Reset hasAutoStarted when component unmounts or selectedSources changes
  useEffect(() => {
    return () => {
      setHasAutoStarted(false)
    }
  }, [])

  // Reset hasAutoStarted when selectedSources changes
  useEffect(() => {
    if (selectedSources && selectedSources.length > 0) {
      setHasAutoStarted(false)
    }
  }, [selectedSources])

  const { totalSteps, completedSteps } = useMemo(() => {
    const total = sources.reduce(
      (acc, source) => acc + source.connections.reduce(
        (connAcc, conn) => connAcc + conn.substeps.length,
        0
      ),
      0
    )
    const completed = sources.reduce(
      (acc, source) => acc + source.connections.reduce(
        (connAcc, conn) => connAcc + conn.substeps.filter(s => s.status === "completed").length,
        0
      ),
      0
    )
    console.log(`📈 Progress: ${completed}/${total} steps completed (${total > 0 ? Math.round((completed / total) * 100) : 0}%)`)
    return { totalSteps: total, completedSteps: completed }
  }, [sources])

  // Auto-start processing when sources are ready
  useEffect(() => {
    console.log("🔄 Auto-start check - hasAutoStarted:", hasAutoStarted, "sources.length:", sources.length)

    if (!hasAutoStarted && sources.length > 0 && sources[0]?.connections.length > 0) {
      console.log("🚀 Starting dashboard setup processing...")

      // Small delay to ensure state is properly set
      setTimeout(() => {
        // Reset processing state to ensure clean start
      setCurrentSourceIndex(0)
        setCurrentConnectionIndex(0)
      setCurrentSubstepIndex(0)
        setIsProcessing(true)
        setHasAutoStarted(true)

        // Auto-expand the first source and its first connection
        if (sources[0]) {
          setExpandedSources(new Set([sources[0].id]))
          if (sources[0].connections[0]) {
            setExpandedConnections(new Set([sources[0].connections[0].id]))
          }
        }
      }, 100)
    }
  }, [hasAutoStarted, sources])

    // Process substeps - single processing timer
  useEffect(() => {
    if (!isProcessing || currentSourceIndex < 0 || currentConnectionIndex < 0 || currentSubstepIndex < 0) {
      return
    }

    const currentSource = sources[currentSourceIndex]
    const currentConnection = currentSource?.connections[currentConnectionIndex]
    const currentSubstep = currentConnection?.substeps[currentSubstepIndex]

    if (!currentSubstep || currentSubstep.status !== "pending") {
      return
    }

    console.log(`⚙️ Processing: ${currentSource?.name} → ${currentConnection?.name} → ${currentSubstep.title}`)

    // Mark as processing
    setSources(prev => prev.map((source, sourceIndex) => {
      if (sourceIndex === currentSourceIndex) {
        return {
          ...source,
          status: "processing" as const,
          connections: source.connections.map((conn, connIndex) => {
            if (connIndex === currentConnectionIndex) {
              return {
                ...conn,
                status: "processing" as const,
                substeps: conn.substeps.map((substep, substepIndex) => {
                  if (substepIndex === currentSubstepIndex) {
                    return { ...substep, status: "processing" as const }
                  }
                  return substep
                })
              }
            }
            return conn
          })
        }
      }
      return source
    }))

    // Process and complete after delay
    const timer = setTimeout(() => {
      console.log(`✅ Completed: ${currentSubstep.title}`)
      
      // Mark as completed
      setSources(prev => prev.map((source, sourceIndex) => {
        if (sourceIndex === currentSourceIndex) {
          return {
            ...source,
            connections: source.connections.map((conn, connIndex) => {
              if (connIndex === currentConnectionIndex) {
                return {
                  ...conn,
                  substeps: conn.substeps.map((substep, substepIndex) => {
                    if (substepIndex === currentSubstepIndex) {
                      return { ...substep, status: "completed" as const }
                    }
                    return substep
                  })
                }
              }
              return conn
            })
          }
        }
        return source
      }))

      // Move to next step
      if (currentSubstepIndex < currentConnection.substeps.length - 1) {
        // Next substep
        setCurrentSubstepIndex(prev => prev + 1)
      } else if (currentConnectionIndex < currentSource.connections.length - 1) {
        // Next connection
        console.log(`🏁 Completed connection: ${currentConnection.name}`)
        
        // Collapse completed connection
        setExpandedConnections(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentConnection.id)
          return newSet
        })
        
        setSources(prev => prev.map((source, sourceIndex) => {
          if (sourceIndex === currentSourceIndex) {
            return {
              ...source,
              connections: source.connections.map((conn, connIndex) => {
                if (connIndex === currentConnectionIndex) {
                  return { ...conn, status: "completed" as const }
                }
                return conn
              })
            }
          }
          return source
        }))
        setCurrentConnectionIndex(prev => prev + 1)
        setCurrentSubstepIndex(0)
        
        // Auto-expand next connection
        const nextConnection = currentSource.connections[currentConnectionIndex + 1]
        if (nextConnection) {
          setExpandedConnections(prev => new Set([...prev, nextConnection.id]))
        }
      } else if (currentSourceIndex < sources.length - 1) {
        // Next source
        console.log(`🎉 Completed source: ${currentSource.name}`)
        
        // Collapse completed source and its last connection
        setExpandedSources(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentSource.id)
          return newSet
        })
        setExpandedConnections(prev => {
          const newSet = new Set(prev)
          newSet.delete(currentConnection.id)
          return newSet
        })
        
        setSources(prev => prev.map((source, sourceIndex) => {
          if (sourceIndex === currentSourceIndex) {
            return { ...source, status: "completed" as const }
            }
            return source
          }))
              setCurrentSourceIndex(prev => prev + 1)
        setCurrentConnectionIndex(0)
              setCurrentSubstepIndex(0)
        
        // Auto-expand next source
        const nextSource = sources[currentSourceIndex + 1]
        if (nextSource) {
          setExpandedSources(prev => new Set([...prev, nextSource.id]))
          if (nextSource.connections[0]) {
            setExpandedConnections(prev => new Set([...prev, nextSource.connections[0].id]))
          }
        }
            } else {
        // All complete
        console.log("🎊 All dashboard setup processing complete!")
        
        // Mark last source and connection as completed first
        setSources(prev => prev.map((source, sourceIndex) => {
          if (sourceIndex === currentSourceIndex) {
            return { 
              ...source, 
              status: "completed" as const,
              connections: source.connections.map((conn, connIndex) => {
                if (connIndex === currentConnectionIndex) {
                  return { ...conn, status: "completed" as const }
                }
                return conn
              })
            }
          }
          return source
        }))
        
        // Then collapse the last connection and source after a brief delay
        setTimeout(() => {
          setExpandedConnections(prev => {
            const newSet = new Set(prev)
            newSet.delete(currentConnection.id)
            return newSet
          })
          setExpandedSources(prev => {
            const newSet = new Set(prev)
            newSet.delete(currentSource.id)
            return newSet
          })
        }, 300)
        
        setIsProcessing(false)
        setIsCompleted(true)
      }
    }, 1000 + Math.random() * 1000) // 1-2 seconds per step

        return () => clearTimeout(timer)
  }, [isProcessing, currentSourceIndex, currentConnectionIndex, currentSubstepIndex])

  // Update progress
  useEffect(() => {
    const newProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0
    setProgress(newProgress)
  }, [totalSteps, completedSteps])

  const toggleSourceExpansion = useCallback((sourceId: string) => {
    setExpandedSources(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sourceId)) {
        newSet.delete(sourceId)
      } else {
        newSet.add(sourceId)
      }
      return newSet
    })
  }, [])

  const toggleConnectionExpansion = useCallback((connectionId: string) => {
    setExpandedConnections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(connectionId)) {
        newSet.delete(connectionId)
      } else {
        newSet.add(connectionId)
      }
      return newSet
    })
  }, [])

  const handleComplete = useCallback(() => {
    onComplete?.()
  }, [onComplete])

  const totalAccounts = useMemo(() => {
    return sources.reduce(
      (acc, source) => acc + source.connections.reduce(
        (connAcc, conn) => connAcc + conn.accounts.length,
        0
      ),
      0
    )
  }, [sources])

  return (
    <div className="h-full flex flex-col bg-[#fafaf9]">
        {/* Header */}
      <div className="flex-shrink-0 pt-6 pb-3 px-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                Setting up your dashboard
              </h1>
              <p className="text-muted-foreground mt-2">
                Processing {sources.length} source{sources.length !== 1 ? 's' : ''} • 
                {' '}{sources.reduce((acc, s) => acc + s.connections.length, 0)} connection{sources.reduce((acc, s) => acc + s.connections.length, 0) !== 1 ? 's' : ''} • 
                {' '}{totalAccounts} account{totalAccounts !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                {completedSteps} of {totalSteps} steps
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {Math.round(progress)}%
              </div>
            </div>
          </div>
          </div>
        </div>

            {/* Content */}
      <div className="flex-1 overflow-auto p-3">
        <div className="max-w-6xl mx-auto">

        {/* Data Sources */}
          <div className="rounded-lg overflow-hidden">
            {sources.map((source, sourceIndex) => (
              <SourceProcessingCard
                key={source.id}
                source={source}
                sourceIndex={sourceIndex}
              currentSourceIndex={currentSourceIndex}
                currentConnectionIndex={currentConnectionIndex}
              currentSubstepIndex={currentSubstepIndex}
                isExpanded={expandedSources.has(source.id)}
                onToggleExpansion={toggleSourceExpansion}
                expandedConnections={expandedConnections}
                onToggleConnection={toggleConnectionExpansion}
                isLast={sourceIndex === sources.length - 1}
            />
          ))}
        </div>

        {/* Completion Message */}
        {isCompleted && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-green-700 text-sm">
                    Successfully processed {sources.length} source{sources.length !== 1 ? 's' : ''} with{' '}
                    {totalAccounts} account{totalAccounts !== 1 ? 's' : ''}.
                  </p>
                </div>
                <Button onClick={handleComplete} size="sm" className="bg-green-600 hover:bg-green-700">
                  View Dashboard
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </div>
          )}
          </div>
      </div>
    </div>
  )
}