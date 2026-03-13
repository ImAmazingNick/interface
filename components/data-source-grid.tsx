"use client"

import { useState, useCallback, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Plus, Search, Loader2 } from "lucide-react"
import { DATA_SOURCES } from "@/constants"
import { filterDataSources, groupBy } from "@/lib/utils"
import { useLocalStorage } from "@/hooks/use-local-storage"

const categoryNames = {
  analytics: "Analytics",
  advertising: "Ads",
  email: "Email",
  ecommerce: "Commerce",
  social: "Social",
} as const

interface DataSourceGridProps {
  activeCategory: string
  searchQuery: string
  onSelectionChange?: (selectedSources: string[]) => void
}

export function DataSourceGrid({ activeCategory, searchQuery, onSelectionChange }: DataSourceGridProps) {
  const [selectedSources, setSelectedSources] = useLocalStorage<string[]>("selected-data-sources", [])
  const [connectingSources, setConnectingSources] = useState<string[]>([])
  const [connectedSources, setConnectedSources] = useLocalStorage<string[]>("connected-data-sources", [
    "google-ads",
    "klaviyo",
  ])

  const { filteredSources, groupedSources } = useMemo(() => {
    const sourcesWithConnectionStatus = DATA_SOURCES.map((source) => ({
      ...source,
      connected: connectedSources.includes(source.id),
    }))

    const filtered = filterDataSources(sourcesWithConnectionStatus, activeCategory, searchQuery)
    
    // Special handling for "connected" category
    let grouped: Record<string, typeof sourcesWithConnectionStatus>
    if (activeCategory === "connected") {
      // Group connected sources by their original category
      grouped = groupBy(filtered, "category")
    } else {
      grouped = groupBy(filtered, "category")
    }

    return {
      filteredSources: filtered,
      groupedSources: grouped,
    }
  }, [activeCategory, searchQuery, connectedSources])

  const toggleSource = useCallback(
    (sourceId: string) => {
      const newSelection = selectedSources.includes(sourceId)
        ? selectedSources.filter((id) => id !== sourceId)
        : [...selectedSources, sourceId]

      setSelectedSources(newSelection)
      onSelectionChange?.(newSelection)
    },
    [selectedSources, setSelectedSources, onSelectionChange],
  )

  const handleConnectSources = useCallback(async () => {
    if (selectedSources.length === 0) return

    setConnectingSources(selectedSources)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Update connected sources
      setConnectedSources([...new Set([...connectedSources, ...selectedSources])])
      setSelectedSources([])
      onSelectionChange?.([])
    } catch (error) {
      console.error("Failed to connect sources:", error)
      // Handle error state here
    } finally {
      setConnectingSources([])
    }
  }, [selectedSources, setConnectedSources, setSelectedSources, onSelectionChange])

  const SourceCard = useCallback(
    ({ source }: { source: (typeof DATA_SOURCES)[0] & { connected: boolean } }) => {
      const Icon = source.icon
      const isSelected = selectedSources.includes(source.id)
      const isConnected = source.connected
      const isConnecting = connectingSources.includes(source.id)

      return (
        <div
          className={`relative p-6 border rounded-xl transition-all duration-200 cursor-pointer hover:shadow-md hover:scale-[1.02] ${
            isSelected
              ? "border-purple-600 bg-purple-50/30 shadow-sm"
              : isConnected
                ? "border-green-200/60 bg-green-50/30"
                : "border-border bg-background hover:border-primary/30"
          } ${isConnecting ? "opacity-75 cursor-not-allowed" : ""}`}
          onClick={() => !isConnecting && toggleSource(source.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === "Enter" || e.key === " ") && !isConnecting) {
              e.preventDefault()
              toggleSource(source.id)
            }
          }}
          aria-pressed={isSelected}
          aria-label={`${isConnected ? "Connected" : "Connect"} ${source.name}`}
        >
          <div className="absolute top-3 left-3">
            <div
              className={`w-4 h-4 rounded border-2 transition-all duration-200 ${
                isConnected
                  ? "bg-green-600 border-green-600"
                  : isSelected
                    ? "bg-purple-600 border-purple-600"
                    : "border-muted-foreground/30"
              }`}
            >
              {(isSelected || isConnected) && <Plus className="h-3 w-3 transform rotate-45 text-white" />}
            </div>
          </div>

          {isConnected && (
            <div className="absolute top-3 right-3">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          )}

          {isConnecting && (
            <div className="absolute top-3 right-3">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
            </div>
          )}

          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className={`p-3 rounded-lg ${isConnected ? "bg-green-100/60" : "bg-muted"}`}>
              <Icon className={`h-8 w-8 ${isConnected ? "text-green-600" : "text-foreground"}`} />
            </div>

            <h4 className="font-medium text-foreground">{source.name}</h4>

            <div className="flex flex-col items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {categoryNames[source.category as keyof typeof categoryNames]}
              </Badge>

              {isConnected && (
                <Badge variant="secondary" className="text-xs bg-green-100/60 text-green-700 border-green-200/60">
                  Connected
                </Badge>
              )}

              {isConnecting && (
                <Badge variant="outline" className="text-xs">
                  Connecting...
                </Badge>
              )}
            </div>
          </div>
        </div>
      )
    },
    [selectedSources, connectingSources, toggleSource],
  )

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-8">
        {Object.entries(groupedSources).map(([category, sources]) => (
          <div key={category} id={category}>
            <div className="flex items-center gap-3 mb-6 px-6">
              <h3 className="text-xl font-heading font-semibold text-foreground">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <Badge variant="outline" className="text-xs">
                {sources.filter((s) => s.connected).length} connected
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 px-6">
              {sources.map((source) => (
                <SourceCard key={source.id} source={source} />
              ))}
            </div>
          </div>
        ))}

        {filteredSources.length === 0 && (
          <div className="text-center py-12 px-6">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No sources found</h3>
            <p className="text-muted-foreground">Try adjusting your search or browse different categories.</p>
          </div>
        )}
      </div>
    </div>
  )
}
