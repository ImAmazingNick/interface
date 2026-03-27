"use client"

import { Fragment, useState, useCallback, useRef } from "react"
import { Panel, PanelGroup, PanelResizeHandle, type ImperativePanelHandle } from "react-resizable-panels"
import {
  ChevronRight,
  Share2,
  MoreHorizontal,
  PanelRight,
  BarChart3,
  FileText,
  Plug,
  Code,
  GitBranch,
  Settings,
  TrendingUp,
  Users,
  Activity,
  Database,
  Table,
  ToggleLeft,
  Clock,
  CheckCircle2,
  ArrowDown,
  Layers,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getBreadcrumbs, getAncestorIds, getNavItem } from "@/lib/navigation"
import { getStatusBadgeClass, getStatusLabel } from "@/lib/status-utils"
import type { ItemStatus } from "@/lib/status-utils"

interface ItemPageProps {
  title: string
  itemId?: string
  onBreadcrumbClick?: (id: string) => void
  tree?: import("@/types").TreeNavigationItem[]
}

// ── Content type detection ──────────────────────────────────────────────

type ContentType = "dashboard" | "document" | "connection" | "query" | "workflow" | "settings" | "generic"

const FOLDER_TO_CONTENT: Record<string, ContentType> = {
  dashboards: "dashboard",
  reports: "document",
  connections: "connection",
  "data-explorer": "query",
  recipes: "workflow",
  admin: "settings",
}

function getContentType(itemId?: string): ContentType {
  if (!itemId) return "generic"
  const ancestors = getAncestorIds(itemId)
  for (const id of ancestors) {
    if (FOLDER_TO_CONTENT[id]) return FOLDER_TO_CONTENT[id]
  }
  return "generic"
}

// ── Type-specific content layouts ───────────────────────────────────────

function DashboardContent() {
  return (
    <div className="space-y-4">
      {/* Metric cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: TrendingUp, label: "Total Revenue", value: "$—" },
          { icon: Users, label: "Active Users", value: "—" },
          { icon: Activity, label: "Conversion Rate", value: "—%" },
        ].map((metric) => (
          <div
            key={metric.label}
            className="border border-border/50 rounded-lg p-4 bg-background"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <metric.icon className="h-3.5 w-3.5 text-primary/60" aria-hidden="true" />
              </div>
              <span className="text-xs text-muted-foreground/60">{metric.label}</span>
            </div>
            <div className="h-6 w-20 rounded bg-muted/40" />
          </div>
        ))}
      </div>

      {/* Main chart area */}
      <div className="border border-border/50 rounded-lg p-5 bg-background min-h-[220px]">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 w-28 rounded bg-muted/40" />
          <div className="flex gap-2">
            <div className="h-6 w-16 rounded bg-muted/30" />
            <div className="h-6 w-16 rounded bg-muted/30" />
          </div>
        </div>
        <div className="flex items-end gap-2 h-36 px-2">
          {[40, 65, 45, 80, 55, 70, 50, 60, 75, 42, 68, 58].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-primary/10 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Secondary charts */}
      <div className="grid grid-cols-2 gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="border border-border/50 rounded-lg p-4 bg-background min-h-[140px]">
            <div className="h-4 w-24 rounded bg-muted/40 mb-4" />
            <div className="flex items-end gap-1.5 h-20">
              {[30, 50, 40, 70, 55, 45].map((h, j) => (
                <div
                  key={j}
                  className="flex-1 bg-muted/30 rounded-t"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentContent() {
  return (
    <div className="space-y-5 max-w-2xl">
      {/* Heading placeholder */}
      <div className="space-y-2">
        <div className="h-5 w-64 rounded bg-muted/40" />
        <div className="h-3 w-40 rounded bg-muted/20" />
      </div>

      {/* Text block */}
      <div className="space-y-2">
        {[90, 85, 78, 92, 60].map((w, i) => (
          <div key={i} className="h-3 rounded bg-muted/30" style={{ width: `${w}%` }} />
        ))}
      </div>

      {/* Sub-heading */}
      <div className="h-4 w-48 rounded bg-muted/40 mt-6" />

      {/* Text block */}
      <div className="space-y-2">
        {[88, 75, 82, 70].map((w, i) => (
          <div key={i} className="h-3 rounded bg-muted/30" style={{ width: `${w}%` }} />
        ))}
      </div>

      {/* Table area */}
      <div className="border border-border/50 rounded-lg overflow-hidden mt-6">
        <div className="h-8 bg-muted/30 border-b border-border/30 flex items-center px-4 gap-8">
          {[60, 80, 50, 70].map((w, i) => (
            <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: w }} />
          ))}
        </div>
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className={cn(
              "h-9 flex items-center px-4 gap-8",
              row < 3 && "border-b border-border/30"
            )}
          >
            {[60, 80, 50, 70].map((w, i) => (
              <div key={i} className="h-2.5 rounded bg-muted/20" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ConnectionContent() {
  return (
    <div className="space-y-5 max-w-lg">
      {/* Status badge */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
        <span className="text-sm font-medium text-foreground">Connected</span>
        <span className="text-xs text-muted-foreground/60">Last synced 2h ago</span>
      </div>

      {/* Config fields */}
      <div className="border border-border/50 rounded-lg p-4 bg-background space-y-4">
        <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Configuration</div>
        {[
          { label: "API Endpoint", width: "75%" },
          { label: "API Key", width: "50%" },
          { label: "Refresh Interval", width: "30%" },
          { label: "Timeout", width: "25%" },
        ].map((field) => (
          <div key={field.label} className="space-y-1.5">
            <span className="text-xs text-muted-foreground">{field.label}</span>
            <div className="h-8 rounded-md border border-border/30 bg-muted/10 px-3 flex items-center">
              <div className="h-2.5 rounded bg-muted/40" style={{ width: field.width }} />
            </div>
          </div>
        ))}
      </div>

      {/* Sync status */}
      <div className="border border-border/50 rounded-lg p-4 bg-background">
        <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide mb-3">Sync Status</div>
        <div className="space-y-2.5">
          {[
            { label: "Records synced", value: "—" },
            { label: "Last error", value: "None" },
            { label: "Next sync", value: "—" },
          ].map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{row.label}</span>
              <span className="text-xs text-foreground/60">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function QueryContent() {
  return (
    <div className="space-y-4">
      {/* Code editor */}
      <div className="border border-border/50 rounded-lg overflow-hidden bg-zinc-950 dark:bg-zinc-900 min-h-[200px]">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/5">
          <Code className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          <span className="text-[11px] text-zinc-500 font-medium">SQL</span>
          <div className="flex-1" />
          <div className="h-5 w-12 rounded bg-white/5" />
        </div>
        <div className="p-4 space-y-2">
          {[
            { num: 1, w: "45%" },
            { num: 2, w: "60%" },
            { num: 3, w: "35%" },
            { num: 4, w: "50%" },
            { num: 5, w: "40%" },
            { num: 6, w: "25%" },
            { num: 7, w: "55%" },
          ].map((line) => (
            <div key={line.num} className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-600 tabular-nums w-5 text-right select-none">{line.num}</span>
              <div className="h-3 rounded-sm bg-white/8" style={{ width: line.w }} />
            </div>
          ))}
        </div>
      </div>

      {/* Results table */}
      <div className="border border-border/50 rounded-lg overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30 bg-muted/30">
          <Table className="h-3.5 w-3.5 text-muted-foreground/40" aria-hidden="true" />
          <span className="text-[11px] text-muted-foreground/60 font-medium">Results</span>
          <div className="flex-1" />
          <span className="text-[11px] text-muted-foreground/40">0 rows</span>
        </div>
        <div className="h-8 bg-muted/20 border-b border-border/30 flex items-center px-4 gap-6">
          {[50, 70, 60, 80].map((w, i) => (
            <div key={i} className="h-2.5 rounded bg-muted/40" style={{ width: w }} />
          ))}
        </div>
        {[0, 1, 2].map((row) => (
          <div
            key={row}
            className={cn(
              "h-8 flex items-center px-4 gap-6",
              row < 2 && "border-b border-border/30"
            )}
          >
            {[50, 70, 60, 80].map((w, i) => (
              <div key={i} className="h-2.5 rounded bg-muted/15" style={{ width: w }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function WorkflowContent() {
  return (
    <div className="max-w-md mx-auto py-4">
      {[
        { icon: Database, label: "Data Source", status: "complete" },
        { icon: Layers, label: "Transform", status: "complete" },
        { icon: GitBranch, label: "Split & Route", status: "active" },
        { icon: ArrowDown, label: "Output", status: "pending" },
      ].map((step, i, arr) => (
        <div key={step.label} className="flex flex-col items-center">
          <div
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 border rounded-lg",
              step.status === "complete"
                ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/30"
                : step.status === "active"
                  ? "border-primary/30 bg-primary/5"
                  : "border-border/50 bg-background"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-md flex items-center justify-center shrink-0",
                step.status === "complete"
                  ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
                  : step.status === "active"
                    ? "bg-primary/10 text-primary"
                    : "bg-muted/40 text-muted-foreground/40"
              )}
            >
              {step.status === "complete" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <step.icon className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className={cn(
                "text-sm",
                step.status === "pending" ? "text-muted-foreground/60" : "text-foreground"
              )}>
                {step.label}
              </span>
            </div>
            {step.status === "complete" && (
              <span className="text-[11px] text-green-600 dark:text-green-400">Done</span>
            )}
            {step.status === "active" && (
              <span className="text-[11px] text-primary">Running</span>
            )}
          </div>
          {/* Connector */}
          {i < arr.length - 1 && (
            <div className="w-px h-6 bg-border/50" />
          )}
        </div>
      ))}
    </div>
  )
}

function SettingsContent() {
  return (
    <div className="space-y-6 max-w-lg">
      {/* Section: General */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">General</div>
        <div className="border border-border/50 rounded-lg p-4 bg-background space-y-4">
          {[
            { label: "Display Name", width: "60%" },
            { label: "Description", width: "80%" },
          ].map((field) => (
            <div key={field.label} className="space-y-1.5">
              <span className="text-xs text-muted-foreground">{field.label}</span>
              <div className="h-8 rounded-md border border-border/30 bg-muted/10 px-3 flex items-center">
                <div className="h-2.5 rounded bg-muted/40" style={{ width: field.width }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Preferences */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Preferences</div>
        <div className="border border-border/50 rounded-lg p-4 bg-background space-y-4">
          {["Enable notifications", "Auto-sync data", "Dark mode"].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-sm text-foreground/80">{label}</span>
              <div className="w-9 h-5 rounded-full bg-muted/40 relative">
                <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-muted-foreground/20" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Danger */}
      <div className="space-y-3">
        <div className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wide">Danger Zone</div>
        <div className="border border-red-200/50 dark:border-red-900/30 rounded-lg p-4 bg-background">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-foreground">Delete this item</span>
              <p className="text-xs text-muted-foreground/60 mt-0.5">This action cannot be undone.</p>
            </div>
            <div className="h-7 w-16 rounded-md border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20" />
          </div>
        </div>
      </div>
    </div>
  )
}

function GenericContent() {
  return (
    <div className="border border-border/50 rounded-lg min-h-[280px] flex flex-col items-center justify-center gap-2.5">
      <FileText className="h-7 w-7 text-muted-foreground/20" aria-hidden="true" />
      <span className="text-sm text-muted-foreground/40">Content</span>
    </div>
  )
}

const CONTENT_COMPONENTS: Record<ContentType, React.FC> = {
  dashboard: DashboardContent,
  document: DocumentContent,
  connection: ConnectionContent,
  query: QueryContent,
  workflow: WorkflowContent,
  settings: SettingsContent,
  generic: GenericContent,
}

// ── Properties panel ────────────────────────────────────────────────────

function PropertiesPanel({ itemId }: { itemId?: string }) {
  const navItem = itemId ? getNavItem(itemId) : null
  const breadcrumbs = itemId ? getBreadcrumbs(itemId) : []
  const folderCrumb = breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2] : null

  return (
    <div className="h-full flex flex-col bg-background border-l border-border">
      <div className="flex-shrink-0 h-14 flex items-center px-5 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Properties</span>
      </div>
      <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-5">
        {/* Fields */}
        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Name</span>
            <p className="text-sm text-foreground">{navItem?.title ?? "—"}</p>
          </div>

          {/* Type */}
          <div className="space-y-1">
            <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Type</span>
            <p className="text-sm text-foreground">{navItem?.tag ?? "File"}</p>
          </div>

          {/* Status */}
          {navItem?.status && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Status</span>
              <div>
                <Badge variant="outline" className={`text-[11px] ${getStatusBadgeClass(navItem.status as ItemStatus)}`}>
                  {getStatusLabel(navItem.status as ItemStatus)}
                </Badge>
              </div>
            </div>
          )}

          {/* Folder */}
          {folderCrumb && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Folder</span>
              <p className="text-sm text-foreground">{folderCrumb.title}</p>
            </div>
          )}

          {/* Updated */}
          {navItem?.updated && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Updated</span>
              <p className="text-sm text-foreground">{navItem.updated}</p>
            </div>
          )}

          {/* Updated by */}
          {navItem?.updatedBy && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Updated by</span>
              <p className="text-sm text-foreground">{navItem.updatedBy}</p>
            </div>
          )}
        </div>

        {/* Sharing section */}
        <div className="border-t border-border/30 pt-4 space-y-3">
          <span className="text-[11px] text-muted-foreground/60 uppercase tracking-wide">Sharing</span>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground/80">Shared with team</span>
            <div className="w-9 h-5 rounded-full bg-muted/40 relative">
              <div className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-muted-foreground/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────

export function ItemPage({ title, itemId, onBreadcrumbClick, tree }: ItemPageProps) {
  const breadcrumbs = itemId ? getBreadcrumbs(itemId, tree) : []
  const ancestors = breadcrumbs.slice(0, -1)
  const current = breadcrumbs[breadcrumbs.length - 1]
  const displayTitle = current?.title ?? title

  const contentType = getContentType(itemId)
  const ContentComponent = CONTENT_COMPONENTS[contentType]

  const [isPropertiesCollapsed, setIsPropertiesCollapsed] = useState(true)
  const propertiesPanelRef = useRef<ImperativePanelHandle>(null)

  const toggleProperties = useCallback(() => {
    if (isPropertiesCollapsed) {
      propertiesPanelRef.current?.expand()
    } else {
      propertiesPanelRef.current?.collapse()
    }
  }, [isPropertiesCollapsed])

  return (
    <div className="min-h-full flex flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex-shrink-0 h-14 flex items-center justify-between px-6 border-b border-border bg-background/95 backdrop-blur-sm shadow-[0_1px_2px_-1px_rgba(0,0,0,0.06)]">
        <nav className="flex items-center gap-1.5 min-w-0 mr-4" aria-label="Breadcrumb">
          {ancestors.map((crumb) => (
            <Fragment key={crumb.id}>
              <button
                onClick={() => onBreadcrumbClick?.(crumb.id)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {crumb.title}
              </button>
              <ChevronRight className="h-3 w-3 text-muted-foreground/20 shrink-0" aria-hidden="true" />
            </Fragment>
          ))}
          <h1 className="text-sm font-semibold text-foreground truncate" style={{ textWrap: "balance" }}>{displayTitle}</h1>
        </nav>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground" aria-label="Share">
            <Share2 className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground" aria-label="More actions">
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="w-px h-5 bg-border/50 mx-0.5" aria-hidden="true" />
          <Button
            variant={isPropertiesCollapsed ? "ghost" : "secondary"}
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground/60 hover:text-foreground"
            aria-label={isPropertiesCollapsed ? "Show properties" : "Hide properties"}
            onClick={toggleProperties}
          >
            <PanelRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Content + Properties split */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={100} minSize={40}>
            <div className="h-full overflow-y-auto overscroll-contain px-6 py-5">
              <ContentComponent />
            </div>
          </Panel>
          <PanelResizeHandle className={cn(
            "bg-transparent relative group transition-[width,opacity] duration-150",
            isPropertiesCollapsed
              ? "w-0 pointer-events-none opacity-0"
              : "w-2 hover:bg-muted/60 data-[resize-handle-active]:bg-muted/80"
          )}>
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-foreground/20 data-[resize-handle-active]:bg-foreground/25 transition-colors duration-150" />
          </PanelResizeHandle>
          <Panel
            ref={propertiesPanelRef}
            defaultSize={0}
            minSize={20}
            collapsible
            collapsedSize={0}
            onCollapse={() => setIsPropertiesCollapsed(true)}
            onExpand={() => setIsPropertiesCollapsed(false)}
          >
            <PropertiesPanel itemId={itemId} />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  )
}
